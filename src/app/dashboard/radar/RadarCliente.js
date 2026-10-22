"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { guardarActualizacionRadar, limpiarAlertaRadar, marcarRadarFallido } from '@/app/actions/radar';

export default function RadarCliente({ casos }) {
  const router = useRouter();
  const [procesandoId, setProcesandoId] = useState(null);
  const [barridoGlobal, setBarridoGlobal] = useState(false);

  const casosRastreables = casos.filter(c => c.radicado && c.radicado.replace(/[^0-9]/g, '').length === 23);
  const casosConAlerta = casosRastreables.filter(c => c.radarAlerta).length;

  // Lógica principal ejecutada en el navegador del usuario (Client-Side)
  const ejecutarSincronizacionCliente = async (caso) => {
    const radicadoLimpio = caso.radicado.replace(/[^0-9]/g, '');
    try {
      // 1. Buscar ID del proceso
      const urlBusqueda = `https://consultaprocesos.ramajudicial.gov.co/api/v2/Procesos/Consulta/NumeroRadicacion?numero=${radicadoLimpio}&SoloActivos=false&despacho=null`;
      const resBusqueda = await fetch(urlBusqueda);
      if (!resBusqueda.ok) throw new Error("Fallo API Busqueda");
      
      const dataBusqueda = await resBusqueda.json();
      if (!dataBusqueda.procesos || dataBusqueda.procesos.length === 0) {
        return { exito: false, mensaje: "El radicado no existe en la Rama Judicial." };
      }

      // 2. Buscar Actuaciones
      const idProceso = dataBusqueda.procesos[0].idProceso;
      const urlActuaciones = `https://consultaprocesos.ramajudicial.gov.co/api/v2/Proceso/Actuaciones/${idProceso}`;
      const resActuaciones = await fetch(urlActuaciones);
      if (!resActuaciones.ok) throw new Error("Fallo API Actuaciones");

      const dataActuaciones = await resActuaciones.json();
      if (!dataActuaciones.actuaciones || dataActuaciones.actuaciones.length === 0) {
        return { exito: false, mensaje: "El proceso no tiene actuaciones." };
      }

      // 3. Extraer la última actuación y enviar al servidor para guardar
      const ultimaActuacion = dataActuaciones.actuaciones[0];
      const nombreAct = ultimaActuacion.actuacion || ultimaActuacion.anotacion || "Actuación registrada";
      const fechaAct = ultimaActuacion.fechaActuacion;

      return await guardarActualizacionRadar(caso.id, nombreAct, fechaAct);

    } catch (error) {
      await marcarRadarFallido(caso.id);
      return { exito: false, mensaje: "No se pudo conectar con la Rama. Intenta más tarde." };
    }
  };

  const handleSincronizarUno = async (caso) => {
    setProcesandoId(caso.id);
    const resultado = await ejecutarSincronizacionCliente(caso);
    alert(resultado.mensaje);
    setProcesandoId(null);
    router.refresh();
  };

  const handleBarridoGlobal = async () => {
    if (!window.confirm(`¿Iniciar escaneo de ${casosRastreables.length} procesos?`)) return;
    setBarridoGlobal(true);
    let nuevos = 0;
    
    for (const caso of casosRastreables) {
      setProcesandoId(caso.id);
      const res = await ejecutarSincronizacionCliente(caso);
      if (res.exito && res.nueva) nuevos++;
      await new Promise(r => setTimeout(r, 1500)); // Pausa para no ser bloqueados
    }
    
    alert(`Barrido completado. Se encontraron ${nuevos} actuaciones nuevas.`);
    setProcesandoId(null);
    setBarridoGlobal(false);
    router.refresh();
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
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Conectado Vía Cliente Local</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Radar de la Rama Judicial</h1>
            <p className="text-slate-400 font-medium mt-1">Monitoreo automatizado de actuaciones y estados en juzgados.</p>
          </div>

          <div className="relative z-10 flex gap-3 w-full md:w-auto">
            <Link href="/dashboard" className="flex-1 md:flex-none bg-slate-700 hover:bg-slate-600 text-white font-bold py-3.5 px-6 rounded-xl transition text-center text-sm">
              Volver
            </Link>
            <button 
              onClick={handleBarridoGlobal}
              disabled={barridoGlobal || casosRastreables.length === 0}
              className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-900 font-black py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm"
            >
              {barridoGlobal ? 'Escaneando...' : 'Iniciar Barrido Global'}
              {!barridoGlobal && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>}
            </button>
          </div>
        </div>

        {/* Dashboard de Alertas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 font-black text-xl">{casosRastreables.length}</div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Procesos Rastreables</p>
              <p className="text-sm text-slate-500">Con 23 dígitos correctos</p>
            </div>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center font-black text-xl">
              {casosConAlerta}
            </div>
            <div>
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Nuevas Actuaciones</p>
              <p className="text-sm text-slate-500">Requieren tu atención</p>
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
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Última Actuación Registrada</p>
                    {caso.radarUltimaActuacion ? (
                      <>
                        <p className={`font-bold text-sm mb-1 ${caso.radarAlerta ? 'text-red-400' : 'text-emerald-400'}`}>{caso.radarUltimaActuacion}</p>
                        <p className="text-xs text-slate-500">Fecha del juzgado: {formatFecha(caso.radarFechaActuacion)}</p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No sincronizado aún</p>
                    )}
                    <p className="text-[10px] text-slate-600 mt-2">Última consulta: {formatFecha(caso.radarUltimaConsulta)}</p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button 
                      onClick={() => handleSincronizarUno(caso)}
                      disabled={procesandoId === caso.id || barridoGlobal}
                      className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition"
                    >
                      {procesandoId === caso.id ? 'Consultando...' : 'Sincronizar ahora'}
                    </button>
                    {caso.radarAlerta && (
                      <button onClick={() => handleLimpiarAlerta(caso.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-2.5 px-4 rounded-lg text-sm transition border border-red-500/20">
                        Marcar como leída
                      </button>
                    )}
                    <Link href={`/dashboard/casos/${caso.id}`} className="text-center text-slate-400 hover:text-white text-xs font-bold py-2">
                      Abrir Expediente
                    </Link>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}