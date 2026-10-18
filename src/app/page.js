import React from 'react';
import { SignInButton, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function LitisAppHub() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-800">
      <nav className="bg-[#1E3A8A] shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <span className="text-white text-2xl font-bold tracking-tight">LitisApp</span>
          <div>
            {userId ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-white font-medium hover:underline">Ir a mi Despacho</Link>
                <UserButton />
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-white text-[#1E3A8A] hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm">
                  Iniciar Sesión
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1E3A8A] tracking-tight mb-6">
          El primer ecosistema legal inteligente de Colombia
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600 mb-10">
          Centraliza, automatiza y simplifica el litigio. Herramientas de precisión diseñadas para eliminar el margen de error humano en tus procesos jurídicos.
        </p>
        
        {!userId && (
          <SignInButton mode="modal">
            <button className="bg-[#1E3A8A] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-800 shadow-md">
              Ingresar al Despacho Virtual
            </button>
          </SignInButton>
        )}
      </main>
    </div>
  );
}