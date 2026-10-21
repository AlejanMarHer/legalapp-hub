"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { guardarConfiguracion } from '@/app/actions/configuracion';

export default function ConfiguracionCliente({ configInicial }) {
  const [nombreDespacho, setNombreDespacho] = useState(configInicial?.nombreDespacho || '');
  const [logoBase64, setLogoBase64] = useState(configInicial?.logoBase64 || '');
  const [firmaBase64, setFirmaBase64] = useState(configInicial?.firmaBase64 || '');
  const [procesando, setProcesando] = useState(false);
  const router = useRouter();

  // Función mágica que convierte tu imagen a texto seguro para la base de datos
  const procesarImagen = (e, tipo) => {
    const file = e.target.files[0];
    if (!file) return;

    // Evitamos imágenes gigantes que pongan lento el sistema (Límite 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("⚠️ La imagen es muy pesada. Por favor sube una imagen de menos de 2MB para mantener tu sistema rápido.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (tipo === 'logo') setLogoBase64(reader.result);
      if (tipo === 'firma') setFirmaBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      setProcesando(true);
      await guardarConfiguracion({ nombreDespacho, logoBase64, firmaBase64 });
      alert("✅ ¡Identidad visual guardada con éxito! Tus próximos documentos usarán esta configuración.");
      router.refresh();
    } catch (error) {
      alert("Error al guardar: " + error.message);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4 mb-2">
          <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-[#1E3A8A] hover:text-blue-700 transition gap-1.5 bg-white border border-blue-100 px-4 py-2 rounded-xl shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Volver al Centro de Mando
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-[#1E3A8A] p-8 text-white">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Marca Blanca Institucional</h1>
            <p className="text-blue-200 font-medium mt-2">Personaliza el nombre, logo y firma que aparecerá en todos tus PDFs y documentos de Word.</p>
          </div>

          <form onSubmit={handleGuardar} className="p-8 space-y-8">
            
            {/* NOMBRE DEL DESPACHO */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre Oficial del Despacho / Firma</label>
              <input 
                type="text" 
                required
                value={nombreDespacho}
                onChange={(e) => setNombreDespacho(e.target.value)}
                placeholder="Ej: Alejandro Martinez Abogados"
                className="w-full border border-slate-300 rounded-xl p-4 text-slate-800 focus:ring-2 focus:ring-[#1E3A8A] outline-none font-medium text-lg"
              />
              <p className="text-xs text-slate-400 mt-2">Este nombre encabezará tus recibos de caja, reportes y pantalla principal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
              
              {/* SUBIR LOGO */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Logotipo Institucional</label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 relative hover:bg-slate-100 transition h-48">
                  {logoBase64 ? (
                    <img src={logoBase64} alt="Logo Preview" className="h-full object-contain p-2" />
                  ) : (
                    <div className="text-center">
                      <svg className="w-10 h-10 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      <p className="text-sm font-bold text-slate-500">Sube tu Logo</p>
                      <p className="text-xs text-slate-400 mt-1">PNG o JPG (Fondo transparente ideal)</p>
                    </div>
                  )}
                  <input type="file" accept="image/png, image/jpeg" onChange={(e) => procesarImagen(e, 'logo')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                {logoBase64 && <button type="button" onClick={() => setLogoBase64('')} className="text-xs font-bold text-red-500 hover:underline w-full text-center">Eliminar Logo</button>}
              </div>

              {/* SUBIR FIRMA */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Firma Escaneada</label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 relative hover:bg-slate-100 transition h-48">
                  {firmaBase64 ? (
                    <img src={firmaBase64} alt="Firma Preview" className="h-full object-contain p-2" />
                  ) : (
                    <div className="text-center">
                      <svg className="w-10 h-10 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                      <p className="text-sm font-bold text-slate-500">Sube tu Firma</p>
                      <p className="text-xs text-slate-400 mt-1">Hazlo en papel blanco con lapicero negro/azul</p>
                    </div>
                  )}
                  <input type="file" accept="image/png, image/jpeg" onChange={(e) => procesarImagen(e, 'firma')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                {firmaBase64 && <button type="button" onClick={() => setFirmaBase64('')} className="text-xs font-bold text-red-500 hover:underline w-full text-center">Eliminar Firma</button>}
              </div>

            </div>

            <div className="pt-6 border-t border-slate-100">
              <button 
                type="submit" 
                disabled={procesando}
                className="w-full bg-[#1E3A8A] hover:bg-blue-800 text-white font-black py-4 rounded-xl shadow-lg transition-all text-lg flex items-center justify-center gap-2"
              >
                {procesando ? 'Guardando Ajustes...' : 'Guardar Identidad Visual'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}