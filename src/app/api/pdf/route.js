import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { head } from '@vercel/blob';

export async function GET(request) {
  const user = await currentUser();
  if (!user) return new NextResponse("No autorizado", { status: 401 });

  const url = request.nextUrl.searchParams.get('url');
  if (!url) return new NextResponse("Falta la URL del documento", { status: 400 });

  try {
    // 1. Usamos la función oficial 'head' de Vercel Blob. 
    // Esta función usa internamente la variable de entorno BLOB_READ_WRITE_TOKEN
    // para autorizar la petición y devolvernos una 'downloadUrl' (URL pre-firmada).
    const blobDetails = await head(url);

    // 2. Hacemos el fetch a la URL pre-firmada.
    const response = await fetch(blobDetails.downloadUrl);

    if (!response.ok) {
       return new NextResponse(`Error al descargar de la URL pre-firmada (Status: ${response.status})`, { status: response.status });
    }

    // 3. Devolvemos el PDF como un stream para evitar límites de memoria
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