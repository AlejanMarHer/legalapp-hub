'use client';

import React from 'react';

export default function BotonEliminar({ liquidacionId, borrarAction }) {
  const manejarBorrado = async () => {
    // Aquí invocamos la ventana de advertencia nativa del navegador
    const confirmado = window.confirm("⚠️ ¿Estás seguro de que deseas eliminar este cálculo?\n\nEsta acción no se puede deshacer y se borrará permanentemente del expediente.");
    
    // Si el usuario hace clic en "Sí / Aceptar", ejecutamos el borrado
    if (confirmado) {
      const formData = new FormData();
      formData.append('liquidacionId', liquidacionId);
      await borrarAction(formData);
    }
  };

  return (
    <button 
      onClick={manejarBorrado} 
      className="absolute top-6 right-6 text-red-400 hover:text-red-700 transition bg-red-50 hover:bg-red-100 p-2 rounded-lg" 
      title="Eliminar este cálculo"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
      </svg>
    </button>
  );
}