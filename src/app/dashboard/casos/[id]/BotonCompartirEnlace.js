"use client";

import React, { useState } from 'react';

export default function BotonCompartirEnlace({ publicToken, radicado }) {
  const [copiado, setCopiado] = useState(false);

  const copiarEnlace = async () => {
    // Genera la URL dinámica basada en el dominio actual (localhost o producción)
    const url = `${window.location.origin}/estado/${publicToken}`;
    const numeroRadicado = radicado ? radicado : 'En etapa preliminar';
    
    // El texto diseñado para enviar por WhatsApp
    const mensaje = `Hola. Pensando en tu tranquilidad, he habilitado un Portal de Transparencia para tu proceso judicial (Radicado: ${numeroRadicado}).\n\nPuedes hacerle seguimiento en tiempo real a las actuaciones judiciales ingresando a este enlace único y seguro:\n${url}`;
    
    try {
      await navigator.clipboard.writeText(mensaje);
      setCopiado(true);
      // Devuelve el botón a su estado normal después de 3 segundos
      setTimeout(() => setCopiado(false), 3000);
    } catch (err) {
      console.error("Error al copiar al portapapeles:", err);
    }
  };

  return (
    <button 
      onClick={copiarEnlace}
      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-5 rounded-xl shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
    >
      {copiado ? (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          ¡Enlace Copiado!
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Compartir Portal
        </>
      )}
    </button>
  );
}