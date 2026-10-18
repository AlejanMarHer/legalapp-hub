import Link from 'next/link';
import { SignInButton, UserButton } from '@clerk/nextjs';
import { Scale } from 'lucide-react';

export default function SiteHeader({ isSignedIn }) {
  return (
    <header className="sticky top-0 z-20 border-b border-blue-900/40 bg-[#050b18]/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-[0_0_16px_rgba(37,99,235,0.6)]">
            <Scale className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold tracking-tight">LitisApp</span>
        </Link>

        <nav aria-label="Principal" className="flex items-center gap-6">
          <a href="#caracteristicas" className="hidden text-sm text-slate-300 transition-colors hover:text-white sm:block">
            Características
          </a>
          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium text-white hover:text-blue-300">
                Ir a mi Despacho
              </Link>
              <UserButton />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button
                type="button"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.45)] transition-all hover:bg-blue-500 hover:shadow-[0_0_28px_rgba(59,130,246,0.7)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                Iniciar Sesión
              </button>
            </SignInButton>
          )}
        </nav>
      </div>
    </header>
  );
}
