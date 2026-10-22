"use server"

import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export async function guardarActualizacionRadar(casoId, nombreActuacion, fechaActuacionTexto) {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  const caso = await prisma.caso.findUnique({ where: { id: casoId } });
  if (!caso || caso.userId !== user.id) throw new Error("Expediente no encontrado");

  // Validar si es una actuación nueva
  const esNueva = caso.radarUltimaActuacion !== nombreActuacion;
  const alerta = esNueva ? true : caso.radarAlerta;

  await prisma.caso.update({
    where: { id: casoId },
    data: {
      radarUltimaConsulta: new Date(),
      radarUltimaActuacion: nombreActuacion,
      radarFechaActuacion: new Date(fechaActuacionTexto),
      radarAlerta: alerta
    }
  });

  return { 
    exito: true, 
    mensaje: esNueva ? "¡Nueva actuación detectada!" : "Proceso al día, sin cambios.",
    nueva: esNueva
  };
}

export async function marcarRadarFallido(casoId) {
  await prisma.caso.update({
    where: { id: casoId },
    data: {
      radarUltimaConsulta: new Date(),
    }
  });
}

export async function limpiarAlertaRadar(casoId) {
  await prisma.caso.update({
    where: { id: casoId },
    data: { radarAlerta: false }
  });
  return true;
}