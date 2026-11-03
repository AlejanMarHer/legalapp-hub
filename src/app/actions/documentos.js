"use server"

import { put } from '@vercel/blob';
import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

/**
 * Sube un archivo PDF a Vercel Blob y guarda el registro en Prisma
 */
export async function subirDocumentoExpediente(formData) {
  const user = await currentUser();
  if (!user) throw new Error("No autorizado. Inicia sesión.");

  const file = formData.get('file');
  const casoId = formData.get('casoId');

  if (!file || !casoId) {
    throw new Error("Faltan datos obligatorios (archivo o ID del caso).");
  }

  try {
    const nombreLimpio = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // CAMBIO CLAVE: Usamos access: 'private' para que coincida con tu Blob Store de Vercel
    const blob = await put(`expedientes/${casoId}/${nombreLimpio}`, file, {
      access: 'private', 
    });

    const nuevoDocumento = await prisma.documento.create({
      data: {
        nombre: file.name,
        urlArchivo: blob.url,
        tamanoBytes: file.size,
        casoId: casoId
      }
    });

    revalidatePath(`/dashboard/casos/${casoId}`);

    return { exito: true, documento: nuevoDocumento };

  } catch (error) {
    console.error("Error subiendo el documento a Vercel Blob:", error);
    return { exito: false, mensaje: error.message };
  }
}

/**
 * Obtiene todos los documentos asociados a un expediente
 */
export async function obtenerDocumentosCaso(casoId) {
  const user = await currentUser();
  if (!user) throw new Error("No autorizado.");

  const caso = await prisma.caso.findFirst({
    where: { 
      id: casoId,
      userId: user.id 
    }
  });

  if (!caso) throw new Error("Expediente no encontrado o sin permisos.");

  const documentos = await prisma.documento.findMany({
    where: { casoId: casoId },
    orderBy: { createdAt: 'desc' }
  });

  return documentos;
}