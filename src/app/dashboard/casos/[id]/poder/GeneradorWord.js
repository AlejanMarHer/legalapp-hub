"use client";

import React, { useState } from 'react';

export default function GeneradorWord({ caso, emailAbogado }) {
  const [generando, setGenerando] = useState(false);

  // Lógica de Inteligencia Procesal: Detecta a quién representamos para saber quién es el poderdante
  const esDemandado = caso.calidadProcesal?.includes('Demandada');
  const poderdante = esDemandado ? caso.demandado : caso.demandante;
  const idPoderdante = esDemandado ? caso.idDemandado : caso.idDemandante;

  const exportarWord = () => {
    setGenerando(true);
    
    // Encabezados necesarios para que Microsoft Word lea el HTML correctamente
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Poder Especial</title></head><body>`;
    const footer = "</body></html>";

    // Plantilla del Poder Especial estructurada con variables de Prisma
    const htmlContent = `
      <div style="font-family: 'Times New Roman', serif; font-size: 12pt; text-align: justify; line-height: 1.5;">
        <p style="text-align: left;">${caso.ciudad || 'Bogotá D.C.'}, ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <br/>
        <p>Señor(a)<br/>
        <strong>${caso.juzgado ? caso.juzgado.toUpperCase() : 'JUEZ __________________'}</strong><br/>
        E. S. D.</p>
        <br/>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="width: 120px; vertical-align: top;"><strong>Referencia:</strong></td><td>${caso.claseProceso || 'Proceso ________________'}</td></tr>
          <tr><td style="vertical-align: top;"><strong>Demandante:</strong></td><td>${caso.demandante}</td></tr>
          <tr><td style="vertical-align: top;"><strong>Demandado:</strong></td><td>${caso.demandado}</td></tr>
          <tr><td style="vertical-align: top;"><strong>Radicado:</strong></td><td>${caso.radicado || '________________'}</td></tr>
        </table>
        <br/>
        <p>Yo, <strong>${poderdante.toUpperCase()}</strong>, mayor de edad, identificado(a) con cédula de ciudadanía número <strong>${idPoderdante || '________________'}</strong>, actuando en nombre propio, confiero poder especial, amplio y suficiente al abogado <strong>ALEJANDRO MARTINEZ HERRERA</strong>, identificado con cédula de ciudadanía número ____________ y portador de la Tarjeta Profesional número <strong>310641</strong> del Consejo Superior de la Judicatura, con correo electrónico <strong>${emailAbogado}</strong>, para que me represente judicialmente dentro del proceso de la referencia.</p>
        <p>Mi apoderado queda facultado para adelantar las actuaciones procesales necesarias para la adecuada defensa de mis intereses, de acuerdo con la posición procesal que me corresponda, incluyendo presentar y contestar demandas, formular excepciones, solicitar y controvertir pruebas, presentar memoriales y alegatos, asistir a audiencias y diligencias, interponer y sustentar recursos, solicitar medidas cautelares y, en general, ejercer las facultades ordinarias inherentes a la representación judicial, conforme a la ley.</p>
        <p>Las facultades especiales de conciliar, transigir, desistir, allanarse, recibir y las demás que requieran autorización expresa se entenderán conferidas únicamente cuando se otorguen de manera expresa y conforme a los requisitos legales aplicables.</p>
        <p>Solicito al despacho reconocer personería a mi apoderado en los términos del presente poder.</p>
        <br/>
        <p>Atentamente,</p>
        <br/><br/>
        <p>___________________________________<br/>
        <strong>EL PODERDANTE</strong><br/>
        Nombre: ${poderdante.toUpperCase()}<br/>
        Cédula de ciudadanía: ${idPoderdante || '________________'}<br/>
        Correo electrónico: ${caso.emailCliente || '________________'}</p>
        <br/><br/>
        <p><strong>Acepto,</strong></p>
        <br/><br/>
        <p>___________________________________<br/>
        <strong>EL APODERADO</strong><br/>
        Nombre: ALEJANDRO MARTINEZ HERRERA<br/>
        Cédula de ciudadanía: ____________<br/>
        Tarjeta Profesional: 310641 del C.S.J.<br/>
        Correo electrónico: ${emailAbogado}</p>
      </div>
    `;

    // Conversión a archivo y descarga automática
    const sourceHTML = header + htmlContent + footer;
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `Poder_Especial_${caso.radicado || caso.demandante}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
    
    setGenerando(false);
  };

  return (
    <button 
      onClick={exportarWord}
      disabled={generando}
      className="w-full sm:w-auto bg-[#1E3A8A] hover:bg-blue-800 text-white font-extrabold py-4 px-8 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
      {generando ? 'Procesando Documento...' : 'Descargar Poder en Microsoft Word'}
    </button>
  );
}