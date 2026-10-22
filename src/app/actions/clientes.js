"use server";

import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// 1. Obtener todos los clientes (Incluyendo cuántos casos tienen)
export async function obtenerClientes() {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  return await prisma.cliente.findMany({
    where: { userId: user.id },
    include: {
      _count: {
        select: { casos: true } 
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

// 2. Crear un nuevo cliente
export async function crearCliente(data) {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  return await prisma.cliente.create({
    data: {
      nombre: data.nombre,
      identificacion: data.identificacion || null,
      email: data.email || null,
      telefono: data.telefono || null,
      direccion: data.direccion || null,
      notas: data.notas || null,
      userId: user.id
    }
  });
}

// 3. Eliminar un cliente
export async function eliminarCliente(id) {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  const cliente = await prisma.cliente.findUnique({ where: { id } });
  if (!cliente || cliente.userId !== user.id) throw new Error("No autorizado");

  const expedientesAsociados = await prisma.caso.count({ where: { clienteId: id } });
  if (expedientesAsociados > 0) {
    throw new Error("No puedes eliminar un cliente que tiene expedientes asociados. Borra primero los expedientes.");
  }

  return await prisma.cliente.delete({
    where: { id }
  });
}

// 4. Actualizar un cliente existente
export async function actualizarCliente(id, data) {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  const cliente = await prisma.cliente.findUnique({ where: { id } });
  if (!cliente || cliente.userId !== user.id) throw new Error("No autorizado");

  return await prisma.cliente.update({
    where: { id },
    data: {
      nombre: data.nombre,
      identificacion: data.identificacion || null,
      email: data.email || null,
      telefono: data.telefono || null,
      direccion: data.direccion || null,
      notas: data.notas || null,
    }
  });
}