"use server";

import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// 1. Obtener todos tus argumentos
export async function obtenerArgumentos() {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  return await prisma.argumento.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });
}

// 2. Guardar un nuevo argumento/jurisprudencia
export async function crearArgumento(data) {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  return await prisma.argumento.create({
    data: {
      titulo: data.titulo,
      contenido: data.contenido,
      ramaDerecho: data.ramaDerecho || "General",
      palabrasClave: data.palabrasClave || "",
      userId: user.id
    }
  });
}

// 3. Eliminar un argumento
export async function eliminarArgumento(id) {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  // Verificamos que el argumento sea tuyo antes de borrarlo
  const argumento = await prisma.argumento.findUnique({ where: { id } });
  if (!argumento || argumento.userId !== user.id) throw new Error("No autorizado");

  return await prisma.argumento.delete({
    where: { id }
  });
}