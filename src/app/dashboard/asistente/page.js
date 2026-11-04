"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { consultarAsistenteLegal, obtenerExpedientesParaIA } from '@/app/actions/ia';

export default function AsistenteIAPage() {
  const [mensajes, setMensajes] = useState([
    { role: 'assistant', content: 'Hola, soy Litis, tu asistente jurídico con IA. ¿En qué caso, redacción o análisis legal te puedo ayudar hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const [casos, setCasos] = useState([]);
  const [casoSeleccionado, setCasoSeleccionado] = useState('');
  const [cargandoCasos, setCargandoCasos] = useState(true);
  
  const finalChatRef = useRef(null);

  // Carga inicial robusta de los expedientes
  useEffect(() => {
    let montado = true;

    async function cargarCasos() {
      try {
        console.log("Iniciando carga de expedientes para IA...");
        const data = await obtenerExpedientesParaIA();
        console.log("Expedientes recibidos del servidor:", data);
        
        if (montado) {
          setCasos(data || []);
        }
      } catch (error) {
        console.error("Error al cargar los expedientes:", error);
      } finally {
        if (montado) {
          setCargandoCasos(false);
        }
      }
    }
    
    cargarCasos();

    return () => { montado = false; };
  }, []);

  useEffect(() => {
    finalChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!input.trim() || cargando) return;

    const textoUsuario = input.trim();
    setInput('');
    
    const nuevoHistorial = [...mensajes, { role: 'user', content: textoUsuario }];
    setMensajes(nuevoHistorial);
    setCargando(true);

    try {
      const resultado = await consultarAsistenteLegal(nuevoHistorial, casoSeleccionado);
      
      if (resultado.exito) {
        setMensajes(prev => [...prev, { role: 'assistant', content: resultado.respuesta }]);
      } else {
        setMensajes(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${resultado.mensaje}` }]);
      }
    } catch (error) {
      setMensajes(prev => [...prev, { role: 'assistant', content: "⚠️ Hubo un fallo crítico en la comunicación con el servidor." }]);
    }
    
    setCargando(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col h-screen font-sans relative">
      
      {/* Encabezado del Asistente */}
      <div className="bg-slate-900 p-4 md:p-6 shadow-md border-b border-slate-700 flex justify-between items-center shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg relative">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">Litis Asistente IA</h1>
            <p className="text-blue-300 text-xs font-medium">Motor de Inteligencia Jurídica (CGP, CPACA, Civil)</p>
          </div>
        </div>
        <Link href="/dashboard" className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm border border-slate-600">
          Cerrar
        </Link>
      </div>

      {/* SELECTOR DE EXPEDIENTE (BARRA DE CONTEXTO) */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm z-10">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 w-full flex-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Contexto de la IA:
          </label>
          <select 
            value={casoSeleccionado}
            onChange={(e) => setCasoSeleccionado(e.target.value)}
            disabled={cargandoCasos}
            className="text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-full max-w-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition cursor-pointer disabled:opacity-50"
          >
            <option value="">Consultas Generales (Sin expediente enlazado)</option>
            {cargandoCasos && <option value="" disabled>Cargando expedientes...</option>}
            {casos.map(c => (
              <option key={c.id} value={c.id}>
                {c.nombre} {c.tieneDocs ? '(📑 Tiene PDFs)' : '(⚠️ Sin PDFs)'}
              </option>
            ))}
          </select>
        </div>
        
        {/* Etiqueta indicadora visual */}
        {casoSeleccionado && (
          <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1.5 ${casos.find(c => c.id === casoSeleccionado)?.tieneDocs ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
            <span className={`w-2 h-2 rounded-full ${casos.find(c => c.id === casoSeleccionado)?.tieneDocs ? 'bg-indigo-500 animate-pulse' : 'bg-amber-500'}`}></span>
            {casos.find(c => c.id === casoSeleccionado)?.tieneDocs ? 'Analizando PDFs' : 'Solo Datos Básicos'}
          </div>
        )}
      </div>

      {/* Área de Chat */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {mensajes.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[75%] p-4 md:p-5 rounded-2xl ${msg.role === 'user' ? 'bg-[#1E3A8A] text-white rounded-tr-sm shadow-md' : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-sm'}`}>
                <div className="flex items-center gap-2 mb-2 opacity-70">
                  {msg.role === 'user' ? (
                    <><span className="text-[10px] font-black uppercase tracking-wider">Tú</span><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></>
                  ) : (
                    <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg><span className="text-[10px] font-black uppercase tracking-wider">Litis IA</span></>
                  )}
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {cargando && (
            <div className="flex justify-start">
              <div className="bg-white p-5 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                <span className="text-xs text-slate-400 font-bold ml-2">Analizando documentos...</span>
              </div>
            </div>
          )}
          <div ref={finalChatRef} />
        </div>
      </div>

      {/* Input de Texto */}
      <div className="bg-white border-t border-slate-200 p-4 md:p-6 shrink-0 z-20">
        <form onSubmit={enviarMensaje} className="max-w-4xl mx-auto flex gap-3">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={cargando}
            placeholder="Pregúntame sobre un recurso o pídeme que analice el PDF de tu expediente..." 
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-600 transition text-slate-800 disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || cargando}
            className="bg-[#1E3A8A] hover:bg-blue-800 text-white px-6 md:px-8 py-4 rounded-xl font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2"
          >
            <span className="hidden md:inline">Enviar</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
      </div>

    </div>
  );
}