"use server"

import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// Helper para fechas
const parseDate = (d) => d ? new Date(d) : null;

// 1. Crear Nuevo Expediente
export async function guardarNuevoExpediente(data) {
  const user = await currentUser();
  if (!user) throw new Error("Usuario no autenticado");

  const nuevoCaso = await prisma.caso.create({
    data: {
      userId: user.id,
      radicado: data.radicado || null,
      juzgado: data.juzgado || null,
      ciudad: data.ciudad || "Bogotá D.C.",
      areaDerecho: data.areaDerecho || "Civil",
      claseProceso: data.claseProceso || null,
      estadoInterno: data.estadoInterno || "Activo",
      demandante: data.demandante,
      idDemandante: data.idDemandante || null,
      demandado: data.demandado,
      idDemandado: data.idDemandado || null,
      calidadProcesal: data.calidadProcesal || "Apoderado Demandante",
      cuantia: parseFloat(data.cuantia) || 0,
      capitalBase: parseFloat(data.capitalBase) || 0,
      honorariosPactados: data.honorariosPactados || null,
      saldoHonorarios: parseFloat(data.saldoHonorarios) || 0,
      telCliente: data.telCliente || null,
      emailCliente: data.emailCliente || null,
      dirCliente: data.dirCliente || null,
      notasContacto: data.notasContacto || null,
      abogadoContraparte: data.abogadoContraparte || null,
      emailContraparte: data.emailContraparte || null,
      telContraparte: data.telContraparte || null,
      fechaPresentacion: parseDate(data.fechaPresentacion),
      fechaAdmision: parseDate(data.fechaAdmision),
      fechaVencimiento: parseDate(data.fechaVencimiento),
      descVencimiento: data.descVencimiento || null,
      resumenHechos: data.resumenHechos || null,
      apuntesPrivados: data.apuntesPrivados || null,
    }
  });

  return nuevoCaso.id;
}

// 2. Obtener un Expediente para Editarlo
export async function obtenerExpediente(id) {
  const user = await currentUser();
  if (!user) throw new Error("Usuario no autenticado");

  const caso = await prisma.caso.findUnique({ where: { id } });
  if (!caso || caso.userId !== user.id) throw new Error("Expediente no encontrado o sin acceso");
  
  return caso;
}

// 3. Actualizar un Expediente Existente
export async function actualizarExpediente(id, data) {
  const user = await currentUser();
  if (!user) throw new Error("Usuario no autenticado");

  const casoActualizado = await prisma.caso.update({
    where: { id },
    data: {
      radicado: data.radicado || null,
      juzgado: data.juzgado || null,
      ciudad: data.ciudad || "Bogotá D.C.",
      areaDerecho: data.areaDerecho || "Civil",
      claseProceso: data.claseProceso || null,
      estadoInterno: data.estadoInterno || "Activo",
      demandante: data.demandante,
      idDemandante: data.idDemandante || null,
      demandado: data.demandado,
      idDemandado: data.idDemandado || null,
      calidadProcesal: data.calidadProcesal || "Apoderado Demandante",
      cuantia: parseFloat(data.cuantia) || 0,
      capitalBase: parseFloat(data.capitalBase) || 0,
      honorariosPactados: data.honorariosPactados || null,
      saldoHonorarios: parseFloat(data.saldoHonorarios) || 0,
      telCliente: data.telCliente || null,
      emailCliente: data.emailCliente || null,
      dirCliente: data.dirCliente || null,
      notasContacto: data.notasContacto || null,
      abogadoContraparte: data.abogadoContraparte || null,
      emailContraparte: data.emailContraparte || null,
      telContraparte: data.telContraparte || null,
      fechaPresentacion: parseDate(data.fechaPresentacion),
      fechaAdmision: parseDate(data.fechaAdmision),
      fechaVencimiento: parseDate(data.fechaVencimiento),
      descVencimiento: data.descVencimiento || null,
      resumenHechos: data.resumenHechos || null,
      apuntesPrivados: data.apuntesPrivados || null,
    }
  });

  return casoActualizado.id;
}