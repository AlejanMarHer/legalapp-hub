import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { MercadoPagoConfig, PreApprovalPlan } from 'mercadopago';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// Inicializamos el SDK de Mercado Pago con tu Access Token
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 } 
});

export async function POST(request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    // 1. Aseguramos el registro en la base de datos
    let suscripcion = await prisma.suscripcion.findUnique({
      where: { userId: user.id }
    });

    if (!suscripcion) {
      suscripcion = await prisma.suscripcion.create({
        data: { userId: user.id }
      });
    }

    // 2. Creamos el plan de cobro recurrente en Mercado Pago
    const preApprovalPlan = new PreApprovalPlan(client);
    
    const plan = await preApprovalPlan.create({
      body: {
        reason: 'LitisApp Pro - Suscripción Mensual',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 59900,
          currency_id: 'COP' // Moneda local
        },
        back_url: `${process.env.APP_URL}/dashboard/suscripcion?success=true`,
        // external_reference es VITAL: Nos permite identificar quién pagó cuando MP envíe la confirmación
        external_reference: user.id, 
      }
    });

    // 3. Redirigimos al usuario a la pasarela segura de Mercado Pago (init_point)
    // Usamos el status 303 (See Other) para que el formulario POST se transforme en un GET hacia MP
    return NextResponse.redirect(plan.init_point, { status: 303 });

  } catch (error) {
    console.error("[MERCADOPAGO_ERROR]", error);
    return new NextResponse("Error interno al crear checkout", { status: 500 });
  }
}