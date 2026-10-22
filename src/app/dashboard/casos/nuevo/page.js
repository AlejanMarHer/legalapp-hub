"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { guardarNuevoExpediente } from '../../../actions/expedientes';

function FormularioExpediente() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  
  const clienteIdUrl = searchParams.get('clienteId');
  const nombreClienteUrl = searchParams.get('nombre');

  const [formData, setFormData] = useState({
    clienteId: clienteIdUrl || '',
    radicado: '', juzgado: '', ciudad: 'Bogotá D.C.', areaDerecho: 'Civil', claseProceso: '', estadoInterno: 'Activo',
    demandante: '', idDemandante: '', demandado: '', idDemandado: '', calidadProcesal: 'Apoderado Demandante',
    cuantia: '', capitalBase: '', honorariosPactados: '', saldoHonorarios: '',
    telCliente: '', emailCliente: '', dirCliente: '', notasContacto: '',
    abogadoContraparte: '', emailContraparte: '', telContraparte: '',
    fechaPresentacion: '', fechaAdmision: '', fechaVencimiento: '', descVencimiento: '',
    resumenHechos: '', apuntesPrivados: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const casoId = await guardarNuevoExpediente(formData);
      router.push(`/dashboard/casos/${casoId}`);
    } catch (error) {
      alert("Error al guardar el expediente: " + error.message);
      setIsSaving(false);
    }
  };

  // BLOQUEO ESTRICTO: Si no hay un cliente asociado en la URL, no mostramos el formulario
  if (!clienteIdUrl) {
    return (
      <div className="flex flex-col items-center justify-center bg-white p-10 rounded-3xl shadow-sm border border-red-100 text-center mt-10">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Acción no permitida</h2>
        <p className="text-slate-500 mb-8 max-w-md">Para mantener tu despacho organizado, todos los expedientes deben pertenecer a un cliente. Ve al Directorio de Clientes y crea el expediente desde su respectiva carpeta.</p>
        <Link href="/dashboard/clientes" className="bg-[#1E3A8A] text-white font-bold py-3.5 px-8 rounded-xl shadow-md hover:bg-blue-800 transition-colors">
          Ir al Directorio de Clientes
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Link href={`/dashboard/clientes/${clienteIdUrl}`} className="text-blue-600 flex items-center gap-2 hover:underline font-medium text-sm w-fit mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Volver al perfil de {nombreClienteUrl}
      </Link>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Radicar Nuevo Expediente</h1>
        <p className="text-slate-500 mt-1 text-sm">Ingresa los datos procesales para crear un nuevo registro completo en tu despacho virtual.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 pb-20">
        
        {/* Píldora del CRM */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 md:p-8 rounded-2xl shadow-sm border border-blue-100">
          <h2 className="text-lg font-black text-blue-900 pb-3 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Asignación del CRM (Bloqueado)
          </h2>
          <div className="bg-white p-4 rounded-xl border border-blue-200 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-0.5">Expediente asociado permanentemente a:</p>
              <p className="font-bold text-slate-800 text-lg">{nombreClienteUrl}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
            </div>
          </div>
        </div>

        {/* SECCIÓN 1: Identificación */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> 
            Identificación del Proceso
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Número de Radicado (21 dígitos)</label>
              <input type="text" name="radicado" value={formData.radicado} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Ej. 11001400301720240012300" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Despacho Judicial</label>
              <input type="text" name="juzgado" value={formData.juzgado} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Ej. Juzgado 17 Civil del Circuito de Bogotá" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Ciudad / Municipio</label>
              <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Ej. Bogotá D.C." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Área del Derecho</label>
              <select name="areaDerecho" value={formData.areaDerecho} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all bg-white cursor-pointer">
                <option value="Civil">Civil</option>
                <option value="Laboral">Laboral</option>
                <option value="Familia">Familia</option>
                <option value="Administrativo">Administrativo</option>
                <option value="Penal">Penal</option>
                <option value="Disciplinario">Disciplinario</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Clase de Proceso</label>
              <input type="text" name="claseProceso" value={formData.claseProceso} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Ej. Ejecutivo Singular, Ordinario..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Estado Interno</label>
              <select name="estadoInterno" value={formData.estadoInterno} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all bg-white cursor-pointer">
                <option value="Activo">Activo</option>
                <option value="Suspendido">Suspendido</option>
                <option value="En Apelación">En Apelación</option>
                <option value="Terminado">Terminado</option>
                <option value="Archivado">Archivado</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: Partes Procesales */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span> 
            Partes Procesales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Demandante / Accionante <span className="text-red-500">*</span></label>
              <input type="text" name="demandante" value={formData.demandante} onChange={handleChange} required className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all bg-blue-50/30" placeholder="Nombre completo o Razón Social" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Identificación Demandante</label>
              <input type="text" name="idDemandante" value={formData.idDemandante} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="C.C. o NIT" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Demandado / Accionado <span className="text-red-500">*</span></label>
              <input type="text" name="demandado" value={formData.demandado} onChange={handleChange} required className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all bg-red-50/30" placeholder="Nombre completo o Razón Social" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Identificación Demandado</label>
              <input type="text" name="idDemandado" value={formData.idDemandado} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="C.C. o NIT" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Nuestra Calidad Procesal</label>
              <select name="calidadProcesal" value={formData.calidadProcesal} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all bg-white cursor-pointer">
                <option value="Apoderado Demandante">Apoderado Demandante</option>
                <option value="Apoderado Demandada">Apoderado Parte Demandada</option>
                <option value="Llamado en Garantía">Llamado en Garantía</option>
                <option value="Litisconsorte">Litisconsorte</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: Financieros */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span> 
            Datos Financieros y Honorarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Cuantía Estimada (COP)</label>
              <input type="number" name="cuantia" value={formData.cuantia} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Ej. 50000000" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Capital Base / Suerte Principal (COP)</label>
              <input type="number" name="capitalBase" value={formData.capitalBase} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Ej. 45000000" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Honorarios Pactados</label>
              <input type="text" name="honorariosPactados" value={formData.honorariosPactados} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Ej. 20% Cuota Litis" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Saldo Pendiente (COP)</label>
              <input type="number" name="saldoHonorarios" value={formData.saldoHonorarios} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Ej. 2500000" />
            </div>
          </div>
        </div>

        {/* SECCIÓN 4: Contactos */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span> 
            Directorio de Contactos
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3">Datos de Nuestro Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Teléfono / WhatsApp</label>
                  <input type="text" name="telCliente" value={formData.telCliente} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Ej. 300 123 4567" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Correo Electrónico</label>
                  <input type="email" name="emailCliente" value={formData.emailCliente} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="cliente@correo.com" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Dirección Física</label>
                  <input type="text" name="dirCliente" value={formData.dirCliente} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Dirección completa" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Notas de Contacto</label>
                  <input type="text" name="notasContacto" value={formData.notasContacto} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Ej. Llamar solo en las mañanas..." />
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Inteligencia Procesal (Contraparte)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Abogado Titular Contraparte</label>
                  <input type="text" name="abogadoContraparte" value={formData.abogadoContraparte} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Nombre del apoderado" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Correo Notificación Judicial</label>
                  <input type="email" name="emailContraparte" value={formData.emailContraparte} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="abogado@correo.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Teléfono Contraparte</label>
                  <input type="text" name="telContraparte" value={formData.telContraparte} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Para explorar conciliaciones" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 5: Hitos */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span> 
            Hitos, Plazos y Observaciones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Fecha Presentación Demanda</label>
              <input type="date" name="fechaPresentacion" value={formData.fechaPresentacion} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all bg-white cursor-pointer" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Fecha Auto Admisorio / Mandamiento</label>
              <input type="date" name="fechaAdmision" value={formData.fechaAdmision} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all bg-white cursor-pointer" />
            </div>
            <div className="md:col-span-2 bg-orange-50/50 p-5 rounded-xl border border-orange-100 mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-xs font-bold text-orange-800 mb-1">Próximo Vencimiento</label>
                <input type="date" name="fechaVencimiento" value={formData.fechaVencimiento} onChange={handleChange} className="w-full border border-orange-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white text-orange-900 cursor-pointer" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-orange-800 mb-1">Descripción del Vencimiento</label>
                <input type="text" name="descVencimiento" value={formData.descVencimiento} onChange={handleChange} className="w-full border border-orange-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white text-orange-900" placeholder="Ej. Contestar excepciones de mérito" />
              </div>
            </div>
            <div className="md:col-span-2 mt-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Resumen de Hechos / Teoría del Caso</label>
              <textarea name="resumenHechos" value={formData.resumenHechos} onChange={handleChange} rows="3" className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all resize-none" placeholder="Breve descripción fáctica del proceso..."></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Apuntes Privados y Estrategia</label>
              <textarea name="apuntesPrivados" value={formData.apuntesPrivados} onChange={handleChange} rows="3" className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all resize-none bg-slate-50" placeholder="Notas internas exclusivas para el despacho..."></textarea>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isSaving} className="bg-[#1E3A8A] hover:bg-blue-800 text-white font-extrabold py-4 px-10 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
            {isSaving ? 'Guardando...' : 'GUARDAR EXPEDIENTE COMPLETO'}
            {!isSaving && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NuevoExpedientePage() {
  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <Suspense fallback={<div className="p-8 text-center text-slate-500 font-bold">Cargando formulario...</div>}>
          <FormularioExpediente />
        </Suspense>
      </div>
    </div>
  );
}