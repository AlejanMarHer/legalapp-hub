'use client';

import { Calculator, FileText, FileSpreadsheet, Scale, ShieldCheck, Briefcase } from 'lucide-react';

const features = [
  {
    icon: Calculator,
    title: 'Liquidador de intereses',
    description:
      'Calcula intereses moratorios y corrientes con las tasas certificadas por la Superintendencia Financiera, mes a mes.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Abonos masivos desde Excel',
    description:
      'Pega cientos de abonos directamente desde tu hoja de cálculo y obtén la imputación correcta en segundos.',
  },
  {
    icon: FileText,
    title: 'Reportes en PDF',
    description:
      'Genera liquidaciones listas para radicar, con tablas detalladas y un formato profesional para el despacho judicial.',
  },
  {
    icon: Scale,
    title: 'Precisión jurídica',
    description:
      'Elimina el margen de error humano con cálculos auditables, alineados con la normativa colombiana vigente.',
  },
  {
    icon: Briefcase,
    title: 'Despacho virtual',
    description:
      'Todas tus herramientas de litigio centralizadas en un solo lugar, accesibles desde cualquier dispositivo.',
  },
  {
    icon: ShieldCheck,
    title: 'Seguridad y confidencialidad',
    description:
      'Autenticación robusta y acceso protegido para que la información de tus clientes permanezca reservada.',
  },
];

function handlePointerMove(event) {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  card.style.setProperty('--x', `${event.clientX - rect.left}px`);
  card.style.setProperty('--y', `${event.clientY - rect.top}px`);
}

export default function FeaturesSection() {
  return (
    <section id="caracteristicas" aria-labelledby="features-title" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">Características</p>
        <h2 id="features-title" className="mt-3 text-balance text-3xl font-bold tracking-tight text-white md:text-4xl">
          Todo lo que tu práctica litigiosa necesita
        </h2>
        <p className="mt-4 text-pretty leading-relaxed text-slate-400">
          Herramientas diseñadas por y para abogados, enfocadas en la exactitud y en ahorrarte horas de trabajo
          operativo.
        </p>
      </div>

      <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <li
            key={title}
            onPointerMove={handlePointerMove}
            className="group relative overflow-hidden rounded-2xl bg-blue-900/40 p-px backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(37,99,235,0.3)]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  'radial-gradient(400px circle at var(--x, 50%) var(--y, 50%), rgba(96, 165, 250, 0.95), transparent 40%)',
              }}
            />
            <div className="relative h-full rounded-[15px] bg-[#0a1428] p-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[15px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(300px circle at var(--x, 50%) var(--y, 50%), rgba(59, 130, 246, 0.22), transparent 65%)',
                }}
              />
              <div className="relative">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-800/70 bg-blue-950/80 text-blue-400 transition-all duration-300 group-hover:border-blue-500 group-hover:text-blue-300 group-hover:shadow-[0_0_24px_rgba(59,130,246,0.5)]">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
