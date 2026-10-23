"use server"

import { GoogleGenerativeAI } from '@google/generative-ai';
import { currentUser } from '@clerk/nextjs/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function consultarAsistenteLegal(historialMensajes) {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  try {
    // Apuntamos exactamente a la versión que nos exige la API
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.8-flash",
      systemInstruction: `Eres 'Litis', la Inteligencia Artificial oficial de LitisApp. Eres un abogado experto en litigio en Colombia. Conoces a la perfección el Código General del Proceso (CGP), Código Sustantivo del Trabajo, CPACA y Código Civil. Tu objetivo es ayudar al usuario a redactar argumentos, estructurar demandas, resolver dudas procesales y proponer estrategias legales. Responde siempre de manera formal, estructurada, clara y al grano. Usa viñetas para facilitar la lectura. Nunca inventes jurisprudencia; si no estás seguro de una ley, indícalo.`
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
    return { exito: false, mensaje: `Fallo de Google Gemini: ${error.message}` };
  }
}