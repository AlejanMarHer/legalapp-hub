"use server";

import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// 1. Obtener la configuración actual del usuario
export async function obtenerConfiguracion() {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  let config = await prisma.configuracion.findUnique({
    where: { userId: user.id }
  });

  // Si es la primera vez, le creamos un perfil por defecto
  if (!config) {
    config = await prisma.configuracion.create({
      data: { 
        userId: user.id, 
        nombreDespacho: `Despacho de ${user.firstName} ${user.lastName}` 
      }
    });
  }
  
  return config;
}

// 2. Guardar o actualizar la imagen del logo, firma y nombre
export async function guardarConfiguracion(data) {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  return await prisma.configuracion.upsert({
    where: { userId: user.id },
    update: {
      nombreDespacho: data.nombreDespacho,
      logoBase64: data.logoBase64,
      firmaBase64: data.firmaBase64,
    },
    create: {
      userId: user.id,
      nombreDespacho: data.nombreDespacho,
      logoBase64: data.logoBase64,
      firmaBase64: data.firmaBase64,
    }
  });
}