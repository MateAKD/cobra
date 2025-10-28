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
    <div className="min-h-screen cobra-snake-bg flex flex-col">
      {/* Header con logo */}
      <header className="flex flex-col items-center pt-18 sm:pt-20 md:pt-25 pb-3 sm:pb-4 px-4">
        <div className="text-center">
          <img
            src="/Logo cobra NEGRO.png"
            alt="COBRA"
            className="h-52 sm:h-60 md:h-72 lg:h-80 w-auto object-contain mx-auto mb-3 sm:mb-4"
          />
          <p className="text-sm sm:text-base text-gray-700">
            Bar & Lounge
          </p>
        </div>
      </header>

      {/* Botonera principal */}
      <main className="flex flex-col justify-center px-2 sm:px-3 py-4">
        <div className="w-full max-w-xs sm:max-w-sm mx-auto space-y-3">
          {/* Botón Menú */}
          <Link href="/menu" className="block">
            <div className="bg-transparent rounded-2xl shadow-sm border border-gray-200 py-4 px-5 flex items-center justify-between hover:bg-gray-100/20 transition-colors cursor-pointer min-h-[64px]">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center text-gray-700">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-lg font-medium text-gray-900">Menú</span>
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
            <div className="bg-transparent rounded-2xl shadow-sm border border-gray-200 py-4 px-5 flex items-center justify-between hover:bg-gray-100/20 transition-colors cursor-pointer min-h-[64px]">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-gray-700" />
                <span className="text-lg font-medium text-gray-900">¿Cómo llegar?</span>
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
            <div className="bg-transparent rounded-2xl shadow-sm border border-gray-200 py-4 px-5 flex items-center justify-between hover:bg-gray-100/20 transition-colors cursor-pointer min-h-[64px]">
              <div className="flex items-center gap-3">
                <Phone className="w-6 h-6 text-gray-700" />
                <span className="text-lg font-medium text-gray-900">Reservas</span>
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
            <div className="bg-transparent rounded-2xl shadow-sm border border-gray-200 py-4 px-5 flex items-center justify-between hover:bg-gray-100/20 transition-colors cursor-pointer min-h-[64px]">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-gray-700" />
                <span className="text-lg font-medium text-gray-900">Eventos</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </a>
        </div>
      </main>

      {/* Footer con botones de Google y Playlists */}
      <footer className="fixed bottom-0 left-0 right-0 pb-1.5 px-3 sm:px-4 sm:pb-2 bg-transparent">
        <div className="flex gap-2 sm:gap-3 w-full max-w-xs sm:max-w-sm mx-auto px-4">
          <a 
            href="https://www.google.com/maps/place/Cobra/@-34.5697932,-58.4208744,17z/data=!4m8!3m7!1s0x95bcb5b39404dffd:0xd617e2d1cc5078b1!8m2!3d-34.5697932!4d-58.4208744!9m1!1b1!16s%2Fg%2F11nryyz8vs?entry=ttu&g_ep=EgoyMDI1MTAyNi4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-black rounded-full py-2.5 sm:py-3 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-gray-800 transition-colors min-h-[44px] sm:min-h-[48px] text-white"
          >
            {/* Icono de estrella blanca vacía */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" className="sm:w-4 sm:h-4">
              <polygon 
                points="12 2 15.09 8.264 22 9.27 17 14.158 18.18 22 12 18.273 5.82 22 7 14.158 2 9.27 8.91 8.264 12 2" 
                stroke="#FFFFFF" 
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span className="text-sm sm:text-base font-medium" style={{ color: '#FFFFFF' }}>Calificanos</span>
          </a>
          <a 
            href="https://open.spotify.com/playlist/46Z7tRbqn9KIrMDxSjJ83p?si=911e7ba94e7d4bc9&nd=1&dlsi=8fc4256299314a50"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-black rounded-full py-2.5 sm:py-3 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-gray-800 transition-colors min-h-[44px] sm:min-h-[48px] text-white"
          >
            {/* Icono de Spotify blanco */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="sm:w-4 sm:h-4">
              <circle cx="12" cy="12" r="12" fill="#fff"/>
              <path
                d="M17.643 16.31a.673.673 0 0 1-.927.214c-2.528-1.55-5.712-1.899-9.465-1.035a.676.676 0 1 1-.28-1.325c4.123-.876 7.732-.482 10.548 1.176.32.197.418.616.124.97zm1.346-2.67a.837.837 0 0 1-1.162.263c-2.911-1.789-7.357-2.316-10.796-1.26a.837.837 0 0 1-.49-1.612c3.865-1.176 8.738-.598 12.039 1.429.39.238.513.742.216 1.18zm.142-2.878C14.996 9.03 8.445 8.839 5.307 9.787a1.005 1.005 0 1 1-.587-1.933c3.542-1.078 10.699-.853 14.368 1.39a1.007 1.007 0 1 1-1.065 1.618z"
                fill="#000"
              />
            </svg>
            <span className="text-sm sm:text-base font-medium" style={{ color: '#FFFFFF' }}>Playlists</span>
          </a>
        </div>

        {/* Botón de Instagram centrado */}
        <div className="flex justify-center w-full max-w-xs sm:max-w-sm mx-auto px-4 mt-1 sm:mt-1.5">
          <a 
            href="https://www.instagram.com/cobra.ba"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black rounded-full py-2.5 sm:py-3 px-6 sm:px-8 flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-gray-800 transition-colors min-h-[44px] sm:min-h-[48px] text-white"
          >
            {/* Logo de Instagram - Icono blanco */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFFFFF" className="sm:w-4 sm:h-4">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span className="text-sm sm:text-base font-medium" style={{ color: '#FFFFFF' }}>Instagram</span>
          </a>
        </div>

        {/* Copyright y créditos bajados completamente */}
        <div className="flex flex-col items-center mb-2 sm:mb-3 mt-3 sm:mt-4 w-full">
          <div className="text-center text-gray-500 text-xs sm:text-sm">
            © 2025 COBRA Bar
          </div>
          {/* Créditos de desarrollo */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mt-2">
            <p className="text-xs text-gray-500">Desarrollado por</p>
            <div className="flex gap-4">
              <a 
                href="https://akdmiastudio.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-gray-800 transition-colors duration-300"
              >
                AKDMIA Studio
              </a>
              <span className="text-xs text-gray-500">•</span>
              <a 
                href="https://livvvv.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-gray-800 transition-colors duration-300"
              >
                Livv Studio
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
