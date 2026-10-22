"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { crearCliente, eliminarCliente } from '@/app/actions/clientes';

export default function ClientesCliente({ clientesIniciales }) {
  const [clientes, setClientes] = useState(clientesIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const router = useRouter();

  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');

  // Buscador en tiempo real
  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    (c.identificacion && c.identificacion.includes(busqueda)) ||
    (c.email && c.email.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      setProcesando(true);
      const nuevo = await crearCliente({ nombre, identificacion, email, telefono, direccion });
      // Le agregamos el _count en 0 temporalmente para la UI
      setClientes([{ ...nuevo, _count: { casos: 0 } }, ...clientes]);
      setModalAbierto(false);
      setNombre(''); setIdentificacion(''); setEmail(''); setTelefono(''); setDireccion('');
      router.refresh();
    } catch (error) {
      alert("Error al guardar: " + error.message);
    } finally {
      setProcesando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar a este cliente?")) return;
    try {
      await eliminarCliente(id);
      setClientes(clientes.filter(c => c.id !== id));
      router.refresh();
    } catch (error) {
      alert(error.message); // Mostrará el mensaje si tiene expedientes asociados
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div>
            <Link href="/dashboard" className="inline-flex items-center text-xs font-bold text-[#1E3A8A] hover:text-blue-700 transition gap-1.5 uppercase tracking-wider mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Volver al Centro de Mando
            </Link>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Directorio de Clientes</h1>
            <p className="text-slate-500 font-medium mt-1 text-sm">Gestiona la información de contacto y el portafolio de tus asesorados.</p>
          </div>
          <button 
            onClick={() => setModalAbierto(true)}
            className="w-full md:w-auto bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
            Nuevo Cliente
          </button>
        </div>

        {/* Buscador */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
          <svg className="w-6 h-6 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input 
            type="text" 
            placeholder="Buscar cliente por nombre, cédula, NIT o correo..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full outline-none text-slate-700 font-medium text-sm md:text-base bg-transparent"
          />
        </div>

        {/* Grid de Clientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clientesFiltrados.length > 0 ? (
            clientesFiltrados.map(cliente => (
              <div key={cliente.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow relative group">
                <div className="p-6 flex-1">
                  
                  {/* Badge de cantidad de expedientes */}
                  <div className="absolute top-6 right-6">
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-wider ${cliente._count.casos > 0 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                      {cliente._count.casos} Expediente{cliente._count.casos !== 1 && 's'}
                    </span>
                  </div>

                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-[#1E3A8A] font-black text-xl mb-4 shadow-inner">
                    {cliente.nombre.charAt(0).toUpperCase()}
                  </div>
                  
                  <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1 truncate pr-20" title={cliente.nombre}>
                    {cliente.nombre}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold tracking-wider mb-4">
                    ID/NIT: <span className="font-medium">{cliente.identificacion || 'No registrado'}</span>
                  </p>
                  
                  <div className="space-y-2 mb-2">
                    {cliente.telefono && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                        {cliente.telefono}
                      </div>
                    )}
                    {cliente.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 truncate" title={cliente.email}>
                        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        <span className="truncate">{cliente.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                  <button onClick={() => handleEliminar(cliente.id)} className="px-3 py-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                  <Link href={`/dashboard/clientes/${cliente.id}`} className="flex-1 bg-white hover:bg-blue-50 text-[#1E3A8A] font-bold py-2 px-4 rounded-xl border border-blue-100 text-center transition-colors text-sm flex items-center justify-center gap-2">
                    Abrir Carpeta
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 bg-white rounded-3xl border border-dashed border-slate-300 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </div>
              <p className="text-slate-600 font-bold text-lg">Aún no tienes clientes registrados</p>
              <p className="text-slate-500 text-sm mt-1 mb-6">Empieza agregando a tu primer asesorado.</p>
              <button onClick={() => setModalAbierto(true)} className="bg-[#1E3A8A] text-white font-bold py-2.5 px-6 rounded-xl shadow-md">
                + Crear Primer Cliente
              </button>
            </div>
          )}
        </div>

        {/* Modal Nuevo Cliente */}
        {modalAbierto && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
              <div className="bg-[#1E3A8A] p-6 text-white shrink-0">
                <h3 className="font-black text-xl">Registrar Nuevo Cliente</h3>
                <p className="text-blue-200 text-xs mt-1">Ingresa los datos básicos de la persona o empresa.</p>
              </div>
              <form onSubmit={handleGuardar} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre Completo o Razón Social *</label>
                  <input required type="text" value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Ej: Constructora Andina S.A.S" className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#1E3A8A] font-medium"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">NIT / Cédula</label>
                    <input type="text" value={identificacion} onChange={e=>setIdentificacion(e.target.value)} placeholder="Ej: 900.123.456-7" className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#1E3A8A] text-sm"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Teléfono / Celular</label>
                    <input type="text" value={telefono} onChange={e=>setTelefono(e.target.value)} placeholder="Ej: 300 123 4567" className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#1E3A8A] text-sm"/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Correo Electrónico</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Ej: gerencia@constructora.com" className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#1E3A8A] text-sm"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dirección Física</label>
                  <input type="text" value={direccion} onChange={e=>setDireccion(e.target.value)} placeholder="Ej: Calle 100 # 15-20, Bogotá" className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#1E3A8A] text-sm"/>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setModalAbierto(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition">Cancelar</button>
                  <button type="submit" disabled={procesando} className="flex-1 bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition">
                    {procesando ? 'Guardando...' : 'Crear Cliente'}
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

// 4. Actualizar un cliente existente
export async function actualizarCliente(id, data) {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  const cliente = await prisma.cliente.findUnique({ where: { id } });
  if (!cliente || cliente.userId !== user.id) throw new Error("No autorizado");

  return await prisma.cliente.update({
    where: { id },
    data: {
      nombre: data.nombre,
      identificacion: data.identificacion || null,
      email: data.email || null,
      telefono: data.telefono || null,
      direccion: data.direccion || null,
      notas: data.notas || null,
    }
  });
}