"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { obtenerExpediente, actualizarExpediente } from '../../../../actions/expedientes';

export default function EditarExpedientePage() {
  const router = useRouter();
  const params = useParams();
  const casoId = params.id;
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    radicado: '', juzgado: '', ciudad: '', areaDerecho: 'Civil', claseProceso: '', estadoInterno: 'Activo',
    demandante: '', idDemandante: '', demandado: '', idDemandado: '', calidadProcesal: '',
    cuantia: '', capitalBase: '', honorariosPactados: '', saldoHonorarios: '',
    telCliente: '', emailCliente: '', dirCliente: '', notasContacto: '',
    abogadoContraparte: '', emailContraparte: '', telContraparte: '',
    fechaPresentacion: '', fechaAdmision: '', fechaVencimiento: '', descVencimiento: '',
    resumenHechos: '', apuntesPrivados: ''
  });

  // Utilidad para formatear fechas al formato YYYY-MM-DD que requieren los inputs type="date"
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
  };

  useEffect(() => {
    async function cargarDatos() {
      try {
        const caso = await obtenerExpediente(casoId);
        setFormData({
          radicado: caso.radicado || '', juzgado: caso.juzgado || '', ciudad: caso.ciudad || '', 
          areaDerecho: caso.areaDerecho || 'Civil', claseProceso: caso.claseProceso || '', estadoInterno: caso.estadoInterno || 'Activo',
          demandante: caso.demandante || '', idDemandante: caso.idDemandante || '', demandado: caso.demandado || '', idDemandado: caso.idDemandado || '', 
          calidadProcesal: caso.calidadProcesal || 'Apoderado Demandante',
          cuantia: caso.cuantia || '', capitalBase: caso.capitalBase || '', honorariosPactados: caso.honorariosPactados || '', saldoHonorarios: caso.saldoHonorarios || '',
          telCliente: caso.telCliente || '', emailCliente: caso.emailCliente || '', dirCliente: caso.dirCliente || '', notasContacto: caso.notasContacto || '',
          abogadoContraparte: caso.abogadoContraparte || '', emailContraparte: caso.emailContraparte || '', telContraparte: caso.telContraparte || '',
          fechaPresentacion: formatDateForInput(caso.fechaPresentacion),
          fechaAdmision: formatDateForInput(caso.fechaAdmision),
          fechaVencimiento: formatDateForInput(caso.fechaVencimiento),
          descVencimiento: caso.descVencimiento || '',
          resumenHechos: caso.resumenHechos || '', apuntesPrivados: caso.apuntesPrivados || ''
        });
        setIsLoading(false);
      } catch (error) {
        alert("Error cargando expediente: " + error.message);
      }
    }
    cargarDatos();
  }, [casoId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await actualizarExpediente(casoId, formData);
      router.push(`/dashboard/casos/${casoId}`);
    } catch (error) {
      alert("Error al actualizar el expediente: " + error.message);
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center font-bold text-[#1E3A8A]">Cargando expediente para edición...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <Link href={`/dashboard/casos/${casoId}`} className="text-blue-600 flex items-center gap-2 hover:underline font-medium text-sm w-fit">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Cancelar y Volver
        </Link>

        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Editar Expediente</h1>
          <p className="text-slate-500 mt-1 text-sm">Actualiza los datos del caso seleccionado. Los cambios se guardarán de inmediato.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pb-20">
          
          {/* SECCIÓN 1: Identificación */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">1. Identificación del Proceso</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Número de Radicado</label>
                <input type="text" name="radicado" value={formData.radicado} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Despacho Judicial</label>
                <input type="text" name="juzgado" value={formData.juzgado} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Ciudad / Municipio</label>
                <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Área del Derecho</label>
                <select name="areaDerecho" value={formData.areaDerecho} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600 bg-white">
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
                <input type="text" name="claseProceso" value={formData.claseProceso} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Estado Interno</label>
                <select name="estadoInterno" value={formData.estadoInterno} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600 bg-white">
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
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">2. Partes Procesales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Demandante / Accionante <span className="text-red-500">*</span></label>
                <input type="text" name="demandante" value={formData.demandante} onChange={handleChange} required className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none bg-blue-50/30 focus:ring-2 focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Identificación Demandante</label>
                <input type="text" name="idDemandante" value={formData.idDemandante} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Demandado / Accionado <span className="text-red-500">*</span></label>
                <input type="text" name="demandado" value={formData.demandado} onChange={handleChange} required className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none bg-red-50/30 focus:ring-2 focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Identificación Demandado</label>
                <input type="text" name="idDemandado" value={formData.idDemandado} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Nuestra Calidad Procesal</label>
                <select name="calidadProcesal" value={formData.calidadProcesal} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600 bg-white">
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
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">3. Datos Financieros y Honorarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Cuantía Estimada (COP)</label>
                <input type="number" name="cuantia" value={formData.cuantia} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Capital Base / Suerte Principal (COP)</label>
                <input type="number" name="capitalBase" value={formData.capitalBase} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Honorarios Pactados</label>
                <input type="text" name="honorariosPactados" value={formData.honorariosPactados} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Saldo de Honorarios Pendiente (COP)</label>
                <input type="number" name="saldoHonorarios" value={formData.saldoHonorarios} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: Contactos */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">4. Directorio de Contactos</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">Datos de Nuestro Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Teléfono / WhatsApp</label>
                    <input type="text" name="telCliente" value={formData.telCliente} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Correo Electrónico</label>
                    <input type="email" name="emailCliente" value={formData.emailCliente} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Dirección Física</label>
                    <input type="text" name="dirCliente" value={formData.dirCliente} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Notas de Contacto</label>
                    <input type="text" name="notasContacto" value={formData.notasContacto} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Inteligencia Procesal (Contraparte)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Abogado Titular Contraparte</label>
                    <input type="text" name="abogadoContraparte" value={formData.abogadoContraparte} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Correo de Notificación Judicial</label>
                    <input type="email" name="emailContraparte" value={formData.emailContraparte} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Teléfono Contraparte</label>
                    <input type="text" name="telContraparte" value={formData.telContraparte} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 5: Hitos */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">5. Hitos, Plazos y Observaciones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Fecha Presentación Demanda</label>
                <input type="date" name="fechaPresentacion" value={formData.fechaPresentacion} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Fecha Auto Admisorio / Mandamiento</label>
                <input type="date" name="fechaAdmision" value={formData.fechaAdmision} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600 bg-white" />
              </div>
              <div className="md:col-span-2 bg-orange-50/50 p-5 rounded-xl border border-orange-100 mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-orange-800 mb-1">Próximo Vencimiento</label>
                  <input type="date" name="fechaVencimiento" value={formData.fechaVencimiento} onChange={handleChange} className="w-full border border-orange-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 bg-white text-orange-900" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-orange-800 mb-1">Descripción del Vencimiento</label>
                  <input type="text" name="descVencimiento" value={formData.descVencimiento} onChange={handleChange} className="w-full border border-orange-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 bg-white text-orange-900" />
                </div>
              </div>
              <div className="md:col-span-2 mt-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Resumen de Hechos / Teoría del Caso</label>
                <textarea name="resumenHechos" value={formData.resumenHechos} onChange={handleChange} rows="3" className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600 resize-none"></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Apuntes Privados y Estrategia</label>
                <textarea name="apuntesPrivados" value={formData.apuntesPrivados} onChange={handleChange} rows="3" className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600 resize-none bg-slate-50"></textarea>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isSaving} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 px-10 rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? 'Actualizando...' : 'GUARDAR CAMBIOS EN EXPEDIENTE'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}