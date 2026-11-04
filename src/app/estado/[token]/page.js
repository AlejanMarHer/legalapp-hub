import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function PortalCliente({ params }) {
  const { token } = params;

  // Buscamos el caso usando el enlace único
  const caso = await prisma.caso.findUnique({
    where: { publicToken: token },
  });

  // Si el link no existe o el abogado apagó el portal (isPublic: false), muestra error 404
  if (!caso || !caso.isPublic) {
    notFound(); 
  }

  // Estilo dinámico para el estado
  const colorEstado = caso.estadoInterno === 'Activo' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-slate-100 text-slate-800';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Cabecera Elegante */}
        <div className="bg-slate-900 px-6 py-8 text-white">
          <h1 className="text-2xl font-bold">Portal de Seguimiento Judicial</h1>
          <p className="text-slate-300 mt-2">Consulta en tiempo real el estado de tu proceso.</p>
        </div>

        {/* Detalles Centrales del Caso */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <p className="text-sm text-slate-500 font-medium">Radicado</p>
              <p className="text-lg font-semibold text-slate-900">{caso.radicado || 'Pendiente de radicación'}</p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${colorEstado}`}>
              {caso.estadoInterno}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-b border-slate-100 py-6 my-6">
            <div>
              <p className="text-sm text-slate-500 font-medium">Juzgado / Despacho</p>
              <p className="font-medium text-slate-800">{caso.juzgado || 'Por asignar'} - {caso.ciudad}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Clase de Proceso</p>
              <p className="font-medium text-slate-800">{caso.claseProceso || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Demandante</p>
              <p className="font-medium text-slate-800">{caso.demandante}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Demandado</p>
              <p className="font-medium text-slate-800">{caso.demandado}</p>
            </div>
          </div>

          {/* Mensaje de Tranquilidad para el Cliente */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md mt-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Información Protegida</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Este enlace es único y seguro. Tu abogado actualizará este portal automáticamente cuando existan novedades importantes en tu caso.</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}