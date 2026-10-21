import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { obtenerTareas } from '@/app/actions/tareas';
import TableroCliente from './TableroCliente';

export const dynamic = 'force-dynamic';

export default async function TareasPage() {
  const user = await currentUser();
  if (!user) redirect('/');

  // Traemos todas tus tareas de la base de datos
  const tareas = await obtenerTareas();

  return <TableroCliente tareasIniciales={tareas} />;
}