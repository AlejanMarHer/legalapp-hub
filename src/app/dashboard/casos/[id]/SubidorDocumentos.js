"use client"

import React, { useState } from 'react';
import { subirDocumentoExpediente } from '@/app/actions/documentos';

export default function SubidorDocumentos({ casoId }) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");

  const handleSubida = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setErrorMensaje("Por favor sube únicamente archivos en formato PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) { 
      setErrorMensaje("El archivo es muy pesado. El límite es de 10MB.");
      return;
    }

    setIsUploading(true);
    setErrorMensaje("");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('casoId', casoId);

    try {
      const result = await subirDocumentoExpediente(formData);
      
      if (!result.exito) {
        setErrorMensaje(result.mensaje);
      }
    } catch (error) {
      console.error("Error en la subida:", error);
      // Aquí mostraremos el error real que devuelva el servidor
      setErrorMensaje(`Fallo técnico: ${error.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = null; 
    }
  };

  return (
    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 border-dashed relative">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-indigo-900">Anexar Demanda o Auto (PDF)</p>
          <p className="text-xs text-indigo-600 mt-0.5">Sube el documento material para que Litis IA pueda leerlo.</p>
        </div>
        
        <div className="relative w-full md:w-auto">
          <input 
            type="file" 
            accept="application/pdf"
            onChange={handleSubida}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <button 
            type="button"
            disabled={isUploading}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-sm transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Subiendo a la nube...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                Seleccionar PDF
              </>
            )}
          </button>
        </div>
      </div>
      
      {errorMensaje && (
        <p className="text-xs text-red-600 font-bold mt-3 bg-red-50 p-2 rounded text-center">
          ⚠️ {errorMensaje}
        </p>
      )}
    </div>
  );
}