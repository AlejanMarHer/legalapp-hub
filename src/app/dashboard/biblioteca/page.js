import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { obtenerArgumentos } from '@/app/actions/biblioteca';
import BibliotecaCliente from './BibliotecaCliente';

export const dynamic = 'force-dynamic';

export default async function BibliotecaPage() {
  const user = await currentUser();
  if (!user) redirect('/');

  // Obtenemos los argumentos directo de la base de datos
  const argumentos = await obtenerArgumentos();

  // Le pasamos los datos al componente visual interactivo
  return <BibliotecaCliente argumentosIniciales={argumentos} />;
}