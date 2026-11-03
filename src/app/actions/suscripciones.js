"use server"

import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// Límite comercial para usuarios gratuitos
const LIMITE_CASOS_GRATIS = 5; 

export async function verificarEstadoSuscripcion() {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  const emailUsuario = user.emailAddresses[0]?.emailAddress;
  const emailAdmin = process.env.ADMIN_EMAIL;

  // 1. PASE VIP: Si eres tú, tienes acceso absoluto a todo siempre.
  if (emailAdmin && emailUsuario === emailAdmin) {
    return {
      esPro: true,
      esAdmin: true,
      plan: "VIP",
      limiteAlcanzado: false
    };
  }

  // 2. Buscamos el plan del abogado en la base de datos
  const suscripcion = await prisma.suscripcion.findUnique({
    where: { userId: user.id }
  });

  const planActual = suscripcion?.plan || "GRATIS";
  const esPro = planActual === "PRO";

  // 3. Verificamos si es un usuario GRATIS y contamos cuántos casos tiene
  let limiteAlcanzado = false;
  if (!esPro) {
    const totalCasos = await prisma.caso.count({
      where: { userId: user.id }
    });
    limiteAlcanzado = totalCasos >= LIMITE_CASOS_GRATIS;
  }

  return {
    esPro,
    esAdmin: false,
    plan: planActual,
    limiteAlcanzado
  };
}