import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { obtenerClientes } from '@/app/actions/clientes';
import ClientesCliente from './ClientesCliente';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ClientesPage() {
  const user = await currentUser();
  if (!user) redirect('/');

  const clientes = await obtenerClientes();

  return (
    <>
      <ClientesCliente clientesIniciales={clientes} />
      
      {/* BOTÓN FLOTANTE LITIS IA */}
      <Link 
        href="/dashboard/asistente" 
        className="fixed bottom-8 right-8 bg-[#1E3A8A] hover:bg-blue-800 text-white p-4 rounded-full shadow-[0_10px_25px_rgba(30,58,138,0.5)] flex items-center justify-center gap-3 transition-all hover:scale-105 z-50 group border-2 border-blue-400/30"
      >
        <div className="relative">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#1E3A8A] rounded-full animate-pulse"></span>
        </div>
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[200px] transition-all duration-300 ease-in-out font-black text-sm pr-0 group-hover:pr-2">
          Consultar a Litis IA
        </span>
      </Link>
    </>
  );
}