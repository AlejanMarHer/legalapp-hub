import React from 'react';
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

// Puente de Base de Datos
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function NuevoCasoPage() {
  const user = await currentUser();
  if (!user) redirect('/');

  // ESTA ES LA MAGIA: Función que se ejecuta en el servidor al enviar el formulario
  async function guardarCaso(formData) {
    'use server';
    
    const radicado = formData.get('radicado');
    const demandante = formData.get('demandante');
    const demandado = formData.get('demandado');
    const juzgado = formData.get('juzgado');

    // Insertar en la base de datos Supabase
    await prisma.caso.create({
      data: {
        userId: user.id,
        radicado,
        demandante,
        demandado,
        juzgado,
        estado: 'Activo'
      }
    });

    // Redirigir de vuelta a la tabla de casos
    redirect('/dashboard/casos');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <main className="flex-1 p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard/casos" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Volver a mis expedientes
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Radicar Nuevo Expediente</h1>
          <p className="text-gray-500 mt-2 font-medium">Ingresa los datos procesales para crear un nuevo registro en tu despacho virtual.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form action={guardarCaso} className="space-y-6">
            
            {/* Campo: Radicado */}
            <div>
              <label htmlFor="radicado" className="block text-sm font-bold text-gray-700 mb-2">Número de Radicado (21 dígitos)</label>
              <input type="text" id="radicado" name="radicado" placeholder="Ej. 11001400301720230012300" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm" />
            </div>

            {/* Fila: Demandante y Demandado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="demandante" className="block text-sm font-bold text-gray-700 mb-2">Parte Demandante <span className="text-red-500">*</span></label>
                <input type="text" id="demandante" name="demandante" required placeholder="Nombre completo o razón social" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm" />
              </div>
              <div>
                <label htmlFor="demandado" className="block text-sm font-bold text-gray-700 mb-2">Parte Demandada <span className="text-red-500">*</span></label>
                <input type="text" id="demandado" name="demandado" required placeholder="Nombre completo o razón social" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm" />
              </div>
            </div>

            {/* Campo: Juzgado */}
            <div>
              <label htmlFor="juzgado" className="block text-sm font-bold text-gray-700 mb-2">Despacho Judicial</label>
              <input type="text" id="juzgado" name="juzgado" placeholder="Ej. Juzgado 17 Civil del Circuito de Bogotá" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm" />
            </div>

            {/* Botón Guardar */}
            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button type="submit" className="bg-[#1E3A8A] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 shadow-md transition-all">
                Guardar Expediente
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}