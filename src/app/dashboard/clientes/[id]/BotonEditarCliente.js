"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { actualizarCliente } from '@/app/actions/clientes';

export default function BotonEditarCliente({ cliente }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    nombre: cliente.nombre || '',
    identificacion: cliente.identificacion || '',
    email: cliente.email || '',
    telefono: cliente.telefono || '',
    direccion: cliente.direccion || '',
    notas: cliente.notas || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setProcesando(true);
      await actualizarCliente(cliente.id, formData);
      setModalAbierto(false);
      router.refresh();
    } catch (error) {
      alert("Error al actualizar: " + error.message);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setModalAbierto(true)}
        className="w-full md:w-auto bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-[#1E3A8A] font-bold py-3.5 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        Editar Cliente
      </button>

      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-100 p-6 border-b border-slate-200 shrink-0">
              <h3 className="font-black text-xl text-slate-800">Editar Cliente</h3>
              <p className="text-slate-500 text-xs mt-1">Actualiza la información de contacto o notas.</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre Completo o Razón Social *</label>
                <input required type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#1E3A8A] font-medium"/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">NIT / Cédula</label>
                  <input type="text" name="identificacion" value={formData.identificacion} onChange={handleChange} className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#1E3A8A] text-sm"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Teléfono / Celular</label>
                  <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#1E3A8A] text-sm"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Correo Electrónico</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#1E3A8A] text-sm"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dirección Física</label>
                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#1E3A8A] text-sm"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notas Internas</label>
                <textarea name="notas" value={formData.notas} onChange={handleChange} rows="3" className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#1E3A8A] text-sm resize-none" placeholder="Añade información relevante sobre este cliente..."></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalAbierto(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition">Cancelar</button>
                <button type="submit" disabled={procesando} className="flex-1 bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition">
                  {procesando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}