/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // 👈 ¡Esta es la llave! Permite subir PDFs de hasta 10MB
    },
  },
};

export default nextConfig;