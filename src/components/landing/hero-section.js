import Link from 'next/link';
import { SignInButton } from '@clerk/nextjs';
import { ArrowRight } from 'lucide-react';

export default function HeroSection({ isSignedIn }) {
  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-16 pt-24 text-center md:pt-32">
      <span className="inline-flex items-center gap-2 rounded-full border border-blue-800/70 bg-blue-950/60 px-4 py-1.5 text-xs font-medium text-blue-300 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,1)]" aria-hidden="true" />
        Tecnología legal hecha en Colombia
      </span>

      <h1 className="mt-8 text-balance text-4xl font-extrabold tracking-tight text-white md:text-6xl">
        El primer ecosistema legal{' '}
        <span className="bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">inteligente</span>{' '}
        de Colombia
      </h1>

      <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-300 md:text-xl">
        Centraliza, automatiza y simplifica el litigio. Herramientas de precisión diseñadas para eliminar el margen de
        error humano en tus procesos jurídicos.
      </p>

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        {isSignedIn ? (
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all hover:bg-blue-500"
          >
            Ir a mi Despacho
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        ) : (
          <SignInButton mode="modal">
            <button
              type="button"
              className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all hover:bg-blue-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.7)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
              Ingresar al Despacho Virtual
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>
          </SignInButton>
        )}
        <a
          href="#caracteristicas"
          className="rounded-xl border border-blue-800/70 bg-slate-900/40 px-7 py-3.5 font-semibold text-slate-200 backdrop-blur-sm transition-colors hover:border-blue-500 hover:text-white"
        >
          Ver características
        </a>
      </div>
    </section>
  );
}
