import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';

// Puente seguro de base de datos para Next.js
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function CasosPage() {
  const user = await currentUser();
  if (!user) redirect('/');

  // Consulta a la base de datos: Traer los casos de este abogado específico
  const casos = await prisma.caso.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Barra Lateral */}
      <aside className="w-64 bg-[#1E3A8A] text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-blue-800">
          <h2 className="text-2xl font-bold">LitisApp</h2>
          <p className="text-blue-300 text-sm mt-1">Despacho Virtual</p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link href="/dashboard" className="block p-3 text-blue-200 hover:bg-blue-800 rounded-md transition">
                Mis Herramientas
              </Link>
            </li>
            <li className="bg-blue-800 rounded-md p-3 font-medium">Mis Casos</li>
          </ul>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Expedientes Activos</h1>
            <p className="text-gray-500 mt-2 font-medium">Gestiona y consulta el historial de tus procesos judiciales.</p>
          </div>
          {/* Botón Superior - Ahora es un Link */}
          <Link href="/dashboard/casos/nuevo" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Nuevo Expediente
          </Link>
        </div>

        {casos.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No tienes expedientes registrados</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Comienza creando tu primer caso para centralizar radicados, partes procesales y guardar el historial de tus liquidaciones.</p>
            {/* Botón Central - Ahora es un Link */}
            <Link href="/dashboard/casos/nuevo" className="inline-block bg-[#1E3A8A] text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-800 shadow-lg transition-all">
              Crear mi primer caso
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-slate-50 border-b border-gray-200 text-slate-700 uppercase tracking-wider text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">Radicado / Partes</th>
                  <th className="px-6 py-4">Juzgado</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {casos.map(caso => (
                  <tr key={caso.id} className="hover:bg-blue-50/50 transition duration-150">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-900 text-base">{caso.radicado || 'Sin radicado asignado'}</div>
                      <div className="text-sm text-slate-500 mt-1 font-medium">{caso.demandante} <span className="text-red-400 font-bold mx-1">VS</span> {caso.demandado}</div>
                    </td>
                    <td className="px-6 py-5 font-medium text-slate-700">{caso.juzgado || 'No especificado'}</td>
                    <td className="px-6 py-5 text-center">
                      <span className="bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-black tracking-wide">
                        {caso.estado}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition">
                        Abrir Expediente
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}