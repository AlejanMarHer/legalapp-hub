import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { head } from '@vercel/blob';

export async function GET(request) {
  // 1. Verificamos que seas tú quien está pidiendo el archivo
  const user = await currentUser();
  if (!user) return new NextResponse("No autorizado", { status: 401 });

  const url = request.nextUrl.searchParams.get('url');
  if (!url) return new NextResponse("Falta la URL del documento", { status: 400 });

  try {
    // 2. Le pedimos a Vercel Blob un "Pase Temporal" para acceder al archivo privado
    const blobDetails = await head(url);

    // 3. Redirigimos tu navegador DIRECTAMENTE al CDN de Vercel usando el pase temporal.
    // Esto es instantáneo, ahorra memoria y esquiva cualquier límite de peso del servidor.
    return NextResponse.redirect(blobDetails.downloadUrl);
    
  } catch (error) {
    console.error("Error en el puente PDF:", error);
    return new NextResponse(`Error interno: ${error.message}`, { status: 500 });
  }
}