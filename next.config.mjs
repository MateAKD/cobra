/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
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
        // Headers de seguridad globales
        source: '/:path*',
        headers: [
          // Protección contra clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Protección contra MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Protección XSS (legacy, pero útil para navegadores antiguos)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Forzar HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // Política de referrer
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Política de permisos
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Content Security Policy (CSP) - CRÍTICO para prevenir XSS y ataques de inyección
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-inline necesario para Next.js
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob:",
              "connect-src 'self' https:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          // Cache con revalidación (1 minuto)
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        // API routes: Cache corto con revalidación (5 minutos)
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
          // Rate limiting hint (para proxies que lo soporten)
          {
            key: 'X-RateLimit-Limit',
            value: '100',
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
    ]
  },
}

export default nextConfig

