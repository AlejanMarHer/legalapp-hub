/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Agregamos el permiso para Server Actions pesadas (Evita que el botón se quede cargando)
  serverActions: {
    bodySizeLimit: '10mb', 
  },
  
  // 2. Mantenemos INTACTA tu configuración original de diseño
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;