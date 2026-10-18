import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function DetalleCasoPage({ params }) {
  const user = await currentUser();
  if (!user) redirect('/');

  const resolvedParams = await params;
  const casoId = resolvedParams.id;

  const caso = await prisma.caso.findFirst({
    where: { 
      id: casoId, 
      userId: user.id 
    },
    include: { 
      liquidaciones: { orderBy: { createdAt: 'desc' } } 
    }
  });

  if (!caso) redirect('/dashboard/casos');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <main className="flex-1 p-8 max-w-5xl mx-auto">
        
        {/* Encabezado */}
        <div className="mb-8">
          <Link href="/dashboard/casos" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Volver a mis expedientes
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Expediente Digital</h1>
          <p className="text-gray-500 mt-2 font-medium">Gestión documental y cálculos del proceso.</p>
        </div>

        {/* Tarjeta Principal de Información */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#1E3A8A]"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Partes Procesales</p>
              <p className="text-xl font-bold text-gray-800">{caso.demandante}</p>
              <p className="text-sm font-bold text-red-500 my-1">CONTRA</p>
              <p className="text-xl font-bold text-gray-800">{caso.demandado}</p>
            </div>
            <div>
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Radicado</p>
                <p className="text-lg font-mono text-blue-900 bg-blue-50 inline-block px-3 py-1 rounded-md border border-blue-100">{caso.radicado || 'Sin radicado'}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Juzgado</p>
                <p className="text-md font-medium text-gray-700">{caso.juzgado || 'No especificado'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Inferior: Herramientas e Historial */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Acciones Rápidas */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
               Nueva Liquidación
            </h3>
            <Link href={`/dashboard/intereses?casoId=${caso.id}`} className="block w-full bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:border-blue-500 hover:shadow-md transition text-left group">
              <span className="block font-bold text-[#1E3A8A] group-hover:text-blue-600 transition">Calcular Intereses</span>
              <span className="text-xs text-gray-500 mt-1 block">Corrientes y moratorios (SFC)</span>
            </Link>
            <Link href={`/dashboard/indexacion?casoId=${caso.id}`} className="block w-full bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:border-blue-500 hover:shadow-md transition text-left group">
              <span className="block font-bold text-[#1E3A8A] group-hover:text-blue-600 transition">Actualizar Capital</span>
              <span className="text-xs text-gray-500 mt-1 block">Fórmula de Indexación (DANE)</span>
            </Link>
            <Link href={`/dashboard/laboral?casoId=${caso.id}`} className="block w-full bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:border-blue-500 hover:shadow-md transition text-left group">
              <span className="block font-bold text-[#1E3A8A] group-hover:text-blue-600 transition">Liquidador Laboral</span>
              <span className="text-xs text-gray-500 mt-1 block">Prestaciones e indemnizaciones</span>
            </Link>
          </div>

          {/* Columna Derecha: Historial de Liquidaciones */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Historial de Cálculos Guardados</h3>
            
            {caso.liquidaciones.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <p className="text-gray-500 font-medium">No hay cálculos asociados a este expediente.</p>
                <p className="text-sm text-gray-400 mt-2">Selecciona una herramienta a la izquierda para empezar.</p>
              </div>
            ) : (
              <div className="space-y-4">
                 {/* === MAPEO DE LIQUIDACIONES GUARDADAS === */}
                 {caso.liquidaciones.map((liq) => (
                    <div key={liq.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">{liq.tipo}</span>
                          <p className="text-sm text-gray-500 mt-2 font-medium">
                            Guardado el: {new Date(liq.createdAt).toLocaleDateString('es-CO')} a las {new Date(liq.createdAt).toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p className="text-sm text-slate-500 mb-1 font-bold">GRAN TOTAL LIQUIDADO:</p>
                        <p className="text-2xl font-black text-emerald-700">
                          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(liq.datos?.granTotalFinal || 0)}
                        </p>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 line-clamp-2 italic">"{liq.datos?.textoMemorial}"</p>
                      </div>
                    </div>
                 ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}