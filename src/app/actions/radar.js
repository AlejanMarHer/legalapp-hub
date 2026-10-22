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
  
  // Limpiar el radicado de espacios o guiones
  const radicadoLimpio = caso.radicado ? caso.radicado.replace(/[^0-9]/g, '') : '';
  
  if (radicadoLimpio.length !== 21) {
    return { exito: false, mensaje: "El radicado debe tener 21 dígitos numéricos exactos." };
  }

  try {
    // FASE 1: Buscar el ID interno del Proceso en la Rama Judicial
    const urlBusqueda = `https://consultaprocesos.ramajudicial.gov.co/api/v2/Procesos/Consulta/NumeroRadicacion?numero=${radicadoLimpio}&SoloActivos=false&despacho=null`;
    
    const resBusqueda = await fetch(urlBusqueda, { 
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      cache: 'no-store'
    });

    if (!resBusqueda.ok) throw new Error("La Rama Judicial rechazó la conexión (Puede estar caída).");
    
    const dataBusqueda = await resBusqueda.json();
    if (!dataBusqueda.procesos || dataBusqueda.procesos.length === 0) {
      return { exito: false, mensaje: "El radicado no existe en el sistema de la Rama Judicial." };
    }

    // Tomamos el registro más reciente (a veces un caso pasa por varios juzgados)
    const procesoPrincipal = dataBusqueda.procesos[0];
    const idProceso = procesoPrincipal.idProceso;

    // FASE 2: Buscar las actuaciones de ese Proceso
    const urlActuaciones = `https://consultaprocesos.ramajudicial.gov.co/api/v2/Proceso/Actuaciones/${idProceso}`;
    const resActuaciones = await fetch(urlActuaciones, { 
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store'
    });

    const dataActuaciones = await resActuaciones.json();
    if (!dataActuaciones.actuaciones || dataActuaciones.actuaciones.length === 0) {
      return { exito: false, mensaje: "El proceso existe pero no tiene actuaciones registradas." };
    }

    // FASE 3: Analizar y Guardar
    const ultimaActuacion = dataActuaciones.actuaciones[0]; // La primera es la más reciente
    const nombreActuacion = ultimaActuacion.actuacion || ultimaActuacion.anotacion || "Actuación registrada";
    const fechaActuacion = new Date(ultimaActuacion.fechaActuacion);

    // ¿Es una actuación nueva que no teníamos guardada?
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
    console.error("Error en Radar:", error);
    return { exito: false, mensaje: "Fallo de conexión con la Rama Judicial." };
  }
}

// 2. Limpiar Alerta (Cuando el abogado ya leyó la notificación)
export async function limpiarAlertaRadar(casoId) {
  await prisma.caso.update({
    where: { id: casoId },
    data: { radarAlerta: false }
  });
  return true;
}