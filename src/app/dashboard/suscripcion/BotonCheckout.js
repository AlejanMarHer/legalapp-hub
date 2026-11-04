"use client";

import { useState } from 'react';

export default function BotonCheckout() {
  const [cargando, setCargando] = useState(false);

  const procesarPago = async () => {
    setCargando(true);
    try {
      const response = await fetch('/api/checkout', { method: 'POST' });
      
      if (!response.ok) {
        throw new Error('Fallo en el servidor de pagos');
      }
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un problema conectando con la pasarela. Intenta de nuevo.");
      setCargando(false);
    }
  };

  return (
    <button 
      onClick={procesarPago}
      disabled={cargando}
      className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-900 font-black py-4 rounded-xl shadow-[0_10px_25px_rgba(245,158,11,0.5)] transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
    >
      {cargando ? "CONECTANDO CON LA PASARELA..." : "ACTUALIZAR A PRO AHORA"}
    </button>
  );
}