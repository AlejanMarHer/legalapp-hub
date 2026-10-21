import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

import BotonResolverDashboard from './BotonResolverDashboard'; 
import { obtenerConfiguracion } from '@/app/actions/configuracion';

export const dynamic = 'force-dynamic';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect('/');

  const config = await obtenerConfiguracion();

  const casos = await prisma.caso.findMany({
    where: { userId: user.id },
  });

  const activos = casos.filter(c => c.estadoInterno === 'Activo');
  const totalActivos = activos.length;
  
  const cuantiaTotal = activos.reduce((sum, c) => sum + (c.cuantia || 0), 0);
  const honorariosPendientes = activos.reduce((sum, c) => sum + (c.saldoHonorarios || 0), 0);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const en15Dias = new Date();
  en15Dias.setDate(hoy.getDate() + 15);

  const vencimientosProximos = activos
    .filter(c => c.fechaVencimiento && new Date(c.fechaVencimiento) >= hoy && new Date(c.fechaVencimiento) <= en15Dias)
    .sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento));

  const formatCOP = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  const formatFecha = (fecha) => new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

  const nombreMostrar = config.nombreDespacho || `Despacho de ${user.firstName} ${user.lastName}`;
  const logoMostrar = config.logoBase64 || user.imageUrl;

  return (
    // CAMBIO 1: El contenedor cambia de flex-row a flex-col en celulares
    <div className="flex flex-col md:flex-row h-screen bg-[#F8FAFC] overflow-hidden">
      
      {/* 📱 NAVEGACIÓN MÓVIL (Solo visible en celulares) */}
      <div className="md:hidden bg-white border-b border-slate-200 shrink-0 z-50 shadow-sm">
        <div className="p-4 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0A101D] rounded-xl flex items-center justify-center p-1.5 shadow-md">
              <img src="/logo-simbolo.png" alt="Símbolo LitisApp" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#1E3A8A] tracking-tight leading-none">LitisApp</h2>
              <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">Despacho Digital</p>
            </div>
          </div>
          <div className="w-9 h-9 bg-slate-100 rounded-full border border-slate-200 overflow-hidden shrink-0">
            <img src={logoMostrar} alt="Perfil" className="w-full h-full object-cover" />
          </div>
        </div>
        
        {/* Chips de navegación desplazables horizontalmente */}
        <div className="px-4 py-3 overflow-x-auto whitespace-nowrap flex gap-2 [&::-webkit-scrollbar]:hidden">
          <Link href="/dashboard" className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold border border-blue-100">Centro de Mando</Link>
          <Link href="/dashboard/casos" className="inline-block px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-semibold border border-slate-200">Mis Expedientes</Link>
          <Link href="/dashboard/biblioteca" className="inline-block px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-semibold border border-slate-200">Biblioteca</Link>
          <Link href="/dashboard/intereses" className="inline-block px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-semibold border border-slate-200">Liquidador Intereses</Link>
          <Link href="/dashboard/laboral" className="inline-block px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-semibold border border-slate-200">Liquidador Laboral</Link>
          <Link href="/dashboard/indexacion" className="inline-block px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-semibold border border-slate-200">Indexación (DANE)</Link>
        </div>
      </div>

      {/* 💻 MENÚ LATERAL ESCRITORIO (Oculto en celulares con "hidden md:flex") */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0">
        <div className="p-6 border-b border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0A101D] rounded-xl flex items-center justify-center shrink-0 shadow-md p-1.5">
            <img src="/logo-simbolo.png" alt="Símbolo LitisApp" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#1E3A8A] tracking-tight leading-none">LitisApp</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">Despacho Digital</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Centro de Mando
          </Link>
          <div className="pt-4 pb-2"><p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Gestión CRM</p></div>
          <Link href="/dashboard/casos" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
            Mis Expedientes
          </Link>
          <Link href="/dashboard/biblioteca" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            Biblioteca Legal
          </Link>
          
          <div className="pt-4 pb-2"><p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Herramientas</p></div>
          <Link href="/dashboard/indexacion" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            Indexación (DANE)
          </Link>
          <Link href="/dashboard/intereses" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Intereses (SFC)
          </Link>
          <Link href="/dashboard/laboral" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            Liquidador Laboral
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
              <img src={logoMostrar} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="truncate">
              <p className="text-sm font-bold text-slate-800 truncate" title={nombreMostrar}>{nombreMostrar}</p>
              <p className="text-xs text-slate-500 font-medium">Abogado Titular</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL (Ajuste de paddings para celulares) */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-8">
          
          {/* 1. MÓDULO DE BRANDING */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#1E3A8A]"></div>
            
            <Link href="/dashboard/configuracion" className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner flex items-center justify-center overflow-hidden group relative cursor-pointer shrink-0">
              <img src={logoMostrar} alt="Logo Despacho" className="w-full h-full object-contain p-2" />
              <div className="absolute inset-0 bg-slate-900/70 hidden group-hover:flex items-center justify-center transition-all">
                <span className="text-white text-[10px] font-bold text-center leading-tight">Configurar<br/>Marca</span>
              </div>
            </Link>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">{nombreMostrar}</h1>
              <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Plataforma de Gestión Jurídica Integrada</p>
            </div>
            
            <div className="text-right hidden md:block bg-blue-50/50 px-5 py-3 rounded-xl border border-blue-100">
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">Día de Operación</p>
              <p className="text-sm font-bold text-blue-900 capitalize">{new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {/* 2. KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3"><svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg></div>
              <p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Activos</p>
              <p className="text-2xl md:text-3xl font-black text-slate-800 mt-1">{totalActivos}</p>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3"><svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
              <p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cuantías</p>
              <p className="text-sm md:text-2xl font-black text-slate-800 mt-1 tracking-tight truncate">{formatCOP(cuantiaTotal)}</p>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3"><svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg></div>
              <p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Honorarios</p>
              <p className="text-sm md:text-2xl font-black text-slate-800 mt-1 tracking-tight truncate">{formatCOP(honorariosPendientes)}</p>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-3"><svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
              <p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Términos</p>
              <p className="text-2xl md:text-3xl font-black text-slate-800 mt-1">{vencimientosProximos.length}</p>
            </div>
          </div>

          {/* 3. ALERTAS Y ACCIONES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Agenda de Vencimientos</h2>
                </div>
              </div>
              <div className="flex-1 p-0">
                {vencimientosProximos.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {vencimientosProximos.map(caso => {
                      const faltanDias = Math.ceil((new Date(caso.fechaVencimiento) - hoy) / (1000 * 60 * 60 * 24));
                      const isUrgente = faltanDias <= 3;
                      return (
                        <li key={caso.id} className="p-4 md:p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-slate-900">{caso.descVencimiento || "Actuación Pendiente"}</p>
                            <p className="text-xs text-slate-500 mt-1">Rad: <span className="font-medium">{caso.radicado || caso.id.slice(-8)}</span> • {caso.demandante} VS {caso.demandado}</p>
                          </div>
                          <div className="flex flex-col items-end shrink-0 w-full sm:w-auto">
                            <div className={`text-right px-3 py-2 rounded-lg border w-full sm:w-auto mb-2 sm:mb-0 ${isUrgente ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                              <p className={`text-xs font-bold ${isUrgente ? 'text-red-700' : 'text-amber-700'}`}>{formatFecha(caso.fechaVencimiento)}</p>
                              <p className={`text-[10px] font-bold uppercase mt-0.5 ${isUrgente ? 'text-red-500' : 'text-amber-600'}`}>En {faltanDias} días</p>
                            </div>
                            <BotonResolverDashboard casoId={caso.id} descVencimiento={caso.descVencimiento} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-10 text-center min-h-[250px]">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4"><svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div>
                    <p className="text-slate-800 font-bold">¡Todo bajo control!</p>
                    <p className="text-slate-500 text-sm mt-1 max-w-sm">No tienes actuaciones programadas para vencer en los próximos 15 días.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6 flex flex-col">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 md:mb-5">Acciones Rápidas</h2>
              <div className="space-y-3 flex-1">
                <Link href="/dashboard/casos/nuevo" className="flex items-center gap-3 p-4 rounded-xl bg-[#1E3A8A] text-white hover:bg-blue-800 transition-colors shadow-sm group">
                  <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg></div>
                  <span className="font-bold text-sm">Nuevo Expediente</span>
                </Link>
                <Link href="/dashboard/intereses" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50 transition-colors group">
                  <div className="bg-slate-100 text-slate-600 p-2 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
                  <span className="font-bold text-sm text-slate-700 group-hover:text-blue-700">Liquidar Intereses</span>
                </Link>
                <Link href="/dashboard/laboral" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 transition-colors group">
                  <div className="bg-slate-100 text-slate-600 p-2 rounded-lg group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></div>
                  <span className="font-bold text-sm text-slate-700 group-hover:text-emerald-700">Dictamen Laboral</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 4. MANUAL DE USUARIO */}
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 mt-10">
            <div className="flex items-center gap-4 mb-6 md:mb-8 border-b border-slate-200 pb-5">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 text-[#1E3A8A] rounded-xl flex items-center justify-center shadow-inner shrink-0">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">Manual de LitisApp</h2>
                <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Guía rápida para dominar todas las herramientas de tu despacho digital.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              
              {/* Tarjetas del Manual (se mantienen igual, solo ajustadas al grid) */}
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg></div>
                <h3 className="font-bold text-slate-800 mb-2">Gestión de Expedientes</h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">Crea procesos, asigna cuantías y mantén un resumen de hechos. Puedes usar la <b>Bitácora de Gestiones</b> para escribir apuntes privados del caso que se guardarán automáticamente.</p>
              </div>

              <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
                <h3 className="font-bold text-slate-800 mb-2">Agenda Inteligente</h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">Programa el próximo vencimiento del caso. Aparecerá en tu Centro de Mando. Usa el botón <b>"Gestionar"</b> para registrar lo que hiciste; esto limpiará tu agenda y actualizará tu bitácora.</p>
              </div>

              <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
                <h3 className="font-bold text-slate-800 mb-2">Módulo Financiero</h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">Controla los honorarios pendientes en cada expediente. Al usar <b>"Registrar Pago"</b>, se descontará de la deuda, se generará un Recibo en PDF y se creará el historial.</p>
              </div>

              <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg></div>
                <h3 className="font-bold text-slate-800 mb-2">Generación de Documentos</h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">Crea Poderes Especiales editables en Word (.docx) mapeando los datos automáticamente. Genera <b>Reportes para Clientes en PDF</b> separando la historia general de la última gestión.</p>
              </div>

              <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg></div>
                <h3 className="font-bold text-slate-800 mb-2">Biblioteca Legal</h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">Tu segundo cerebro jurídico. Guarda tus mejores párrafos, argumentos y jurisprudencia. Usa el botón <b>"Copiar"</b> para pegarlos en tus demandas en un instante.</p>
              </div>

              <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg></div>
                <h3 className="font-bold text-slate-800 mb-2">Liquidadores Especiales</h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">Ejecuta cálculos usando la calculadora de <b>Intereses (SFC)</b>, indexación de capital <b>(DANE)</b> o liquidación de prestaciones sociales directamente en tu sistema.</p>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}