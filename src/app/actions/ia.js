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

    // =====================================================================
    // 1. AUTO-DESCUBRIMIENTO DE MODELO (Solución definitiva al error 404)
    // =====================================================================
    const urlModelos = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    const fetchModelos = await fetch(urlModelos);
    const dataModelos = await fetchModelos.json();
    
    if (!dataModelos.models) {
      throw new Error("La API Key es inválida o no tiene modelos asignados en Google.");
    }

    // Filtramos para obtener solo los que pueden generar contenido
    const modelosSoportados = dataModelos.models.filter(m => 
      m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")
    );

    // Prioridad: Seleccionamos el mejor modelo "Pro" disponible. Si no hay, bajamos al "Flash".
    let modeloIdeal = modelosSoportados.find(m => m.name.includes("pro"));
    if (!modeloIdeal) modeloIdeal = modelosSoportados.find(m => m.name.includes("flash"));
    if (!modeloIdeal) modeloIdeal = modelosSoportados[0]; // El primero que funcione como última opción

    // Limpiamos el prefijo "models/" que devuelve Google
    const aliasFinal = modeloIdeal.name.replace("models/", "");
    console.log("✅ Litis IA ha auto-seleccionado el modelo autorizado:", aliasFinal);

    const model = genAI.getGenerativeModel({ 
      model: aliasFinal,
      systemInstruction: `Eres 'Litis', la Inteligencia Artificial oficial de LitisApp. Eres un abogado experto en litigio en Colombia. Conoces a la perfección el Código General del Proceso (CGP), Código Sustantivo del Trabajo, CPACA y Código Civil. Tu objetivo es ayudar al usuario a redactar argumentos, estructurar demandas y proponer estrategias. Responde siempre formal, estructurado y al grano. Usa viñetas. Si el usuario te envía documentos PDF adjuntos, analízalos meticulosamente para basar tus respuestas directamente en esa evidencia probatoria.`
    });
    // =====================================================================

    // 2. PROCESAMIENTO DE LOS PDFs
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

    // 3. ESTRUCTURACIÓN DEL CHAT
    const contents = [];
    const mensajesAnteriores = historialMensajes.slice(0, -1);
    
    for (const msg of mensajesAnteriores) {
        contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        });
    }

    const ultimoMensajeTexto = historialMensajes[historialMensajes.length - 1].content;
    const partesUltimoMensaje = [{ text: ultimoMensajeTexto }, ...pdfParts];
    
    contents.push({
        role: 'user',
        parts: partesUltimoMensaje
    });

    // 4. EJECUCIÓN
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