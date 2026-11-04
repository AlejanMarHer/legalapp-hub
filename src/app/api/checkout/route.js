import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { MercadoPagoConfig, PreApprovalPlan } from 'mercadopago';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 } 
});

export async function POST(request) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("No autorizado", { status: 401 });

    const preApprovalPlan = new PreApprovalPlan(client);
    
    const plan = await preApprovalPlan.create({
      body: {
        reason: 'LitisApp Pro - Suscripción Mensual',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 59900,
          currency_id: 'COP'
        },
        back_url: `${process.env.APP_URL}/dashboard/suscripcion?success=true`
      }
    });

    // EL TRUCO: Guardamos el ID del enlace de pago (Plan) asociado a este usuario temporalmente
    await prisma.suscripcion.upsert({
      where: { userId: user.id },
      update: { mpPreapprovalId: plan.id },
      create: { userId: user.id, mpPreapprovalId: plan.id }
    });

    return NextResponse.json({ url: plan.init_point });
  } catch (error) {
    console.error("[MERCADOPAGO_ERROR]", error);
    return NextResponse.json({ error: "Error en Mercado Pago" }, { status: 500 });
  }
}