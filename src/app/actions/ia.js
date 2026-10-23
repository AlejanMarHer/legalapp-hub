"use server"

import { GoogleGenerativeAI } from '@google/generative-ai';
import { currentUser } from '@clerk/nextjs/server';

// Inicializamos Gemini con tu llave secreta
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function consultarAsistenteLegal(historialMensajes) {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  try {
    // Configuramos el modelo Gemini 1.5 Flash (Súper rápido y con gran razonamiento)
    // Y le inyectamos la orden maestra del sistema (System Instruction)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `Eres 'Litis', la Inteligencia Artificial oficial de LitisApp. Eres un abogado experto en litigio en Colombia. Conoces a la perfección el Código General del Proceso (CGP), Código Sustantivo del Trabajo, CPACA y Código Civil. Tu objetivo es ayudar al usuario a redactar argumentos, estructurar demandas, resolver dudas procesales y proponer estrategias legales. Responde siempre de manera formal, estructurada, clara y al grano. Usa viñetas para facilitar la lectura. Nunca inventes jurisprudencia; si no estás seguro de una ley, indícalo.`
    });

    // LitisApp maneja el historial como 'user' y 'assistant'. 
    // Gemini lo requiere como 'user' y 'model'. Hacemos la traducción aquí:
    const historialGemini = historialMensajes.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Extraemos el último mensaje que acabas de enviar
    const ultimoMensaje = historialMensajes[historialMensajes.length - 1].content;

    // Iniciamos el chat pasándole el historial de la conversación
    const chat = model.startChat({
      history: historialGemini,
      generationConfig: {
        temperature: 0.4, // 0.4 lo hace más analítico y menos "creativo/inventivo"
      },
    });

    // Enviamos el mensaje y esperamos la respuesta
    const result = await chat.sendMessage(ultimoMensaje);
    const response = await result.response;
    
    return { 
      exito: true, 
      respuesta: response.text()
    };

  } catch (error) {
    console.error("Error en Gemini:", error);
    return { exito: false, mensaje: "Error de conexión con el cerebro de Gemini. Verifica que tu GEMINI_API_KEY esté correcta." };
  }
}