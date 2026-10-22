import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { obtenerClientes } from '@/app/actions/clientes';
import ClientesCliente from './ClientesCliente';

export const dynamic = 'force-dynamic';

export default async function ClientesPage() {
  const user = await currentUser();
  if (!user) redirect('/');

  const clientes = await obtenerClientes();

  return <ClientesCliente clientesIniciales={clientes} />;
}