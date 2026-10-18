'use server'

import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export async function guardarLiquidacionBd(casoId, tipo, datosLiquidacion) {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  // Guardamos el cálculo en la tabla Liquidacion
  await prisma.liquidacion.create({
    data: {
      tipo: tipo,
      datos: datosLiquidacion,
      casoId: casoId
    }
  });

  // Refrescamos la vista del expediente para que aparezca al instante
  revalidatePath(`/dashboard/casos/${casoId}`);
  
  return { success: true };
}