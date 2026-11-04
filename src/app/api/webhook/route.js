import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
});

export async function POST(request) {
  try {
    // Mercado Pago a veces envía los datos por la URL y otras por el cuerpo del JSON
    const searchParams = request.nextUrl.searchParams;
    let topic = searchParams.get('topic') || searchParams.get('type');
    let id = searchParams.get('data.id') || searchParams.get('id');

    // Intentamos extraer del JSON si no vienen en la URL
    try {
      const body = await request.json();
      if (!topic) topic = body.type || body.topic || body.action;
      if (!id) id = body.data?.id;
    } catch (e) {
      // Ignorar si no hay JSON
    }

    if (!id || !topic) {
      return new NextResponse("Faltan parámetros", { status: 400 });
    }

    // 1. ESCUCHAR PAGOS APROBADOS (Maneja el cobro de la tarjeta)
    if (topic === 'payment' || topic === 'payment.created') {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id });
      
      if (paymentData.status === 'approved' && paymentData.external_reference) {
        const userId = paymentData.external_reference;
        
        // Al pagar, le damos 1 mes de acceso Pro desde hoy
        const fechaVencimiento = new Date();
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);

        await prisma.suscripcion.upsert({
          where: { userId: userId },
          update: {
            plan: 'PRO',
            estadoPago: 'approved',
            fechaVencimiento: fechaVencimiento
          },
          create: {
            userId: userId,
            plan: 'PRO',
            estadoPago: 'approved',
            fechaVencimiento: fechaVencimiento
          }
        });
      }
    }

    // 2. ESCUCHAR CREACIÓN DE SUSCRIPCIONES (Guarda el ID del débito automático)
    if (topic === 'subscription_preapproval') {
      const preApproval = new PreApproval(client);
      const subData = await preApproval.get({ id });
      
      if (subData.status === 'authorized' && subData.external_reference) {
        await prisma.suscripcion.updateMany({
          where: { userId: subData.external_reference },
          data: {
            mpPreapprovalId: subData.id,
            estadoPago: 'authorized',
            plan: 'PRO'
          }
        });
      }
    }

    // Siempre debemos responder 200 OK rápido para que MP sepa que recibimos el mensaje
    return new NextResponse("OK", { status: 200 });

  } catch (error) {
    console.error("[WEBHOOK_ERROR]", error);
    // Respondemos 200 incluso si fallamos, para que MP no bloquee nuestra API con reintentos infinitos
    return new NextResponse("OK", { status: 200 });
  }
}