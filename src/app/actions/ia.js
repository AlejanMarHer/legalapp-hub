"use server"

import { GoogleGenerativeAI } from '@google/generative-ai';
import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { get } from '@vercel/blob';

const pdf = require('pdf-parse');

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function obtenerExpedientesParaIA() {
  const user = await currentUser();
  if (!user) return [];
  
  const casos = await prisma.caso.findMany({
    where: { userId: user.id },
    select: { id: true, radicado: true, demandante: true, demandado: true, documentos: true },
    orderBy: { updatedAt: 'desc' }
  });
  
  return casos.map(c => ({
    id: c.id,
    nombre: c.radicado ? `${c.radicado} - ${c.demandante} VS ${c.demandado}` : `${c.demandante} VS ${c.demandado}`,
    tieneDocs: c.documentos.length > 0
  }));
}

export async function consultarAsistenteLegal(historialMensajes, casoId = null) {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  let contextoExpediente = "";

  try {
    if (casoId) {
      const documentos = await prisma.documento.findMany({
        where: { casoId: casoId, caso: { userId: user.id } }
      });

      if (documentos.length > 0) {
        contextoExpediente = "\n\n--- INICIO DEL MATERIAL PROBATORIO DEL EXPEDIENTE ---\n";
        
        for (const doc of documentos) {
          try {
            // Usamos el método oficial 'get' para descargar de forma privada
            const result = await get(doc.urlArchivo, { access: 'private' });
            
            // Convertimos el stream seguro a un formato legible para pdf-parse
            const responseStream = new Response(result.stream);
            const arrayBuffer = await responseStream.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            const pdfData = await pdf(buffer);
            contextoExpediente += `\nDocumento: ${doc.nombre}\nContenido Extraído:\n${pdfData.text}\n`;
          } catch (e) {
            console.error("Error leyendo PDF con SDK:", doc.nombre, e);
          }
        }
        contextoExpediente += "\n--- FIN DEL MATERIAL PROBATORIO ---\nSi el usuario te pregunta sobre su caso, usa EXCLUSIVAMENTE esta información extraída de los PDFs para responderle con precisión técnica.";
      }
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `Eres 'Litis', la Inteligencia Artificial oficial de LitisApp. Eres un abogado experto en litigio en Colombia. Conoces a la perfección el Código General del Proceso (CGP), Código Sustantivo del Trabajo, CPACA y Código Civil. Tu objetivo es ayudar al usuario a redactar argumentos, estructurar demandas y proponer estrategias. Responde siempre formal, estructurado y al grano. Usa viñetas. ${contextoExpediente}`
    });

    let historialGemini = historialMensajes.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    if (historialGemini.length > 0 && historialGemini[0].role === 'model') {
      historialGemini.shift(); 
    }

    const ultimoMensaje = historialMensajes[historialMensajes.length - 1].content;

    const chat = model.startChat({
      history: historialGemini,
      generationConfig: { temperature: 0.4 },
    });

    const result = await chat.sendMessage(ultimoMensaje);
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