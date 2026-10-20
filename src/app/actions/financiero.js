"use server";

import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export async function registrarAbono(casoId, monto, concepto) {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  // 1. Buscamos el caso para saber cuánto debe el cliente actualmente
  const caso = await prisma.caso.findUnique({ where: { id: casoId } });
  if (!caso) throw new Error("Expediente no encontrado");

  const saldoActual = caso.saldoHonorarios || 0;
  const valorAbono = parseFloat(monto);

  // 2. Registramos el recibo del dinero en la nueva tabla
  const nuevoAbono = await prisma.abono.create({
    data: {
      monto: valorAbono,
      concepto: concepto || "Abono a honorarios profesionales",
      casoId: casoId
    }
  });

  // 3. Matemáticas: Restamos el abono del saldo (evitando que quede en números negativos)
  const nuevoSaldo = saldoActual - valorAbono;
  
  await prisma.caso.update({
    where: { id: casoId },
    data: { 
      saldoHonorarios: nuevoSaldo < 0 ? 0 : nuevoSaldo 
    }
  });

  return nuevoAbono;
}