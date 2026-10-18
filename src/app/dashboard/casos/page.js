import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function CasosPage() {
  const user = await currentUser();
  if (!user) redirect('/');

  // Obtener los casos del usuario actual, ordenados del más reciente al más antiguo
  const casos = await prisma.caso.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      
      {/* Encabezado y botón de Nuevo Expediente */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Expedientes Activos</h1>
          <p className="text-gray-500 mt-2 font-medium">Gestiona y consulta el historial de tus procesos judiciales.</p>
        </div>
        <Link 
          href="/dashboard/casos/nuevo" 
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          Nuevo Expediente
        </Link>
      </div>

      {/* Tabla de Expedientes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {casos.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Aún no tienes expedientes</h3>
            <p className="text-gray-500 mb-6">Crea tu primer expediente para empezar a guardar tus liquidaciones.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Radicado / Partes</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Juzgado</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Estado</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {casos.map((caso) => (
                  <tr key={caso.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900 text-base">{caso.radicado || 'Sin radicado'}</div>
                      <div className="text-sm font-medium text-gray-500 mt-1">
                        {caso.demandante} <span className="text-red-400 text-xs font-bold mx-1">VS</span> {caso.demandado}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                      {caso.juzgado || '-'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                        Activo
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link 
                        href={`/dashboard/casos/${caso.id}`}
                        className="inline-flex font-bold text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition"
                      >
                        Abrir Expediente
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}