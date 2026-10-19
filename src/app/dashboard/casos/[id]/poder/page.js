import React from 'react';
import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import GeneradorWord from './GeneradorWord';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function GeneradorPoderPage({ params }) {
  const user = await currentUser();
  if (!user) redirect('/');

  // Obtenemos los datos del expediente actual desde Prisma
  const casoId = params.id;
  const caso = await prisma.caso.findUnique({
    where: { id: casoId }
  });

  if (!caso) return <div className="p-10 font-bold text-red-600">Expediente no encontrado en la base de datos.</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div>
          <Link href={`/dashboard/casos/${casoId}`} className="inline-flex items-center text-sm font-semibold text-[#1E3A8A] hover:text-blue-700 transition gap-1.5 bg-white border border-blue-100 px-4 py-2 rounded-xl shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Volver al Expediente
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] p-8 md:p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-500/20 text-blue-300 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Generador de Poder Especial</h1>
            <p className="text-slate-300 mt-2 font-medium max-w-lg">
              El sistema redactará el documento mapeando automáticamente las variables del radicado <span className="text-white font-bold">{caso.radicado || 'seleccionado'}</span>.
            </p>
          </div>

          <div className="p-8 md:p-10 space-y-8 flex flex-col items-center">
            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Variables inyectadas en tiempo real:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
                <li><strong className="text-slate-900">Juzgado:</strong> {caso.juzgado || 'Pendiente por definir'}</li>
                <li><strong className="text-slate-900">Demandante:</strong> {caso.demandante}</li>
                <li><strong className="text-slate-900">Demandado:</strong> {caso.demandado}</li>
                <li><strong className="text-slate-900">Clase de Proceso:</strong> {caso.claseProceso || 'Pendiente'}</li>
              </ul>
            </div>

            <GeneradorWord caso={caso} emailAbogado={user.emailAddresses[0].emailAddress} />
            
            <p className="text-xs text-slate-400 text-center max-w-sm">
              Al hacer clic, el documento se descargará en formato .doc editable. Revisa los datos de identificación faltantes antes de imprimir y firmar.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}