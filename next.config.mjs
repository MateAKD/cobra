/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  swcMinify: true, // Minificación más rápida usando SWC
  cleanDistDir: true, // Limpiar carpeta .next antes de build
  poweredByHeader: false, // Por seguridad y ahorro de bytes
  compiler: {
    removeConsole: process.env.NODE_ENV === "production", // Eliminar console.log en prod
  },
  // Optimización: Aumentar tiempo de cache de páginas en memoria
  // Esto reduce la regeneración innecesaria de páginas
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 60 segundos (antes 25s) - reduce regeneraciones
    pagesBufferLength: 5, // Aumentar buffer (antes 2) - mantiene más páginas en memoria
  },
  // Headers optimizados: Cache inteligente según el tipo de contenido
  async headers() {
    return [
      {
        // API routes: Cache corto con revalidación (5 minutos)
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      {
        // Assets estáticos: Cache largo
        source: '/:path*\\.(jpg|jpeg|png|gif|svg|ico|webp|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Páginas: Cache con revalidación (1 minuto)
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ]
  },
}

export default nextConfig
