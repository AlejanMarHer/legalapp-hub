import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import BotonEditarCliente from './BotonEditarCliente';

export const dynamic = 'force-dynamic';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function ClienteDetallePage({ params }) {
  const user = await currentUser();
  if (!user) redirect('/');

  const resolvedParams = await params;
  const clienteId = resolvedParams.id;

  // Traemos al cliente y TODOS los casos que le pertenecen
  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    include: {
      casos: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!cliente || cliente.userId !== user.id) {
    return <div className="p-8 text-center text-red-500 font-bold">Cliente no encontrado o sin permisos.</div>;
  }

  const formatCOP = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navegación Superior */}
        <Link href="/dashboard/clientes" className="inline-flex items-center text-sm font-semibold text-[#1E3A8A] hover:text-blue-700 transition gap-1.5 bg-white border border-blue-100 px-4 py-2 rounded-xl shadow-sm w-fit">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Volver al Directorio
        </Link>

        {/* Encabezado del Cliente */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#1E3A8A] to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg shrink-0">
              {cliente.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Perfil de Cliente</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{cliente.nombre}</h1>
              <p className="text-slate-500 font-medium mt-1">Registrado el {new Date(cliente.createdAt).toLocaleDateString('es-CO')}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row w-full md:w-auto mt-4 md:mt-0 gap-3">
            <BotonEditarCliente cliente={cliente} />
            <Link 
              href={`/dashboard/casos/nuevo?clienteId=${cliente.id}&nombre=${encodeURIComponent(cliente.nombre)}`}
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
              Nuevo Expediente
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMNA IZQUIERDA: CRM y Contacto */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 border-b border-slate-100 pb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/></svg>
                Datos de Contacto
              </h3>
              
              <ul className="space-y-4">
                <li>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Identificación (NIT/CC)</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{cliente.identificacion || 'No registrada'}</p>
                </li>
                <li>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Teléfono / Celular</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{cliente.telefono || 'No registrado'}</p>
                </li>
                <li>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Correo Electrónico</p>
                  <p className="text-sm font-bold text-blue-600 mt-0.5 break-all">{cliente.email || 'No registrado'}</p>
                </li>
                <li>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Dirección</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{cliente.direccion || 'No registrada'}</p>
                </li>
              </ul>
            </div>

            {cliente.notas && (
              <div className="bg-yellow-50 p-6 rounded-3xl shadow-sm border border-yellow-100">
                <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wider mb-3">Notas Internas</h3>
                <p className="text-sm text-yellow-900 leading-relaxed whitespace-pre-wrap">{cliente.notas}</p>
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: Expedientes del Cliente */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Portafolio de Expedientes</h3>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">{cliente.casos.length} Asociados</span>
              </div>

              {cliente.casos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cliente.casos.map(caso => (
                    <Link key={caso.id} href={`/dashboard/casos/${caso.id}`} className="block bg-slate-50 border border-slate-200 hover:border-[#1E3A8A] hover:shadow-md transition-all p-5 rounded-2xl group">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${caso.estadoInterno === 'Activo' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
                          {caso.estadoInterno || 'Activo'}
                        </span>
                        <svg className="w-5 h-5 text-slate-300 group-hover:text-[#1E3A8A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                      </div>
                      
                      <h4 className="font-bold text-slate-900 text-sm mb-1 truncate" title={caso.radicado}>{caso.radicado || 'Sin Radicado'}</h4>
                      <p className="text-xs font-semibold text-slate-500 truncate mb-3">{caso.juzgado || 'Despacho sin asignar'}</p>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Cuantía</span>
                        <span className="text-xs font-black text-emerald-600">{formatCOP(caso.cuantia)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                  </div>
                  <p className="text-slate-600 font-bold">No hay expedientes activos</p>
                  <p className="text-slate-500 text-sm mt-1 mb-4 px-4">Utiliza el botón superior para crearle el primer caso a este cliente.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}