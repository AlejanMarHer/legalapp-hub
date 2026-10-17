import React from 'react';

export default function LegalAppHub() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-800">
      
      {/* Barra de Navegación */}
      <nav className="bg-[#1E3A8A] shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-white text-2xl font-bold tracking-tight">LegalApp</span>
            </div>
            <div>
              <button className="bg-white text-[#1E3A8A] hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm">
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sección Hero */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1E3A8A] tracking-tight mb-6">
          Tu ecosistema de cálculo y gestión procesal.
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          Automatiza cálculos complejos, controla tus términos procesales y optimiza la estructuración de tus casos. Un ecosistema completo de herramientas diseñadas para escalar y blindar la práctica jurídica en Colombia sin margen de error.
        </p>
      </main>

      {/* Catálogo de Micro Apps */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Tarjeta 1: Indexación */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="w-12 h-12 bg-blue-100 text-[#1E3A8A] rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Liquidador de Indexación</h3>
            <p className="text-gray-600 mb-8 flex-grow">
              Actualiza valores de capital aplicando la fórmula jurisprudencial exacta y el histórico del IPC del DANE. Copia el resultado directamente a tu memorial o demanda.
            </p>
            <a 
              href="https://microapp-indexacion.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-[#1E3A8A] text-white text-center font-semibold py-3 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Abrir Liquidador
            </a>
          </div>

          {/* Tarjeta 2: Laboral */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="w-12 h-12 bg-blue-100 text-[#1E3A8A] rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Liquidador Laboral</h3>
            <p className="text-gray-600 mb-8 flex-grow">
              Proyecta prestaciones sociales, indemnizaciones por despido y sanciones moratorias al instante. Genera reportes claros para tus clientes o despachos judiciales.
            </p>
            <a 
              href="https://liquidador-laboral-mvp.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full border-2 border-[#1E3A8A] text-[#1E3A8A] text-center font-semibold py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Abrir Liquidador
            </a>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} LegalApp. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}