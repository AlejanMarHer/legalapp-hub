import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import BotonReporteCliente from './BotonReporteCliente';

export const dynamic = 'force-dynamic';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function ExpedienteDetallePage({ params }) {
  const user = await currentUser();
  if (!user) redirect('/');

  const resolvedParams = await params;
  const casoId = resolvedParams.id;
  
  const caso = await prisma.caso.findUnique({
    where: { id: casoId },
    include: { liquidaciones: { orderBy: { createdAt: 'desc' } } }
  });

  if (!caso || caso.userId !== user.id) {
    return <div className="p-8 text-center text-red-500 font-bold">Expediente no encontrado o sin permisos.</div>;
  }

  const formatCOP = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val || 0);
  const formatFecha = (fecha) => fecha ? new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No registrada';

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navegación Superior */}
        <Link href="/dashboard/casos" className="inline-flex items-center text-sm font-semibold text-[#1E3A8A] hover:text-blue-700 transition gap-1.5 bg-white border border-blue-100 px-4 py-2 rounded-xl shadow-sm w-fit">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Volver a mis expedientes
        </Link>

        {/* Encabezado del Expediente y BOTONES DE ACCIÓN */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200">{caso.estadoInterno || 'Activo'}</span>
              <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">{caso.areaDerecho || 'Civil'} - {caso.claseProceso || 'Proceso'}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">{caso.radicado || 'Sin Radicado Asignado'}</h1>
            <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              {caso.juzgado || 'Despacho judicial no especificado'}
            </p>
          </div>

          {/* CONTENEDOR DE BOTONES CORREGIDO CON FLEX-WRAP */}
          <div className="flex flex-wrap gap-3 w-full md:w-auto justify-start md:justify-end mt-4 md:mt-0">
            <Link 
              href={`/dashboard/casos/${caso.id}/editar`}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-3.5 px-5 rounded-xl shadow-sm transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
            >
              ✏️ Editar Datos
            </Link>
            <Link 
              href={`/dashboard/casos/${caso.id}/poder`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-5 rounded-xl shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Generar Poder (Word)
            </Link>
            <Link 
              href={`/dashboard/intereses?casoId=${caso.id}`}
              className="bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold py-3.5 px-5 rounded-xl shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Liquidar Intereses
            </Link>
            <BotonReporteCliente caso={caso} nombreAbogado={`${user.firstName} ${user.lastName}`} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMNA IZQUIERDA (Partes y Resumen) */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 border-b border-slate-100 pb-3 flex items-center gap-2">
                Partes Procesales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Demandante</p>
                  <p className="font-bold text-slate-900 text-lg">{caso.demandante}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1">Identificación: {caso.idDemandante || 'No registrada'}</p>
                </div>
                <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Demandado</p>
                  <p className="font-bold text-slate-900 text-lg">{caso.demandado}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1">Identificación: {caso.idDemandado || 'No registrada'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 border-b border-slate-100 pb-3">Resumen y Estrategia</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hechos Relevantes</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{caso.resumenHechos || 'Aún no has registrado un resumen de los hechos para este proceso.'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Apuntes Privados del Despacho</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-yellow-50 p-4 rounded-xl border border-yellow-100">{caso.apuntesPrivados || 'No hay notas privadas.'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 border-b border-slate-100 pb-3">Historial de Liquidaciones Guardadas</h3>
              {caso.liquidaciones && caso.liquidaciones.length > 0 ? (
                <div className="space-y-3">
                  {caso.liquidaciones.map(liq => (
                    <div key={liq.id} className="p-4 border border-slate-200 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 hover:bg-slate-50 transition">
                      <div>
                        <p className="font-bold text-[#1E3A8A] text-sm">{liq.tipo}</p>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">Guardada el {formatFecha(liq.createdAt)}</p>
                      </div>
                      <div className="text-right bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                        <p className="text-[10px] text-blue-600 font-bold uppercase mb-0.5">Total Liquidado</p>
                        <p className="font-black text-slate-900">{formatCOP(liq.granTotalFinal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-sm text-slate-500 font-medium">No has realizado ninguna liquidación para este expediente.</p>
                </div>
              )}
            </div>

          </div>

          {/* COLUMNA DERECHA (Métricas y Plazos) */}
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 border-b border-slate-100 pb-3">Datos Financieros</h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-600 font-bold uppercase">Cuantía Estimada</span>
                  <span className="font-black text-slate-900">{formatCOP(caso.cuantia)}</span>
                </li>
                <li className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-600 font-bold uppercase">Capital Base</span>
                  <span className="font-black text-slate-900">{formatCOP(caso.capitalBase)}</span>
                </li>
                <li className="flex flex-col pt-2">
                  <span className="text-xs text-slate-500 font-bold uppercase mb-1">Honorarios Pactados</span>
                  <span className="text-sm font-medium text-slate-800">{caso.honorariosPactados || 'No registrados'}</span>
                </li>
                <li className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <span className="text-xs text-emerald-800 font-bold uppercase">Saldo a Cobrar</span>
                  <span className="font-black text-emerald-700">{formatCOP(caso.saldoHonorarios)}</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 border-b border-slate-100 pb-3">Hitos y Plazos</h3>
              <ul className="space-y-4">
                <li>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fecha de Presentación</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{formatFecha(caso.fechaPresentacion)}</p>
                </li>
                <li>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fecha Auto Admisorio</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{formatFecha(caso.fechaAdmision)}</p>
                </li>
                <li className="bg-orange-50 p-4 rounded-xl border border-orange-200 mt-4 shadow-inner">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                    <p className="text-xs text-orange-800 font-black uppercase tracking-wider">Próximo Vencimiento</p>
                  </div>
                  <p className="text-lg font-black text-orange-950 my-1">{formatFecha(caso.fechaVencimiento)}</p>
                  <p className="text-xs font-semibold text-orange-800 bg-orange-100/50 p-2 rounded-lg">{caso.descVencimiento || 'Sin descripción de la actuación'}</p>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-3">Directorio Contraparte</h3>
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-bold uppercase">Abogado Titular</p>
                <p className="text-sm font-bold text-slate-900">{caso.abogadoContraparte || 'No registrado'}</p>
                
                <p className="text-xs text-slate-500 font-bold uppercase mt-3">Correo Notificaciones</p>
                <p className="text-sm font-medium text-blue-600 break-all">{caso.emailContraparte || 'No registrado'}</p>
                
                <p className="text-xs text-slate-500 font-bold uppercase mt-3">Teléfono</p>
                <p className="text-sm font-medium text-slate-900">{caso.telContraparte || 'No registrado'}</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}