"use client";

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- CORRECCIÓN CLAVE: Importación directa

export default function BotonReporteCliente({ caso, nombreAbogado }) {
  const [generando, setGenerando] = useState(false);

  const getSafeText = (value, defaultText = '') => {
    if (value === null || value === undefined) return defaultText;
    return String(value);
  };

  const calidad = getSafeText(caso?.calidadProcesal);
  const esDemandado = calidad.includes('Demandada');
  
  const nombreCliente = esDemandado ? getSafeText(caso?.demandado, 'Cliente') : getSafeText(caso?.demandante, 'Cliente');
  const nombreContraparte = esDemandado ? getSafeText(caso?.demandante, 'Contraparte') : getSafeText(caso?.demandado, 'Contraparte');

  const generarPDF = () => {
    try {
      setGenerando(true);
      const doc = new jsPDF();

      const primaryColor = [30, 58, 138]; // Azul LitisApp
      
      // ENCABEZADO
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("REPORTE DE ESTADO DE PROCESO", 105, 22, { align: "center" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Despacho Jurídico: ${getSafeText(nombreAbogado, 'Abogado')} - T.P. 310641`, 105, 32, { align: "center" });

      // SALUDO
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.text(`Estimado(a) cliente ${nombreCliente.toUpperCase()},`, 14, 55);
      doc.text("A continuación, presentamos el informe de estado actual de su proceso judicial gestionado por nuestro despacho.", 14, 62, { maxWidth: 180 });

      // TABLA 1 - CORRECCIÓN CLAVE: Usamos autoTable(doc, {...}) en lugar de doc.autoTable
      autoTable(doc, {
        startY: 70,
        theme: 'grid',
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
        body: [
          ['Radicado Judicial:', getSafeText(caso?.radicado, 'En trámite de asignación')],
          ['Despacho:', getSafeText(caso?.juzgado, 'Pendiente')],
          ['Nuestra Calidad:', getSafeText(caso?.calidadProcesal, 'Apoderado')],
          ['Contraparte:', nombreContraparte],
          ['Estado del Caso:', getSafeText(caso?.estadoInterno, 'Activo')]
        ]
      });

      let currentY = 135; 

      // RESUMEN
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      doc.text("RESUMEN DE GESTIONES REALIZADAS", 14, currentY);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      
      const textoResumen = (caso && caso.resumenHechos && caso.resumenHechos.trim() !== '') 
        ? String(caso.resumenHechos) 
        : "El proceso avanza conforme a los tiempos del despacho judicial. Se están adelantando las gestiones pertinentes para la defensa de sus intereses.";
      
      const splitResumen = doc.splitTextToSize(textoResumen, 180);
      doc.text(splitResumen, 14, currentY + 8);

      // AGENDA
      currentY = currentY + 10 + (splitResumen.length * 5) + 10;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      doc.text("AGENDA Y PRÓXIMOS PASOS", 14, currentY);

      // Escudo anti-errores para fechas
      const formatFecha = (f) => {
        if (!f) return 'No registrada';
        try {
          const d = new Date(f);
          if (isNaN(d.getTime())) return 'Fecha inválida';
          return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch(e) {
          return 'No registrada';
        }
      };

      // TABLA 2 - CORRECCIÓN CLAVE
      autoTable(doc, {
        startY: currentY + 5,
        theme: 'striped',
        headStyles: { fillColor: primaryColor, textColor: 255 },
        head: [['Hito Procesal', 'Fecha Programada', 'Observación']],
        body: [
          ['Presentación Demanda', formatFecha(caso?.fechaPresentacion), ''],
          ['Auto Admisorio', formatFecha(caso?.fechaAdmision), ''],
          ['Próxima Actuación', formatFecha(caso?.fechaVencimiento), getSafeText(caso?.descVencimiento, 'Monitoreo constante en juzgado')]
        ]
      });

      // PIE DE PÁGINA
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Documento generado confidencialmente por LitisApp el ${new Date().toLocaleDateString('es-CO')}.`, 105, pageHeight - 15, { align: "center" });

      // DESCARGA
      const safeName = nombreCliente.replace(/[^a-zA-Z0-9]/g, '_');
      doc.save(`Reporte_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error("Error generando PDF:", error);
      // Ahora la alerta nos dirá exactamente qué código falló
      alert("Error técnico: " + error.message);
    } finally {
      setGenerando(false);
    }
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