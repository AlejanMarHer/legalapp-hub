"use client";

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Se agregaron las props de config: nombreOficial, logoBase64 y firmaBase64
export default function BotonReporteCliente({ caso, nombreOficial, logoBase64, firmaBase64 }) {
  const [generando, setGenerando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [novedadDia, setNovedadDia] = useState('');

  const generarPDF = () => {
    try {
      setGenerando(true);
      const doc = new jsPDF();
      const primaryColor = [30, 58, 138];

      // INYECTAMOS EL LOGO SI EXISTE (Esquina superior izquierda)
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'PNG', 14, 10, 30, 30); // x, y, ancho, alto
        } catch (e) {
          console.error("Error al cargar el logo en el PDF", e);
        }
      }

      // Encabezado (Ajustado para no pisar el logo)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(...primaryColor);
      doc.text("REPORTE DE ESTADO DEL PROCESO", 200, 20, { align: "right" });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-CO')}`, 200, 28, { align: "right" });

      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(14, 45, 196, 45);

      // NOVEDAD DEL DÍA (Si el abogado la escribió)
      let currentY = 55;
      if (novedadDia.trim() !== '') {
        doc.setFillColor(248, 250, 252); // Fondo gris muy clarito
        doc.rect(14, currentY, 182, 35, 'F');
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(11);
        doc.text("ACTUALIZACIÓN RECIENTE:", 20, currentY + 10);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        
        const lineasNovedad = doc.splitTextToSize(novedadDia, 170);
        doc.text(lineasNovedad, 20, currentY + 18);
        
        currentY += 45;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("DATOS GENERALES DEL EXPEDIENTE", 14, currentY);

      autoTable(doc, {
        startY: currentY + 5,
        theme: 'plain',
        body: [
          ['Radicado:', caso.radicado || 'Sin asignar'],
          ['Juzgado:', caso.juzgado || 'Sin asignar'],
          ['Demandante:', caso.demandante],
          ['Demandado:', caso.demandado]
        ],
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35 } }
      });

      let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : currentY + 40;

      // Bitácora de Gestiones
      if (caso.apuntesPrivados) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("RESUMEN DE ACTUACIONES Y GESTIONES", 14, finalY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        
        // CORRECCIÓN: Limpieza de Emojis para jsPDF y división de líneas
        const textoLimpio = caso.apuntesPrivados.replace(/📌/g, '>');
        const lineasApuntes = doc.splitTextToSize(textoLimpio, 182);
        
        doc.text(lineasApuntes, 14, finalY + 8);
        finalY += (lineasApuntes.length * 5) + 15;
      }

      // FIRMA Y NOMBRE DEL DESPACHO
      if (firmaBase64) {
        try {
          // Si por alguna razón los apuntes son larguísimos y la firma no cabe, agregamos página
          if (finalY > 250) { doc.addPage(); finalY = 20; }
          doc.addImage(firmaBase64, 'PNG', 14, finalY, 50, 25);
          finalY += 25;
        } catch (e) {
          console.error("Error al cargar la firma en el PDF", e);
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.3);
          doc.line(14, finalY + 15, 80, finalY + 15);
          finalY += 15;
        }
      } else {
        if (finalY > 260) { doc.addPage(); finalY = 20; }
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.line(14, finalY + 15, 80, finalY + 15);
        finalY += 15;
      }

      doc.setFont("helvetica", "bold");
      doc.text(nombreOficial.toUpperCase(), 14, finalY + 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Generado a través de LitisApp", 14, finalY + 10);

      doc.save(`Reporte_${caso.radicado || caso.demandado}_${new Date().getTime()}.pdf`);
      setModalAbierto(false);
      setNovedadDia('');

    } catch (error) {
      alert("Error al generar el PDF: " + error.message);
    } finally {
      setGenerando(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setModalAbierto(true)}
        disabled={generando}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-5 rounded-xl shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
        {generando ? 'Generando PDF...' : 'Reporte a Cliente'}
      </button>

      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="bg-[#1E3A8A] p-5">
              <h3 className="text-white font-bold text-lg">Emitir Reporte de Estado</h3>
              <p className="text-blue-200 text-xs mt-1">Este documento irá con el logo de tu despacho.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">¿Quieres agregar una novedad del día? (Opcional)</label>
                <textarea 
                  value={novedadDia}
                  onChange={(e) => setNovedadDia(e.target.value)}
                  placeholder="Ej: El día de hoy radicamos el memorial solicitando el embargo... (Esto aparecerá resaltado al principio del PDF)"
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="4"
                ></textarea>
                <p className="text-[11px] text-slate-400 mt-1">Si lo dejas en blanco, solo se imprimirá el historial de la bitácora.</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setModalAbierto(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button 
                  onClick={generarPDF}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  Descargar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}