"use server"

import { GoogleGenerativeAI } from '@google/generative-ai';
import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { get } from '@vercel/blob';

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

    let pdfParts = [];

    if (casoId) {
      const documentos = await prisma.documento.findMany({
        where: { casoId: casoId, caso: { userId: user.id } }
      });

      if (documentos.length > 0) {
        for (const doc of documentos) {
          try {
            const result = await get(doc.urlArchivo, { access: 'private' });
            
            const responseStream = new Response(result.stream);
            const arrayBuffer = await responseStream.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
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

    // CAMBIO ESTRATÉGICO: gemini-1.5-pro es el modelo élite para lectura de documentos largos
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-pro",
      systemInstruction: `Eres 'Litis', la Inteligencia Artificial oficial de LitisApp. Eres un abogado experto en litigio en Colombia. Conoces a la perfección el Código General del Proceso (CGP), Código Sustantivo del Trabajo, CPACA y Código Civil. Tu objetivo es ayudar al usuario a redactar argumentos, estructurar demandas y proponer estrategias. Responde siempre formal, estructurado y al grano. Usa viñetas. Si el usuario te envía documentos PDF adjuntos, analízalos meticulosamente para basar tus respuestas directamente en esa evidencia probatoria.`
    });

    // Construimos el historial de forma manual y robusta para evitar errores de la API
    const contents = [];
    const mensajesAnteriores = historialMensajes.slice(0, -1);
    
    for (const msg of mensajesAnteriores) {
        contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        });
    }

    // Inyectamos los PDFs secretamente en la última pregunta del usuario
    const ultimoMensajeTexto = historialMensajes[historialMensajes.length - 1].content;
    const partesUltimoMensaje = [{ text: ultimoMensajeTexto }, ...pdfParts];
    
    contents.push({
        role: 'user',
        parts: partesUltimoMensaje
    });

    // Usamos generateContent en lugar de startChat para procesar archivos binarios pesados
    const result = await model.generateContent({ contents });
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