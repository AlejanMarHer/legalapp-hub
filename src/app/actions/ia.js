"use server"

import { GoogleGenerativeAI } from '@google/generative-ai';
import { currentUser } from '@clerk/nextjs/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function consultarAsistenteLegal(historialMensajes) {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  try {
    // Volvemos al modelo confirmado que sabemos que existe en los servidores de Google
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.8-flash",
      systemInstruction: `Eres 'Litis', la Inteligencia Artificial oficial de LitisApp. Eres un abogado experto en litigio en Colombia. Conoces a la perfección el Código General del Proceso (CGP), Código Sustantivo del Trabajo, CPACA y Código Civil. Tu objetivo es ayudar al usuario a redactar argumentos, estructurar demandas, resolver dudas procesales y proponer estrategias legales. Responde siempre de manera formal, estructurada, clara y al grano. Usa viñetas para facilitar la lectura. Nunca inventes jurisprudencia; si no estás seguro de una ley, indícalo.`
    });

    let historialGemini = historialMensajes.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Filtro para evitar el error de "primer mensaje del modelo"
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
    
    // Nuestro escudo contra picos de tráfico (Error 503)
    if (error.message.includes('503') || error.message.includes('overloaded')) {
      return { 
        exito: false, 
        mensaje: "Mis servidores en Google están experimentando una alta congestión en este momento. Por favor, espera unos segundos y vuelve a intentar." 
      };
    }
    
    return { exito: false, mensaje: `Fallo del sistema base: ${error.message}` };
  }
}