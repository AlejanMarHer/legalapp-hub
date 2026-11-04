import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { head } from '@vercel/blob'; // Importamos la herramienta de Vercel

export async function GET(request) {
  const user = await currentUser();
  if (!user) return new NextResponse("No autorizado", { status: 401 });

  const url = request.nextUrl.searchParams.get('url');
  if (!url) return new NextResponse("Falta la URL del documento", { status: 400 });

  try {
    // 1. Le pedimos a Vercel que nos dé una URL temporal y autorizada para este PDF
    const blobDetails = await head(url);

    // 2. Hacemos el fetch a esa URL segura (downloadUrl)
    const response = await fetch(blobDetails.downloadUrl);

    if (!response.ok) {
      return new NextResponse("Error obteniendo el documento", { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Te mostramos el PDF directamente en el navegador
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline', 
      }
    });
  } catch (error) {
    console.error("Error en el puente PDF:", error);
    return new NextResponse(`Error interno: ${error.message}`, { status: 500 });
  }
}