import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request) {
  // 1. Verificamos que seas tú quien está pidiendo el archivo
  const user = await currentUser();
  if (!user) return new NextResponse("No autorizado", { status: 401 });

  const url = request.nextUrl.searchParams.get('url');
  if (!url) return new NextResponse("Falta la URL del documento", { status: 400 });

  try {
    // 2. Le pedimos el archivo directamente a Vercel Blob, usando nuestra llave secreta,
    // al igual que hicimos con Litis IA.
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
      }
    });

    if (!response.ok) {
       return new NextResponse(`Vercel Blob denegó el acceso (Status: ${response.status})`, { status: response.status });
    }

    // 3. LA MAGIA ESTÁ AQUÍ: En lugar de descargar todo en un ArrayBuffer y 
    // pasarlo a memoria (lo que dispara el límite de 4.5MB), 
    // pasamos el 'body' de la respuesta (que es un ReadableStream) 
    // DIRECTAMENTE a NextResponse. Esto crea una tubería entre Vercel Blob y tu navegador.
    return new NextResponse(response.body, {
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