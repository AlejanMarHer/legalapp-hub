import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect('/');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Panel Principal</h1>
        <p className="text-gray-500 mt-2 font-medium">Bienvenido a tu Despacho Virtual, {user.firstName || 'Abogado'}.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Tu ecosistema jurídico en un solo lugar</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Utiliza el menú lateral para gestionar tus expedientes activos o acceder a las herramientas de cálculo rápido.
        </p>
      </div>
    </div>
  );
}