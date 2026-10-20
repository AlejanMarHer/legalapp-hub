"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resolverVencimiento } from '@/app/actions/expedientes';

export default function BotonResolverDashboard({ casoId, descVencimiento }) {
  const [isResolving, setIsResolving] = useState(false);
  const router = useRouter();

  const handleResolver = async () => {
    const detalles = window.prompt(
      `¿Qué gestión realizaste para resolver el vencimiento "${descVencimiento || 'pendiente'}"?\n\nEsto actualizará la bitácora del expediente y lo quitará de tu panel principal.`
    );
    
    if (!detalles) return;

    try {
      setIsResolving(true);
      await resolverVencimiento(casoId, detalles);
      router.refresh(); // Recarga el dashboard para que desaparezca de la lista
    } catch (error) {
      alert("Error al guardar la gestión: " + error.message);
      setIsResolving(false);
    }
  };

  return (
    <button 
      onClick={handleResolver}
      disabled={isResolving}
      className="mt-3 w-full bg-orange-50 hover:bg-orange-500 text-orange-700 hover:text-white font-bold py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 text-[11px] border border-orange-200 hover:border-orange-500 uppercase tracking-wider"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
      </svg>
      {isResolving ? 'Guardando...' : 'Gestionar'}
    </button>
  );
}