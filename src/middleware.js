import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Rutas PÚBLICAS: Nadie necesita iniciar sesión para entrar aquí
const isPublicRoute = createRouteMatcher([
  '/estado/(.*)',      // El nuevo Portal de Transparencia para tus clientes
  '/api/webhook(.*)',  // Notificaciones de pagos de Mercado Pago
  '/sign-in(.*)',      // Pantalla de Login
  '/sign-up(.*)',      // Pantalla de Registro
  '/'                  // Tu Landing page principal
]);

// 2. Rutas PRIVADAS: Solo los abogados con cuenta activa pueden entrar
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)'     // Todo el panel de control y herramientas
]);

export default clerkMiddleware(async (auth, req) => {
  // Si el visitante va al Portal de Clientes o es Mercado Pago, lo dejamos pasar libremente
  if (isPublicRoute(req)) {
    return;
  }

  // Si alguien intenta entrar al Dashboard, Clerk exigirá autenticación obligatoria
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Ignora archivos estáticos de Next.js (imágenes, css, etc.)
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Siempre ejecuta el middleware para las rutas de la API
    '/(api|trpc)(.*)',
  ],
};