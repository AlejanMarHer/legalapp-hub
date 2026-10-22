"use server"

import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// 1. Función Principal para Sincronizar un Expediente
export async function sincronizarRadicado(casoId) {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  const caso = await prisma.caso.findUnique({ where: { id: casoId } });
  if (!caso || caso.userId !== user.id) throw new Error("Expediente no encontrado");
  
  const radicadoLimpio = caso.radicado ? caso.radicado.replace(/[^0-9]/g, '') : '';
  
  if (radicadoLimpio.length !== 23) {
    return { exito: false, mensaje: "El radicado debe tener 23 dígitos numéricos exactos." };
  }

  try {
    // Cabeceras avanzadas para simular un navegador real y evitar bloqueos del firewall (WAF)
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'es-CO,es;q=0.9',
      'Referer': 'https://consultaprocesos.ramajudicial.gov.co/',
      'Origin': 'https://consultaprocesos.ramajudicial.gov.co',
      'Connection': 'keep-alive'
    };

    const urlBusqueda = `https://consultaprocesos.ramajudicial.gov.co/api/v2/Procesos/Consulta/NumeroRadicacion?numero=${radicadoLimpio}&SoloActivos=false&despacho=null`;
    
    const resBusqueda = await fetch(urlBusqueda, { 
      method: 'GET',
      headers: headers,
      cache: 'no-store'
    });

    if (!resBusqueda.ok) {
      return { exito: false, mensaje: `Bloqueo de la Rama Judicial (Código ${resBusqueda.status}).` };
    }
    
    const dataBusqueda = await resBusqueda.json();
    if (!dataBusqueda.procesos || dataBusqueda.procesos.length === 0) {
      return { exito: false, mensaje: "El radicado no existe en el sistema de la Rama Judicial." };
    }

    const procesoPrincipal = dataBusqueda.procesos[0];
    const idProceso = procesoPrincipal.idProceso;

    const urlActuaciones = `https://consultaprocesos.ramajudicial.gov.co/api/v2/Proceso/Actuaciones/${idProceso}`;
    const resActuaciones = await fetch(urlActuaciones, { 
      method: 'GET',
      headers: headers,
      cache: 'no-store'
    });

    if (!resActuaciones.ok) {
      return { exito: false, mensaje: `Error al obtener actuaciones (Código ${resActuaciones.status}).` };
    }

    const dataActuaciones = await resActuaciones.json();
    if (!dataActuaciones.actuaciones || dataActuaciones.actuaciones.length === 0) {
      return { exito: false, mensaje: "El proceso existe pero no tiene actuaciones registradas." };
    }

    const ultimaActuacion = dataActuaciones.actuaciones[0]; 
    const nombreActuacion = ultimaActuacion.actuacion || ultimaActuacion.anotacion || "Actuación registrada";
    const fechaActuacion = new Date(ultimaActuacion.fechaActuacion);

    const esNueva = caso.radarUltimaActuacion !== nombreActuacion;
    const alerta = esNueva ? true : caso.radarAlerta;

    await prisma.caso.update({
      where: { id: casoId },
      data: {
        radarUltimaConsulta: new Date(),
        radarUltimaActuacion: nombreActuacion,
        radarFechaActuacion: fechaActuacion,
        radarAlerta: alerta
      }
    });

    return { 
      exito: true, 
      mensaje: esNueva ? "¡Nueva actuación detectada!" : "Proceso al día, sin cambios.",
      nueva: esNueva
    };

  } catch (error) {
    // Si falla, enviamos el mensaje de error exacto del servidor a la alerta
    return { exito: false, mensaje: "Error técnico: " + error.message };
  }
}

export async function limpiarAlertaRadar(casoId) {
  await prisma.caso.update({
    where: { id: casoId },
    data: { radarAlerta: false }
  });
  return true;
}