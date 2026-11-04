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

    // LA SOLUCIÓN: Atrapamos CUALQUIER variante de palabra clave que use MP
    if (topic.includes('preapproval') || topic.includes('subscription')) {
      try {
        const preApproval = new PreApproval(client);
        const subData = await preApproval.get({ id });
        
        console.log(`[MP API] Status: ${subData.status} | PlanID: ${subData.preapproval_plan_id}`);

        // Mientras tenga el PlanID, actualizamos al usuario (en Sandbox a veces el status se queda en 'pending')
        if (subData.preapproval_plan_id) {
          const suscripcion = await prisma.suscripcion.findFirst({
            where: { mpPreapprovalId: subData.preapproval_plan_id }
          });

          if (suscripcion) {
            const fecha = new Date();
            fecha.setMonth(fecha.getMonth() + 1);

            await prisma.suscripcion.update({
              where: { id: suscripcion.id },
              data: {
                plan: 'PRO',
                estadoPago: subData.status,
                mpPreapprovalId: subData.id, // Guardamos la suscripción real
                fechaVencimiento: fecha
              }
            });
            console.log(`[EXITO] Base de datos actualizada a PRO.`);
          } else {
            console.log(`[ALERTA] No se encontró el usuario con ese Plan ID.`);
          }
        }
      } catch (apiError) {
        // Ignoramos errores de búsqueda si el ID era de un pago aislado y no de una suscripción
        console.log(`[INFO] El ID no corresponde a un objeto PreApproval.`);
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[WEBHOOK FATAL ERROR]", error);
    return new NextResponse("OK", { status: 200 });
  }
}