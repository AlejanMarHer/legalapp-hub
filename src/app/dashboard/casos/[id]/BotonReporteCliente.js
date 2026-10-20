"use client";

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function BotonReporteCliente({ caso, nombreAbogado }) {
  const [generando, setGenerando] = useState(false);

  // Lógica para saber a quién nos dirigimos en el reporte
  const esDemandado = caso.calidadProcesal?.includes('Demandada');
  const nombreCliente = esDemandado ? caso.demandado : caso.demandante;
  const nombreContraparte = esDemandado ? caso.demandante : caso.demandado;

  const generarPDF = () => {
    setGenerando(true);
    const doc = new jsPDF();

    // 1. COLORES Y ESTILOS BASE
    const primaryColor = [30, 58, 138]; // Azul LitisApp (#1E3A8A)
    
    // 2. ENCABEZADO INSTITUCIONAL
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F'); // Franja superior
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("REPORTE DE ESTADO DE PROCESO", 105, 22, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Despacho Jurídico: ${nombreAbogado} - T.P. 310641`, 105, 32, { align: "center" });

    // 3. SALUDO Y DATOS DEL PROCESO
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`Estimado(a) cliente ${nombreCliente.toUpperCase()},`, 14, 55);
    doc.text("A continuación, presentamos el informe de estado actual de su proceso judicial gestionado por nuestro despacho.", 14, 62, { maxWidth: 180 });

    doc.autoTable({
      startY: 70,
      theme: 'grid',
      headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
      body: [
        ['Radicado Judicial:', caso.radicado || 'En trámite de asignación'],
        ['Despacho:', caso.juzgado || 'Pendiente'],
        ['Nuestra Calidad:', caso.calidadProcesal || 'Apoderado'],
        ['Contraparte:', nombreContraparte],
        ['Estado del Caso:', caso.estadoInterno || 'Activo']
      ]
    });

    // 4. RESUMEN DE GESTIONES (Hechos y Estrategia visible)
    let finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("RESUMEN DE GESTIONES REALIZADAS", 14, finalY);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    // Usamos el resumen de hechos, o un mensaje genérico si está vacío.
    const textoResumen = caso.resumenHechos || "El proceso avanza conforme a los tiempos del despacho judicial. Se están adelantando las gestiones pertinentes para la defensa de sus intereses.";
    const splitResumen = doc.splitTextToSize(textoResumen, 180);
    doc.text(splitResumen, 14, finalY + 8);

    // 5. AGENDA Y PRÓXIMOS PASOS (Hitos)
    finalY = finalY + 10 + (splitResumen.length * 5) + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("AGENDA Y PRÓXIMOS PASOS", 14, finalY);

    const formatFecha = (f) => f ? new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No registrada';

    doc.autoTable({
      startY: finalY + 5,
      theme: 'striped',
      headStyles: { fillColor: primaryColor, textColor: 255 },
      head: [['Hito Procesal', 'Fecha Programada', 'Observación']],
      body: [
        ['Presentación Demanda', formatFecha(caso.fechaPresentacion), ''],
        ['Auto Admisorio', formatFecha(caso.fechaAdmision), ''],
        ['Próxima Actuación', formatFecha(caso.fechaVencimiento), caso.descVencimiento || 'Monitoreo constante en juzgado']
      ]
    });

    // 6. PIE DE PÁGINA
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Documento generado confidencialmente por LitisApp el ${new Date().toLocaleDateString('es-CO')}.`, 105, pageHeight - 15, { align: "center" });

    // 7. DESCARGA
    doc.save(`Reporte_${nombreCliente.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    setGenerando(false);
  };

  return (
    <button 
      onClick={generarPDF}
      disabled={generando}
      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-5 rounded-xl shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm w-full md:w-auto"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
      {generando ? 'Creando PDF...' : 'Reporte a Cliente'}
    </button>
  );
}