import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

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

    // Extraemos el correo del usuario (Mercado Pago lo exige para suscripciones)
    const userEmail = user.emailAddresses[0]?.emailAddress;

    let suscripcion = await prisma.suscripcion.findUnique({
      where: { userId: user.id }
    });

    if (!suscripcion) {
      suscripcion = await prisma.suscripcion.create({
        data: { userId: user.id }
      });
    }

    // Usamos PreApproval (Suscripción individual ligada a este usuario)
    const preApproval = new PreApproval(client);
    
    const sub = await preApproval.create({
      body: {
        reason: 'LitisApp Pro - Suscripción Mensual',
        external_reference: user.id, // Para saber quién pagó en el webhook
        payer_email: userEmail,      // OBLIGATORIO para Mercado Pago
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 59900,
          currency_id: 'COP'
        },
        back_url: `${process.env.APP_URL}/dashboard/suscripcion?success=true`,
        status: 'pending'
      }
    });

    return NextResponse.json({ url: sub.init_point });

  } catch (error) {
    // Mejoramos el registro del error para que Vercel nos diga exactamente qué falló
    console.error("[MERCADOPAGO_ERROR]", error);
    return NextResponse.json(
      { error: "Error en Mercado Pago", detalle: error.message }, 
      { status: 500 }
    );
  }
}