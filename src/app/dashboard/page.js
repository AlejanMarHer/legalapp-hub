import React from 'react';
import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Dashboard() {
  const user = await currentUser();
  
  if (!user) redirect('/');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Barra Lateral */}
      <aside className="w-64 bg-[#1E3A8A] text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-blue-800">
          <h2 className="text-2xl font-bold">LitisApp</h2>
          <p className="text-blue-300 text-sm mt-1">Despacho Virtual</p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li className="bg-blue-800 rounded-md p-3 font-medium">Mis Herramientas</li>
            <li className="p-3 text-blue-200 hover:text-white cursor-not-allowed opacity-50">Mis Casos (Próximamente)</li>
          </ul>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b">
          <h1 className="text-xl font-semibold text-gray-800">
            Bienvenido, {user.firstName || 'Colega'}
          </h1>
          <UserButton />
        </header>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Herramientas Activas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* App 1: Indexación */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#1E3A8A] mb-2">Liquidador de Indexación</h3>
                <p className="text-gray-600 mb-4 text-sm">Actualiza valores de capital aplicando la fórmula jurisprudencial y el IPC del DANE.</p>
              </div>
              <Link href="/dashboard/indexacion" className="block w-full bg-[#1E3A8A] text-white text-center py-2 rounded-lg hover:bg-blue-800 font-medium mt-auto">
                Abrir Herramienta
              </Link>
            </div>

            {/* App 2: Laboral */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#1E3A8A] mb-2">Liquidador Laboral</h3>
                <p className="text-gray-600 mb-4 text-sm">Proyecta prestaciones sociales e indemnizaciones por despido al instante.</p>
              </div>
              <Link href="/dashboard/laboral" className="block w-full border-2 border-[#1E3A8A] text-[#1E3A8A] text-center py-2 rounded-lg hover:bg-blue-50 font-medium mt-auto">
                Abrir Herramienta
              </Link>
            </div>

            {/* App 3: Intereses (LA NUEVA MICROAPP) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#1E3A8A] mb-2">Liquidador de Intereses</h3>
                <p className="text-gray-600 mb-4 text-sm">Calcula intereses corrientes y moratorios (Ley Emiliani) con conexión en vivo a la SFC.</p>
              </div>
              <Link href="/dashboard/intereses" className="block w-full bg-[#1E3A8A] text-white text-center py-2 rounded-lg hover:bg-blue-800 font-medium mt-auto">
                Abrir Herramienta
              </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}