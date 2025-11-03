"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MapPin, Calendar, Phone, ChevronRight } from "lucide-react"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular tiempo de carga inicial
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000) // 3 segundos de animación

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen cobra-snake-bg flex items-center justify-center">
        <div className="text-center flex flex-col items-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            {/* Logo en escala de grises como fondo */}
            <img
              src="/Logo cobra NEGRO.png"
              alt="Logo Cobra"
              className="absolute inset-0 w-full h-full object-contain opacity-30"
              style={{ filter: "grayscale(1)" }}
              draggable={false}
            />
            {/* Logo encima, con animación de "llenado" vertical */}
            <img
              src="/Logo cobra NEGRO.png"
              alt="Logo Cobra"
              className="absolute inset-0 w-full h-full object-contain animate-logo-fill"
              style={{
                zIndex: 2,
                filter: "brightness(1.5)",
                WebkitMaskImage: "linear-gradient(to top, white 0%, white 100%)",
                maskImage: "linear-gradient(to top, white 0%, white 100%)"
              }}
              draggable={false}
            />
            <style jsx global>{`
              @keyframes logo-fill {
                0% {
                  clip-path: inset(100% 0 0 0);
                  opacity: 1;
                }
                20% {
                  clip-path: inset(80% 0 0 0);
                  opacity: 1;
                }
                40% {
                  clip-path: inset(60% 0 0 0);
                  opacity: 1;
                }
                60% {
                  clip-path: inset(40% 0 0 0);
                  opacity: 1;
                }
                80% {
                  clip-path: inset(20% 0 0 0);
                  opacity: 1;
                }
                100% {
                  clip-path: inset(0 0 0 0);
                  opacity: 1;
                }
              }
              .animate-logo-fill {
                animation: logo-fill 3s ease-in-out forwards;
                will-change: clip-path;
              }
            `}</style>
          </div>
          <p className="text-black text-lg mt-4 animate-pulse">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen cobra-snake-bg flex flex-col overflow-hidden justify-between">
      {/* Header con logo - centrado */}
      <header className="flex flex-col items-center pt-8 sm:pt-10 pb-3 sm:pb-4 px-4 flex-shrink-0">
        <div className="text-center">
          <img
            src="/Logo cobra NEGRO.png"
            alt="COBRA"
            className="h-36 sm:h-44 md:h-52 lg:h-64 w-auto object-contain mx-auto mb-2 sm:mb-3"
          />
          <p className="text-xs sm:text-sm text-gray-700">
            Bar & Lounge
          </p>
        </div>
      </header>

      {/* Botonera principal - centrada */}
      <main className="flex-shrink-0 px-3 sm:px-4 pb-3">
        <div className="w-full max-w-xs sm:max-w-sm mx-auto space-y-2 sm:space-y-3">
          {/* Botón Menú */}
          <Link href="/menu" className="block">
            <div className="bg-transparent rounded-2xl shadow-sm border border-gray-200 py-3 sm:py-4 px-4 sm:px-5 flex items-center justify-between hover:bg-gray-100/20 transition-colors cursor-pointer min-h-[56px] sm:min-h-[64px]">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center text-gray-700">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-base sm:text-lg font-medium text-gray-900">Menú</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>

          {/* Botón ¿Cómo llegar? */}
          <a 
            href="https://maps.app.goo.gl/hm41Y1D2AyMAVe9U7"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="bg-transparent rounded-2xl shadow-sm border border-gray-200 py-3 sm:py-4 px-4 sm:px-5 flex items-center justify-between hover:bg-gray-100/20 transition-colors cursor-pointer min-h-[56px] sm:min-h-[64px]">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 sm:w-6 h-5 sm:h-6 text-gray-700" />
                <span className="text-base sm:text-lg font-medium text-gray-900">¿Cómo llegar?</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </a>

          {/* Botón Reservas */}
          <a 
            href="https://wa.me/5491159919880?text=Hola,%20quiero%20hacer%20una%20reserva%20para%20el%20día..."
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="bg-transparent rounded-2xl shadow-sm border border-gray-200 py-3 sm:py-4 px-4 sm:px-5 flex items-center justify-between hover:bg-gray-100/20 transition-colors cursor-pointer min-h-[56px] sm:min-h-[64px]">
              <div className="flex items-center gap-3">
                <Phone className="w-5 sm:w-6 h-5 sm:h-6 text-gray-700" />
                <span className="text-base sm:text-lg font-medium text-gray-900">Reservas</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </a>

          {/* Botón Eventos */}
          <a 
            href="/PPT_COBRA.pdf"
            download="Eventos Cobra.pdf"
            className="block"
          >
            <div className="bg-transparent rounded-2xl shadow-sm border border-gray-200 py-3 sm:py-4 px-4 sm:px-5 flex items-center justify-between hover:bg-gray-100/20 transition-colors cursor-pointer min-h-[56px] sm:min-h-[64px]">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 sm:w-6 h-5 sm:h-6 text-gray-700" />
                <span className="text-base sm:text-lg font-medium text-gray-900">Eventos</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </a>
        </div>

        {/* Botones negros - parte de la botonera principal */}
        <div className="w-full max-w-xs sm:max-w-sm mx-auto mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
          {/* Fila de botones Calificanos y Playlists */}
          <div className="flex gap-1.5 sm:gap-2">
            <a 
              href="https://www.google.com/maps/place/Cobra/@-34.5697932,-58.4208744,17z/data=!4m8!3m7!1s0x95bcb5b39404dffd:0xd617e2d1cc5078b1!8m2!3d-34.5697932!4d-58.4208744!9m1!1b1!16s%2Fg%2F11nryyz8vs?entry=ttu&g_ep=EgoyMDI1MTAyNi4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-black rounded-full py-1.5 sm:py-2 px-2.5 sm:px-3 flex items-center justify-center gap-1 sm:gap-1.5 hover:bg-gray-800 transition-colors min-h-[36px] sm:min-h-[40px] text-white"
            >
              {/* Icono de estrella blanca rellena */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFFFFF" className="sm:w-3.5 sm:h-3.5">
                <polygon 
                  points="12 2 15.09 8.264 22 9.27 17 14.158 18.18 22 12 18.273 5.82 22 7 14.158 2 9.27 8.91 8.264 12 2"
                  stroke="#FFFFFF" 
                  strokeLinejoin="round"
                  fill="#FFFFFF"
                />
              </svg>
              <span className="text-[11px] sm:text-xs font-medium" style={{ color: '#FFFFFF' }}>Calificanos</span>
            </a>
            <a 
              href="https://open.spotify.com/playlist/46Z7tRbqn9KIrMDxSjJ83p?si=911e7ba94e7d4bc9&nd=1&dlsi=8fc4256299314a50"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-black rounded-full py-1.5 sm:py-2 px-2.5 sm:px-3 flex items-center justify-center gap-1 sm:gap-1.5 hover:bg-gray-800 transition-colors min-h-[36px] sm:min-h-[40px] text-white"
            >
              {/* Icono de Spotify blanco */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="sm:w-3.5 sm:h-3.5">
                <circle cx="12" cy="12" r="12" fill="#fff"/>
                <path
                  d="M17.643 16.31a.673.673 0 0 1-.927.214c-2.528-1.55-5.712-1.899-9.465-1.035a.676.676 0 1 1-.28-1.325c4.123-.876 7.732-.482 10.548 1.176.32.197.418.616.124.97zm1.346-2.67a.837.837 0 0 1-1.162.263c-2.911-1.789-7.357-2.316-10.796-1.26a.837.837 0 0 1-.49-1.612c3.865-1.176 8.738-.598 12.039 1.429.39.238.513.742.216 1.18zm.142-2.878C14.996 9.03 8.445 8.839 5.307 9.787a1.005 1.005 0 1 1-.587-1.933c3.542-1.078 10.699-.853 14.368 1.39a1.007 1.007 0 1 1-1.065 1.618z"
                  fill="#000"
                />
              </svg>
              <span className="text-[11px] sm:text-xs font-medium" style={{ color: '#FFFFFF' }}>Playlists</span>
            </a>
          </div>

          {/* Botón de Instagram */}
          <div className="flex justify-center">
            <a 
              href="https://www.instagram.com/cobra.ba"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black rounded-full py-1.5 sm:py-2 px-4 sm:px-5 flex items-center justify-center gap-1 sm:gap-1.5 hover:bg-gray-800 transition-colors min-h-[36px] sm:min-h-[40px] text-white"
            >
              {/* Logo de Instagram - Icono blanco */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="sm:w-4 sm:h-4">
                <rect x="2" y="2" width="20" height="20" rx="6" fill="#fff"/>
                <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="5.25" stroke="#fff" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="5" stroke="#000" strokeWidth="1.5" fill="none"/>
                <circle cx="12" cy="12" r="3" fill="#000"/>
                <circle cx="17.1" cy="6.9" r="1" fill="#000"/>
              </svg>
              <span className="text-xs sm:text-sm font-medium" style={{ color: '#FFFFFF' }}>Instagram</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer con copyright */}
      <footer className="flex-shrink-0 pb-safe pt-3 sm:pt-4 pb-3 sm:pb-4">
        {/* Copyright y créditos */}
        <div className="flex flex-col items-center w-full">
          <div className="text-center text-gray-500 text-xs sm:text-sm font-medium">
            © 2025 COBRA Bar
          </div>
          {/* Créditos de desarrollo */}
          <div className="flex justify-center items-center gap-2 sm:gap-2.5 mt-1 sm:mt-1.5">
            <p className="text-[10px] sm:text-xs text-gray-500">Dev by</p>
            <a 
              href="https://akdmiastudio.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] sm:text-xs text-gray-600 hover:text-gray-800 transition-colors duration-300"
            >
              AKDMIA
            </a>
            <span className="text-[10px] sm:text-xs text-gray-400">•</span>
            <a 
              href="https://livvvv.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] sm:text-xs text-gray-600 hover:text-gray-800 transition-colors duration-300"
            >
              Livv
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
