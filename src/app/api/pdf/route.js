import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { get } from '@vercel/blob';

export async function GET(request) {
  const user = await currentUser();
  if (!user) return new NextResponse("No autorizado", { status: 401 });

  const url = request.nextUrl.searchParams.get('url');
  if (!url) return new NextResponse("Falta la URL del documento", { status: 400 });

  try {
    // La función 'get' oficial de Vercel con access: 'private' 
    // se encarga de autenticar la petición internamente de forma segura.
    const result = await get(url, { access: 'private' });

    return new NextResponse(result.stream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline', 
      }
    });
  } catch (error) {
    console.error("Error en el puente PDF Streaming:", error);
    return new NextResponse(`Error interno: ${error.message}`, { status: 500 });
  }
}