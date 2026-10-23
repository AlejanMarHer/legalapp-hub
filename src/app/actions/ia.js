"use server"

import { GoogleGenerativeAI } from '@google/generative-ai';
import { currentUser } from '@clerk/nextjs/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function consultarAsistenteLegal(historialMensajes) {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `Eres 'Litis', la Inteligencia Artificial oficial de LitisApp. Eres un abogado experto en litigio en Colombia. Conoces a la perfección el Código General del Proceso (CGP), Código Sustantivo del Trabajo, CPACA y Código Civil. Tu objetivo es ayudar al usuario a redactar argumentos, estructurar demandas, resolver dudas procesales y proponer estrategias legales. Responde siempre de manera formal, estructurada, clara y al grano. Usa viñetas para facilitar la lectura. Nunca inventes jurisprudencia; si no estás seguro de una ley, indícalo.`
    });

    // 1. Convertimos el formato de LitisApp al formato que entiende Gemini
    let historialGemini = historialMensajes.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // 2. FILTRO VITAL: Gemini exige que el historial empiece con un humano.
    // Quitamos el saludo inicial automático de LitisApp para evitar el bloqueo 400 Bad Request.
    if (historialGemini.length > 0 && historialGemini[0].role === 'model') {
      historialGemini.shift(); 
    }

    const ultimoMensaje = historialMensajes[historialMensajes.length - 1].content;

    const chat = model.startChat({
      history: historialGemini,
      generationConfig: {
        temperature: 0.4, 
      },
    });

    const result = await chat.sendMessage(ultimoMensaje);
    const response = await result.response;
    
    return { 
      exito: true, 
      respuesta: response.text()
    };

  } catch (error) {
    console.error("Error exacto en Gemini:", error);
    // Ahora devolvemos el error real de Google a la pantalla para saber exactamente qué pasa
    return { exito: false, mensaje: `Fallo de Google Gemini: ${error.message}` };
  }
}