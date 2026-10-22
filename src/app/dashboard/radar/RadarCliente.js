"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { guardarActualizacionRadar, limpiarAlertaRadar } from '@/app/actions/radar';

export default function RadarCliente({ casos }) {
  const router = useRouter();
  
  // Estados para el modal de actualización manual
  const [modalAbierto, setModalAbierto] = useState(false);
  const [casoActivo, setCasoActivo] = useState(null);
  const [formData, setFormData] = useState({ actuacion: '', fecha: '' });
  const [guardando, setGuardando] = useState(false);

  const casosRastreables = casos.filter(c => c.radicado && c.radicado.replace(/[^0-9]/g, '').length === 23);
  const casosConAlerta = casosRastreables.filter(c => c.radarAlerta).length;

  // 1. PUENTE INTELIGENTE: Copia el radicado y abre la Rama Judicial
  const handleConsultaRapida = (radicado) => {
    const radicadoLimpio = radicado.replace(/[^0-9]/g, '');
    navigator.clipboard.writeText(radicadoLimpio).then(() => {
      alert(`Radicado ${radicadoLimpio} copiado al portapapeles.\n\nPresiona Ctrl+V en la página de la Rama Judicial.`);
      window.open('https://consultaprocesos.ramajudicial.gov.co/Procesos/NumeroRadicacion', '_blank');
    });
  };

  // 2. ACTUALIZACIÓN MANUAL EN EL RADAR
  const abrirModalActualizacion = (caso) => {
    setCasoActivo(caso);
    setFormData({ actuacion: '', fecha: new Date().toISOString().split('T')[0] });
    setModalAbierto(true);
  };

  const handleGuardarActualizacion = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await guardarActualizacionRadar(casoActivo.id, formData.actuacion, formData.fecha);
      setModalAbierto(false);
      setCasoActivo(null);
      router.refresh();
    } catch (error) {
      alert("Error al actualizar: " + error.message);
    }
    setGuardando(false);
  };

  const handleLimpiarAlerta = async (casoId) => {
    await limpiarAlertaRadar(casoId);
    router.refresh();
  };

  const formatFecha = (fecha) => fecha ? new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Nunca';

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Encabezado Dark Mode */}
        <div className="bg-slate-800 p-6 md:p-8 rounded-3xl shadow-xl border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
              <span className="text-blue-400 text-xs font-black uppercase tracking-widest">Radar Híbrido Asistido</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Torre de Control Judicial</h1>
            <p className="text-slate-400 font-medium mt-1">Monitoreo y enlaces rápidos a los expedientes de la Rama.</p>
          </div>

          <div className="relative z-10 flex gap-3 w-full md:w-auto">
            <Link href="/dashboard" className="flex-1 md:flex-none bg-slate-700 hover:bg-slate-600 text-white font-bold py-3.5 px-6 rounded-xl transition text-center text-sm">
              Volver
            </Link>
          </div>
        </div>

        {/* Dashboard de Alertas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 font-black text-xl">{casosRastreables.length}</div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Procesos Vinculados</p>
              <p className="text-sm text-slate-500">Con 23 dígitos oficiales</p>
            </div>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center font-black text-xl">
              {casosConAlerta}
            </div>
            <div>
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Actuaciones Nuevas</p>
              <p className="text-sm text-slate-500">Marcadas en tu radar</p>
            </div>
          </div>
        </div>

        {/* Lista de Procesos */}
        <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-white font-bold">Monitor de Expedientes</h3>
          </div>
          
          <div className="divide-y divide-slate-700">
            {casosRastreables.length === 0 ? (
              <div className="p-10 text-center text-slate-500">No tienes expedientes con radicados de 23 dígitos válidos.</div>
            ) : (
              casosRastreables.map(caso => (
                <div key={caso.id} className={`p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-colors ${caso.radarAlerta ? 'bg-red-500/5' : 'hover:bg-slate-700/50'}`}>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {caso.radarAlerta && <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider animate-pulse">Novedad</span>}
                      <span className="text-slate-400 font-mono text-sm">{caso.radicado}</span>
                    </div>
                    <h4 className="text-white font-bold text-lg mb-1">{caso.demandante} VS {caso.demandado}</h4>
                    <p className="text-slate-500 text-sm">{caso.juzgado}</p>
                  </div>

                  <div className="flex-1 bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Último Estado Reportado</p>
                    {caso.radarUltimaActuacion ? (
                      <>
                        <p className={`font-bold text-sm mb-1 ${caso.radarAlerta ? 'text-red-400' : 'text-blue-400'}`}>{caso.radarUltimaActuacion}</p>
                        <p className="text-xs text-slate-500">Fecha del juzgado: {formatFecha(caso.radarFechaActuacion)}</p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No verificado aún</p>
                    )}
                    <p className="text-[10px] text-slate-600 mt-2">Última revisión interna: {formatFecha(caso.radarUltimaConsulta)}</p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button 
                      onClick={() => handleConsultaRapida(caso.radicado)}
                      className="bg-[#1E3A8A] hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      Consulta Rápida
                    </button>
                    
                    <button 
                      onClick={() => abrirModalActualizacion(caso)}
                      className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition"
                    >
                      Registrar Novedad
                    </button>

                    {caso.radarAlerta && (
                      <button onClick={() => handleLimpiarAlerta(caso.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-2.5 px-4 rounded-lg text-sm transition border border-red-500/20 mt-2">
                        Marcar como leída
                      </button>
                    )}
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE ACTUALIZACIÓN MANUAL */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-700">
            <div className="bg-slate-900 p-6 border-b border-slate-700">
              <h3 className="font-black text-xl text-white">Actualizar Radar</h3>
              <p className="text-slate-400 text-xs mt-1">Registra la última actuación del juzgado.</p>
            </div>
            <form onSubmit={handleGuardarActualizacion} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nueva Actuación / Anotación</label>
                <input required type="text" value={formData.actuacion} onChange={(e) => setFormData({...formData, actuacion: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500" placeholder="Ej. Auto que libra mandamiento de pago"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fecha de la Actuación</label>
                <input required type="date" value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalAbierto(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3.5 rounded-xl transition">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition">
                  {guardando ? 'Guardando...' : 'Guardar Estado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}