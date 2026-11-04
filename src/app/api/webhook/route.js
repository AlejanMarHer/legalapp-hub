import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
});

export async function POST(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let topic = searchParams.get('topic') || searchParams.get('type');
    let id = searchParams.get('data.id') || searchParams.get('id');

    try {
      const body = await request.json();
      if (!topic) topic = body.type || body.topic || body.action;
      if (!id) id = body.data?.id;
    } catch (e) {}

    if (!id || !topic) return new NextResponse("Faltan datos", { status: 400 });

    console.log(`[WEBHOOK RECIBIDO] Topic: ${topic} | ID: ${id}`);

    if (topic === 'subscription_preapproval') {
      const preApproval = new PreApproval(client);
      const subData = await preApproval.get({ id });
      
      console.log(`[DATOS] Status: ${subData.status} | Plan ID: ${subData.preapproval_plan_id}`);

      if (subData.status === 'authorized' && subData.preapproval_plan_id) {
        // Buscamos al usuario que generó este Plan de Pago específico
        const suscripcion = await prisma.suscripcion.findFirst({
          where: { mpPreapprovalId: subData.preapproval_plan_id }
        });

        if (suscripcion) {
          const fechaVencimiento = new Date();
          fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);

          await prisma.suscripcion.update({
            where: { id: suscripcion.id },
            data: {
              plan: 'PRO',
              estadoPago: 'authorized',
              mpPreapprovalId: subData.id, // Reemplazamos el plan por la suscripción real
              fechaVencimiento: fechaVencimiento
            }
          });
          console.log(`[EXITO] Usuario actualizado a PRO.`);
        } else {
          console.log(`[ALERTA] No se encontró usuario para el Plan ID.`);
        }
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[WEBHOOK_ERROR]", error);
    return new NextResponse("OK", { status: 200 });
  }
}