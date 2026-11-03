import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verificarEstadoSuscripcion } from '@/app/actions/suscripciones';

export const dynamic = 'force-dynamic';

export default async function SuscripcionPage() {
  const user = await currentUser();
  if (!user) redirect('/');

  // Consultamos el cerebro de suscripciones
  const status = await verificarEstadoSuscripcion();
  const esPro = status.esPro || status.esAdmin;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 pb-24">
      <div className="max-w-5xl mx-auto">
        
        {/* ENCABEZADO */}
        <div className="text-center mb-12 md:mb-16">
          <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-[#1E3A8A] hover:text-blue-700 transition gap-1.5 bg-white border border-blue-100 px-4 py-2 rounded-xl shadow-sm mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Volver al Despacho
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Eleva tu litigio al <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">siguiente nivel</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Automatiza cálculos, gestiona expedientes sin límites y obtén una ventaja estratégica con nuestra Inteligencia Artificial jurídica.
          </p>
          
          {status.esAdmin && (
            <div className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 px-5 py-2 rounded-full border border-amber-200 font-bold text-sm shadow-sm animate-pulse">
              <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" /></svg>
              Pase VIP de Fundador Activo
            </div>
          )}
        </div>

        {/* VITRINA DE PLANES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* PLAN GRATIS */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Plan Básico</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-black text-slate-900">$0</span>
              <span className="text-slate-500 font-bold">COP / mes</span>
            </div>
            <p className="text-sm text-slate-500 mb-8 h-10">Para probar la plataforma y organizar tus primeros casos.</p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                <span className="text-slate-600 font-medium text-sm">Hasta <b>5 expedientes</b> activos</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                <span className="text-slate-600 font-medium text-sm">Directorio CRM de Clientes</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                <span className="text-slate-600 font-medium text-sm">Tablero de Tareas Básico</span>
              </li>
              <li className="flex items-start gap-3 opacity-40">
                <svg className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                <span className="text-slate-500 font-medium text-sm line-through">Litis IA (Asistente Jurídico)</span>
              </li>
              <li className="flex items-start gap-3 opacity-40">
                <svg className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                <span className="text-slate-500 font-medium text-sm line-through">Radar Judicial de 23 dígitos</span>
              </li>
            </ul>

            <button disabled className="w-full bg-slate-100 text-slate-500 font-bold py-4 rounded-xl border border-slate-200 cursor-not-allowed">
              {(!esPro || status.esAdmin) ? "Plan Actual" : "No Disponible"}
            </button>
          </div>

          {/* PLAN PRO */}
          <div className="bg-[#1E3A8A] rounded-3xl p-8 shadow-2xl relative md:scale-105 border border-blue-700/50">
            <div className="absolute -top-4 right-8 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black uppercase tracking-widest py-1.5 px-4 rounded-full shadow-md">
              Recomendado
            </div>
            
            <h3 className="text-xl font-bold text-blue-100 mb-2">Plan Pro LitisApp</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-black text-white">$59.900</span>
              <span className="text-blue-200 font-bold text-sm">COP / mes</span>
            </div>
            <p className="text-sm text-blue-200 mb-8 h-10">Todo el poder de la tecnología y la Inteligencia Artificial a tu disposición.</p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="bg-amber-400 rounded-full p-0.5 shrink-0 mt-0.5"><svg className="w-4 h-4 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg></div>
                <span className="text-white font-bold text-sm">Expedientes Ilimitados</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-amber-400 rounded-full p-0.5 shrink-0 mt-0.5"><svg className="w-4 h-4 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg></div>
                <span className="text-white font-medium text-sm"><b>Litis IA Ilimitada</b> (Análisis del CGP y redacción legal)</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-amber-400 rounded-full p-0.5 shrink-0 mt-0.5"><svg className="w-4 h-4 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg></div>
                <span className="text-white font-medium text-sm"><b>Lector de Expedientes</b> (La IA escanea tus PDFs)</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-amber-400 rounded-full p-0.5 shrink-0 mt-0.5"><svg className="w-4 h-4 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg></div>
                <span className="text-white font-medium text-sm">Acceso a todos los Liquidadores (Laboral, DANE, SFC)</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-amber-400 rounded-full p-0.5 shrink-0 mt-0.5"><svg className="w-4 h-4 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg></div>
                <span className="text-white font-medium text-sm">Generación de Reportes PDF Profesionales</span>
              </li>
            </ul>

            {esPro && !status.esAdmin ? (
              <button disabled className="w-full bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg border border-emerald-400 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                SUSCRIPCIÓN ACTIVA
              </button>
            ) : (
              <button className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-900 font-black py-4 rounded-xl shadow-[0_10px_25px_rgba(245,158,11,0.5)] transition-all hover:scale-105">
                ACTUALIZAR A PRO AHORA
              </button>
            )}
            
            <p className="text-center text-blue-300 text-xs mt-4 opacity-80">
              Cancela cuando quieras. Cobro seguro mediante MercadoPago/Stripe.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}