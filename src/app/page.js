import { auth } from '@clerk/nextjs/server';
import ParticlesBackground from '@/components/landing/particles-background';
import SiteHeader from '@/components/landing/site-header';
import HeroSection from '@/components/landing/hero-section';
import FeaturesSection from '@/components/landing/features-section';

export default async function LitisAppHub() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);

  return (
    <div className="relative isolate min-h-screen bg-[#050b18] text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(ellipse_at_top,_#0f2350_0%,_#050b18_60%)]"
      />
      <ParticlesBackground />
      <SiteHeader isSignedIn={isSignedIn} />
      <main>
        <HeroSection isSignedIn={isSignedIn} />
        <FeaturesSection />
      </main>
      <footer className="border-t border-blue-900/40 py-8 text-center text-sm text-slate-500">
        {`© ${new Date().getFullYear()} LitisApp. Todos los derechos reservados.`}
      </footer>
    </div>
  );
}
