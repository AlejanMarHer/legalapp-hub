"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { crearArgumento, eliminarArgumento } from '@/app/actions/biblioteca';

export default function BibliotecaCliente({ argumentosIniciales }) {
  const [argumentos, setArgumentos] = useState(argumentosIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const router = useRouter();

  // Formulario
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [ramaDerecho, setRamaDerecho] = useState('Civil');
  const [palabrasClave, setPalabrasClave] = useState('');

  // Filtrado en tiempo real
  const argumentosFiltrados = argumentos.filter(arg => 
    arg.titulo.toLowerCase().includes(busqueda.toLowerCase()) || 
    (arg.palabrasClave && arg.palabrasClave.toLowerCase().includes(busqueda.toLowerCase())) ||
    arg.contenido.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      setProcesando(true);
      const nuevo = await crearArgumento({ titulo, contenido, ramaDerecho, palabrasClave });
      setArgumentos([nuevo, ...argumentos]);
      setModalAbierto(false);
      setTitulo(''); setContenido(''); setRamaDerecho('Civil'); setPalabrasClave('');
      router.refresh();
    } catch (error) {
      alert("Error al guardar: " + error.message);
    } finally {
      setProcesando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este texto de tu biblioteca?")) return;
    try {
      await eliminarArgumento(id);
      setArgumentos(argumentos.filter(a => a.id !== id));
      router.refresh();
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  const handleCopiar = async (texto) => {
    try {
      await navigator.clipboard.writeText(texto);
      alert("¡Texto copiado al portapapeles! Listo para pegar en tu documento.");
    } catch (err) {
      alert("No se pudo copiar el texto.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navegación y Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-[#1E3A8A] hover:text-blue-700 transition gap-1.5 bg-white border border-blue-100 px-4 py-2 rounded-xl shadow-sm mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Volver al Centro de Mando
            </Link>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Biblioteca Legal</h1>
            <p className="text-slate-500 font-medium mt-1">Tu segundo cerebro: Jurisprudencia y argumentos listos para usar.</p>
          </div>
          <button 
            onClick={() => setModalAbierto(true)}
            className="bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold py-3 px-5 rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Nuevo Texto
          </button>
        </div>

        {/* Buscador */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input 
            type="text" 
            placeholder="Buscar por título, palabra clave o contenido..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full outline-none text-slate-700 font-medium"
          />
        </div>

        {/* Grid de Argumentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {argumentosFiltrados.length > 0 ? (
            argumentosFiltrados.map(arg => (
              <div key={arg.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="p-5 border-b border-slate-100 flex-1">
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">{arg.ramaDerecho}</span>
                  <h3 className="font-bold text-slate-900 mt-3 text-lg leading-tight">{arg.titulo}</h3>
                  {arg.palabrasClave && (
                    <p className="text-xs text-slate-400 font-medium mt-2">Etiquetas: {arg.palabrasClave}</p>
                  )}
                  <div className="mt-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 h-32 overflow-y-auto whitespace-pre-wrap">
                    {arg.contenido}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center gap-2">
                  <button onClick={() => handleEliminar(arg.id)} className="text-xs font-bold text-red-500 hover:text-red-700 px-3 py-2">
                    Eliminar
                  </button>
                  <button onClick={() => handleCopiar(arg.contenido)} className="bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white transition-colors text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 uppercase">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                    Copiar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-500 font-medium">No se encontraron textos. ¡Agrega tu primer argumento!</p>
            </div>
          )}
        </div>

        {/* Modal Nuevo Argumento */}
        {modalAbierto && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-[#1E3A8A] p-5">
                <h3 className="text-white font-bold text-lg">Guardar en Biblioteca</h3>
              </div>
              <form onSubmit={handleGuardar} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Título / Tema</label>
                    <input required type="text" value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder="Ej: Excepción de prescripción" className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Rama del Derecho</label>
                    <select value={ramaDerecho} onChange={e=>setRamaDerecho(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option>Civil</option><option>Laboral</option><option>Penal</option><option>Familia</option><option>Administrativo</option><option>Constitucional</option><option>Comercial</option><option>General</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Palabras Clave (Opcional)</label>
                  <input type="text" value={palabrasClave} onChange={e=>setPalabrasClave(e.target.value)} placeholder="Ej: cobro, titulo valor, excepciones" className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contenido del Argumento / Jurisprudencia</label>
                  <textarea required value={contenido} onChange={e=>setContenido(e.target.value)} rows="6" placeholder="Pega aquí el texto de la sentencia o tu argumento redactado..." className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setModalAbierto(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition">Cancelar</button>
                  <button type="submit" disabled={procesando} className="flex-1 bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition">
                    {procesando ? 'Guardando...' : 'Guardar Texto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}