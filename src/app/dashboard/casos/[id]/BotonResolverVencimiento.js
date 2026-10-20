"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resolverVencimiento } from '@/app/actions/expedientes'; // <-- CORRECCIÓN DE LA RUTA

export default function BotonResolverVencimiento({ casoId, descVencimiento }) {
  const [isResolving, setIsResolving] = useState(false);
  const router = useRouter();

  const handleResolver = async () => {
    const detalles = window.prompt(
      `¿Qué gestión realizaste para resolver el vencimiento "${descVencimiento || 'pendiente'}"?\n\nEsto se guardará automáticamente en tu bitácora de gestiones y borrará el vencimiento de la agenda.`
    );
    
    if (!detalles) return;

    try {
      setIsResolving(true);
      await resolverVencimiento(casoId, detalles);
      router.refresh();
    } catch (error) {
      alert("Error al guardar la gestión: " + error.message);
      setIsResolving(false);
    }
  };

  return (
    <button 
      onClick={handleResolver}
      disabled={isResolving}
      className="mt-3 w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 text-xs"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
      </svg>
      {isResolving ? 'Procesando...' : 'Marcar como Gestionado'}
    </button>
  );
}