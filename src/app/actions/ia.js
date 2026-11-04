"use server"

import { GoogleGenerativeAI } from '@google/generative-ai';
import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { get } from '@vercel/blob';

// ¡Adiós a pdf-parse! Ya no lo necesitamos porque Gemini lee PDFs nativamente.

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export async function obtenerExpedientesParaIA() {
  try {
    const user = await currentUser();
    if (!user) return [];

    const casos = await prisma.caso.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' }
    });

    const casosConDocs = await Promise.all(casos.map(async (c) => {
      const docsCount = await prisma.documento.count({
        where: { casoId: c.id }
      });
      return {
        id: c.id,
        nombre: c.radicado ? `${c.radicado} - ${c.demandante} VS ${c.demandado}` : `${c.demandante} VS ${c.demandado}`,
        tieneDocs: docsCount > 0
      };
    }));

    return casosConDocs;
  } catch (error) {
    console.error("Error obteniendo expedientes:", error);
    return [];
  }
}

export async function consultarAsistenteLegal(historialMensajes, casoId = null) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("No autenticado");

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Falta configurar la GEMINI_API_KEY en las variables de Vercel.");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Contenedor para inyectar los PDFs nativamente
    let pdfParts = [];

    if (casoId) {
      const documentos = await prisma.documento.findMany({
        where: { casoId: casoId, caso: { userId: user.id } }
      });

      if (documentos.length > 0) {
        for (const doc of documentos) {
          try {
            // Descargamos el archivo privado usando el método oficial
            const result = await get(doc.urlArchivo, { access: 'private' });
            
            const responseStream = new Response(result.stream);
            const arrayBuffer = await responseStream.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            // LA MAGIA: Empacamos el PDF completo en Base64 para que Gemini lo procese visualmente
            pdfParts.push({
              inlineData: {
                data: buffer.toString("base64"),
                mimeType: "application/pdf"
              }
            });
          } catch (e) {
            console.error("Error descargando PDF para IA:", doc.nombre, e);
          }
        }
      }
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `Eres 'Litis', la Inteligencia Artificial oficial de LitisApp. Eres un abogado experto en litigio en Colombia. Conoces a la perfección el Código General del Proceso (CGP), Código Sustantivo del Trabajo, CPACA y Código Civil. Tu objetivo es ayudar al usuario a redactar argumentos, estructurar demandas y proponer estrategias. Responde siempre formal, estructurado y al grano. Usa viñetas. Si el usuario te envía documentos PDF adjuntos, analízalos meticulosamente para basar tus respuestas directamente en esa evidencia probatoria.`
    });

    let historialGemini = historialMensajes.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    if (historialGemini.length > 0 && historialGemini[0].role === 'model') {
      historialGemini.shift(); 
    }

    const ultimoMensajeTexto = historialMensajes[historialMensajes.length - 1].content;

    // Unimos la pregunta del usuario con los PDFs extraídos
    const partesMensajeFinal = [
      { text: ultimoMensajeTexto },
      ...pdfParts
    ];

    const chat = model.startChat({
      history: historialGemini,
      generationConfig: { temperature: 0.4 },
    });

    // Enviamos el paquete completo
    const result = await chat.sendMessage(partesMensajeFinal);
    const response = await result.response;
    
    return { exito: true, respuesta: response.text() };

  } catch (error) {
    console.error("Error exacto en Gemini:", error);
    
    if (error.message.includes('503') || error.message.includes('overloaded')) {
      return { exito: false, mensaje: "Mis servidores están experimentando una alta congestión. Por favor, espera unos segundos y vuelve a intentar." };
    }
    
    return { exito: false, mensaje: `Fallo del sistema base: ${error.message}` };
  }
}