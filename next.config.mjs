/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  cleanDistDir: true,
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // ELIMINAMOS EL BLOQUE DE HEADERS PARA EVITAR CONFLICTOS CON EL VPS
}

export default nextConfig
