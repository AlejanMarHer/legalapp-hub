"use server";

import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// 1. Obtener todas tus tareas
export async function obtenerTareas() {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  return await prisma.tarea.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });
}

// 2. Crear una nueva tarea
export async function crearTarea(data) {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  return await prisma.tarea.create({
    data: {
      titulo: data.titulo,
      descripcion: data.descripcion || "",
      estado: data.estado || "POR HACER",
      prioridad: data.prioridad || "Media",
      fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : null,
      userId: user.id
    }
  });
}

// 3. Mover la tarea de columna (Actualizar estado)
export async function actualizarEstadoTarea(id, nuevoEstado) {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  // Verificamos propiedad antes de actualizar
  const tarea = await prisma.tarea.findUnique({ where: { id } });
  if (!tarea || tarea.userId !== user.id) throw new Error("No autorizado");

  return await prisma.tarea.update({
    where: { id },
    data: { estado: nuevoEstado }
  });
}

// 4. Eliminar una tarea
export async function eliminarTarea(id) {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  const tarea = await prisma.tarea.findUnique({ where: { id } });
  if (!tarea || tarea.userId !== user.id) throw new Error("No autorizado");

  return await prisma.tarea.delete({
    where: { id }
  });
}