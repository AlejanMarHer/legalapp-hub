"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { crearTarea, actualizarEstadoTarea, eliminarTarea } from '@/app/actions/tareas';

export default function TableroCliente({ tareasIniciales }) {
  const [tareas, setTareas] = useState(tareasIniciales);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const router = useRouter();

  // Estados del Formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState('Media');
  const [fechaVencimiento, setFechaVencimiento] = useState('');

  const columnas = [
    { id: 'POR HACER', titulo: 'Por Hacer', color: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-700' },
    { id: 'EN TRÁMITE', titulo: 'En Trámite', color: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    { id: 'FINALIZADO', titulo: 'Finalizado', color: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' }
  ];

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      setProcesando(true);
      const nueva = await crearTarea({ titulo, descripcion, prioridad, fechaVencimiento });
      setTareas([nueva, ...tareas]);
      setModalAbierto(false);
      // Limpiar formulario
      setTitulo(''); setDescripcion(''); setPrioridad('Media'); setFechaVencimiento('');
      router.refresh();
    } catch (error) {
      alert("Error al crear la tarea: " + error.message);
    } finally {
      setProcesando(false);
    }
  };

  const handleMover = async (id, nuevoEstado) => {
    // Actualizamos la UI inmediatamente para que se sienta súper rápido
    setTareas(tareas.map(t => t.id === id ? { ...t, estado: nuevoEstado } : t));
    try {
      await actualizarEstadoTarea(id, nuevoEstado);
      router.refresh();
    } catch (error) {
      alert("Error al mover la tarea");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta tarea?")) return;
    setTareas(tareas.filter(t => t.id !== id));
    try {
      await eliminarTarea(id);
      router.refresh();
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return null;
    const opciones = { day: '2-digit', month: 'short' };
    return new Date(fechaStr).toLocaleDateString('es-CO', opciones);
  };

  const colorPrioridad = {
    'Alta': 'bg-red-100 text-red-700 border-red-200',
    'Media': 'bg-amber-100 text-amber-700 border-amber-200',
    'Baja': 'bg-slate-100 text-slate-600 border-slate-200'
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div>
            <Link href="/dashboard" className="inline-flex items-center text-xs font-bold text-[#1E3A8A] hover:text-blue-700 transition gap-1.5 uppercase tracking-wider mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Volver al Inicio
            </Link>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Tablero de Tareas</h1>
            <p className="text-slate-500 font-medium mt-1 text-sm">Gestiona tus pendientes operativos y organiza tu día a día.</p>
          </div>
          <button 
            onClick={() => setModalAbierto(true)}
            className="w-full md:w-auto bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Nueva Tarea
          </button>
        </div>

        {/* Tablero Kanban */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {columnas.map(columna => (
            <div key={columna.id} className={`${columna.color} rounded-3xl p-5 border ${columna.border} min-h-[60vh] flex flex-col`}>
              <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-3">
                <h2 className={`font-black uppercase tracking-wider text-sm ${columna.text}`}>{columna.titulo}</h2>
                <span className="bg-white px-2 py-0.5 rounded-md text-xs font-bold shadow-sm border border-black/5">
                  {tareas.filter(t => t.estado === columna.id).length}
                </span>
              </div>
              
              <div className="space-y-4 flex-1">
                {tareas.filter(t => t.estado === columna.id).map(tarea => (
                  <div key={tarea.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${colorPrioridad[tarea.prioridad]}`}>
                        Prioridad {tarea.prioridad}
                      </span>
                      <button onClick={() => handleEliminar(tarea.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                    <h3 className="font-bold text-slate-800 leading-tight mb-2">{tarea.titulo}</h3>
                    {tarea.descripcion && (
                      <p className="text-xs text-slate-500 line-clamp-3 mb-3 leading-relaxed">{tarea.descripcion}</p>
                    )}
                    {tarea.fechaVencimiento && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 w-fit px-2 py-1 rounded-md mb-3">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        {formatearFecha(tarea.fechaVencimiento)}
                      </div>
                    )}
                    
                    {/* Botones de mover */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      {columna.id !== 'POR HACER' ? (
                        <button onClick={() => handleMover(tarea.id, columna.id === 'FINALIZADO' ? 'EN TRÁMITE' : 'POR HACER')} className="text-xs font-bold text-slate-400 hover:text-[#1E3A8A] flex items-center gap-1 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                          Atrás
                        </button>
                      ) : <div></div>}
                      
                      {columna.id !== 'FINALIZADO' && (
                        <button onClick={() => handleMover(tarea.id, columna.id === 'POR HACER' ? 'EN TRÁMITE' : 'FINALIZADO')} className="text-xs font-bold text-[#1E3A8A] hover:text-blue-600 flex items-center gap-1 transition-colors">
                          Avanzar
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {tareas.filter(t => t.estado === columna.id).length === 0 && (
                  <div className="text-center py-10 border-2 border-dashed border-black/10 rounded-2xl text-slate-400 text-sm font-medium">
                    Sin tareas aquí
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Nueva Tarea */}
        {modalAbierto && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="bg-[#1E3A8A] p-6 text-white">
                <h3 className="font-black text-xl">Agregar Nueva Tarea</h3>
                <p className="text-blue-200 text-xs mt-1">El pendiente irá a la columna "Por Hacer"</p>
              </div>
              <form onSubmit={handleGuardar} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">¿Qué hay que hacer?</label>
                  <input required type="text" value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder="Ej: Llamar al perito avaluador" className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#1E3A8A] font-medium"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detalles (Opcional)</label>
                  <textarea value={descripcion} onChange={e=>setDescripcion(e.target.value)} rows="3" placeholder="Añade contexto, teléfonos o datos clave..." className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none text-sm"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prioridad</label>
                    <select value={prioridad} onChange={e=>setPrioridad(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#1E3A8A] bg-white text-sm font-bold">
                      <option>Alta</option><option>Media</option><option>Baja</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fecha Límite</label>
                    <input type="date" value={fechaVencimiento} onChange={e=>setFechaVencimiento(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#1E3A8A] text-sm font-medium"/>
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setModalAbierto(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition">Cancelar</button>
                  <button type="submit" disabled={procesando} className="flex-1 bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition">
                    {procesando ? 'Guardando...' : 'Crear Tarea'}
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