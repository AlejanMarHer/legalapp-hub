import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { obtenerConfiguracion } from '@/app/actions/configuracion';
import ConfiguracionCliente from './ConfiguracionCliente';

export const dynamic = 'force-dynamic';

export default async function ConfiguracionPage() {
  const user = await currentUser();
  if (!user) redirect('/');

  // Traemos tu logo y firma guardados en la base de datos
  const config = await obtenerConfiguracion();

  return <ConfiguracionCliente configInicial={config} />;
}