"use server"

import OpenAI from 'openai';
import { currentUser } from '@clerk/nextjs/server';

// Inicializamos OpenAI con tu llave secreta
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function consultarAsistenteLegal(historialMensajes) {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  try {
    // ESTE ES EL ALMA DE TU IA: Aquí le damos su personalidad y reglas
    const mensajeSistema = {
      role: "system",
      content: `Eres 'Litis', la Inteligencia Artificial oficial de LitisApp. Eres un abogado experto en litigio en Colombia. 
      Conoces a la perfección el Código General del Proceso (CGP), Código Sustantivo del Trabajo, CPACA y Código Civil.
      Tu objetivo es ayudar al usuario a redactar argumentos, estructurar demandas, resolver dudas procesales y proponer estrategias legales.
      Responde siempre de manera formal, estructurada, clara y al grano. Usa viñetas para facilitar la lectura. Nunca inventes jurisprudencia; si no estás seguro de una ley, indícalo.`
    };

    // Preparamos el historial (Sistema + lo que has hablado)
    const mensajesParaOpenAI = [mensajeSistema, ...historialMensajes];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // El modelo más rápido, inteligente y económico actualmente
      messages: mensajesParaOpenAI,
      temperature: 0.5, // 0.5 lo hace preciso y técnico (menos creativo/inventivo)
    });

    return { 
      exito: true, 
      respuesta: response.choices[0].message.content 
    };

  } catch (error) {
    console.error("Error en OpenAI:", error);
    
    // Manejo de errores comunes (ej. falta de saldo)
    if (error.status === 429) {
      return { exito: false, mensaje: "Has alcanzado el límite de uso de tu cuenta de OpenAI. Verifica si tienes saldo (créditos) en platform.openai.com." };
    }
    
    return { exito: false, mensaje: "Error de conexión con el cerebro de LitisApp. Intenta nuevamente." };
  }
}