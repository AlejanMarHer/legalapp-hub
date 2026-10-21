"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { registrarAbono } from '@/app/actions/financiero';

// Se agregaron las props de config: nombreOficial y firmaBase64
export default function BotonRegistrarPago({ caso, nombreOficial, firmaBase64 }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [monto, setMonto] = useState('');
  const [concepto, setConcepto] = useState('Abono a honorarios');
  const [procesando, setProcesando] = useState(false);
  const router = useRouter();

  const formatCOP = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  const generarReciboPDF = (abono) => {
    const doc = new jsPDF();
    const primaryColor = [21, 128, 61]; // Verde oscuro
    const nombreCliente = caso.calidadProcesal?.includes('Demandada') ? caso.demandado : caso.demandante;

    // Encabezado
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("RECIBO DE CAJA", 105, 22, { align: "center" });
    
    // Datos del recibo
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const fechaActual = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    
    autoTable(doc, {
      startY: 45,
      theme: 'plain',
      body: [
        ['Fecha:', fechaActual],
        ['Recibido de:', nombreCliente.toUpperCase()],
        ['La suma de:', formatCOP(abono.monto)],
        ['Por concepto de:', abono.concepto],
        ['Radicado Asociado:', caso.radicado || 'En trámite']
      ],
      styles: { fontSize: 11, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
    });

    let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : 120;

    // Resumen financiero
    doc.setDrawColor(200, 200, 200);
    doc.line(14, finalY, 196, finalY);
    
    doc.setFont("helvetica", "bold");
    doc.text("ESTADO DE CUENTA ACTUALIZADO", 14, finalY + 10);
    doc.setFont("helvetica", "normal");
    
    const nuevoSaldo = (caso.saldoHonorarios || 0) - abono.monto;
    const saldoMostrar = nuevoSaldo < 0 ? 0 : nuevoSaldo;

    autoTable(doc, {
      startY: finalY + 15,
      theme: 'grid',
      headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42] },
      body: [
        ['Saldo Anterior:', formatCOP(caso.saldoHonorarios || 0)],
        ['Abono Actual:', formatCOP(abono.monto)],
        ['Nuevo Saldo Deudor:', formatCOP(saldoMostrar)]
      ]
    });

    finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : 200;

    // Inyectamos la FIRMA si existe, si no, dibujamos una línea
    if (firmaBase64) {
      try {
        doc.addImage(firmaBase64, 'PNG', 14, finalY, 50, 25);
        finalY += 25; // Bajamos el texto de abajo para dejarle espacio a la foto
      } catch (e) {
        console.error("Error cargando firma", e);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.line(14, finalY + 15, 80, finalY + 15);
        finalY += 15;
      }
    } else {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(14, finalY + 15, 80, finalY + 15);
      finalY += 15;
    }

    doc.setFont("helvetica", "bold");
    doc.text(nombreOficial.toUpperCase(), 14, finalY + 5);
    doc.setFont("helvetica", "normal");
    doc.text("Firma de Recibido", 14, finalY + 10);

    doc.save(`Recibo_Caja_${nombreCliente.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
  };

  const handleRegistrar = async (e) => {
    e.preventDefault();
    if (!monto || isNaN(monto) || monto <= 0) return alert("Ingresa un monto válido");
    
    try {
      setProcesando(true);
      const abonoGuardado = await registrarAbono(caso.id, monto, concepto);
      generarReciboPDF(abonoGuardado);
      setModalAbierto(false);
      setMonto('');
      setConcepto('Abono a honorarios');
      router.refresh();
    } catch (error) {
      alert("Error al registrar: " + error.message);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setModalAbierto(true)}
        className="w-full mt-3 bg-emerald-100 hover:bg-emerald-600 text-emerald-800 hover:text-white font-bold py-2 px-4 rounded-lg border border-emerald-200 hover:border-emerald-600 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Registrar Pago
      </button>

      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-emerald-600 p-4">
              <h3 className="text-white font-bold text-lg">Registrar Nuevo Abono</h3>
            </div>
            <form onSubmit={handleRegistrar} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Monto Recibido ($ COP)</label>
                <input 
                  type="number" 
                  required
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="Ej: 500000"
                  className="w-full border border-slate-200 rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Concepto del Pago</label>
                <input 
                  type="text" 
                  required
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setModalAbierto(false)}
                  disabled={procesando}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={procesando}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center"
                >
                  {procesando ? 'Guardando...' : 'Guardar y Generar PDF'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}