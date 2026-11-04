import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request) {
  // 1. Verificamos que quien pide el PDF sea un usuario logueado en tu app
  const user = await currentUser();
  if (!user) return new NextResponse("No autorizado", { status: 401 });

  // 2. Obtenemos la URL privada del PDF que queremos ver
  const url = request.nextUrl.searchParams.get('url');
  if (!url) return new NextResponse("Falta la URL del documento", { status: 400 });

  try {
    // 3. Vamos a Vercel Blob a buscar el archivo USANDO TU LLAVE SECRETA
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
      }
    });

    if (!response.ok) {
      return new NextResponse("Error obteniendo el documento", { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Te mostramos el PDF directamente en el navegador
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline', 
      }
    });
  } catch (error) {
    console.error("Error en el puente PDF:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}