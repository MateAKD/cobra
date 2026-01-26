"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, Calendar, Phone, ChevronRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen max-h-screen overflow-hidden cobra-snake-bg flex flex-col justify-center items-center py-4 sm:py-6">
      {/* Contenedor principal con todas las secciones juntas */}
      <div className="flex flex-col items-center gap-4 sm:gap-6 w-full px-4">
        {/* Header con logo - grande y centrado */}
        <header className="flex flex-col items-center flex-shrink-0">
          <div className="text-center relative w-full flex justify-center mb-2 sm:mb-3">
            <div className="h-40 sm:h-48 md:h-56 lg:h-64 w-auto relative aspect-[3/2]">
              <Image
                src="/Logo cobra NEGRO.png"
                alt="COBRA"
                width={300}
                height={200}
                className="object-contain h-full w-auto"
                priority
              />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-700 font-medium">
            Bar & Lounge
          </p>
        </header>

        {/* Botonera principal - centrada */}
        <main className="flex-shrink-0 w-full">
          <div className="w-full max-w-sm mx-auto space-y-2.5 sm:space-y-3">
            {/* Botón Menú */}
            <Link href="/menu" className="block">
              <div className="bg-transparent rounded-2xl shadow-sm border border-gray-200 py-3 sm:py-4 px-4 sm:px-5 flex items-center justify-between hover:bg-gray-100/20 transition-colors cursor-pointer min-h-[56px] sm:min-h-[64px]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center text-gray-700">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
          <div className="w-full max-w-sm mx-auto mt-3 sm:mt-4 space-y-2">
            {/* Fila de botones Calificanos y Playlists */}
            <div className="flex gap-1.5 sm:gap-2">
              <a
                href="https://www.google.com/maps/place/Cobra/@-34.5697932,-58.4208744,17z/data=!4m8!3m7!1s0x95bcb5b39404dffd:0xd617e2d1cc5078b1!8m2!3d-34.5697932!4d-58.4208744!9m1!1b1!16s%2Fg%2F11nryyz8vs?entry=ttu&g_ep=EgoyMDI1MTAyNi4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-black rounded-full py-1.5 sm:py-2 px-2.5 sm:px-3 flex items-center justify-center gap-1 sm:gap-1.5 hover:bg-gray-800 transition-colors min-h-[36px] sm:min-h-[40px] text-white"
              >
                {/* Icono de estrella blanca rellena */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFFFFF" className="w-3.5 h-3.5">
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                  <circle cx="12" cy="12" r="12" fill="#fff" />
                  <path
                    d="M17.643 16.31a.673.673 0 0 1-.927.214c-2.528-1.55-5.712-1.899-9.465-1.035a.676.676 0 1 1-.28-1.325c4.123-.876 7.732-.482 10.548 1.176.32.197.418.616.124.97zm1.346-2.67a.837.837 0 0 1-1.162.263c-2.911-1.789-7.357-2.316-10.796-1.26a.837.837 0 0 1-.49-1.612c3.865-1.176 8.738-.598 12.039 1.429.39.238.513.742.216 1.18zm.142-2.878C14.996 9.03 8.445 8.839 5.307 9.787a1.005 1.005 0 1 1-.587-1.933c3.542-1.078 10.699-.853 14.368 1.39a1.007 1.007 0 1 1-1.065 1.618z"
                    fill="#000"
                  />
                </svg>
                <span className="text-[11px] sm:text-xs font-medium" style={{ color: '#FFFFFF' }}>Playlists</span>
              </a>
            </div>

            {/* Botón de Instagram - mismo ancho que los otros */}
            <a
              href="https://www.instagram.com/cobra.ba"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-black rounded-full py-1.5 sm:py-2 px-2.5 sm:px-3 flex items-center justify-center gap-1 sm:gap-1.5 hover:bg-gray-800 transition-colors min-h-[36px] sm:min-h-[40px] text-white"
            >
              {/* Logo de Instagram - Icono blanco */}
              <svg width="14" height="14" viewBox="2 2 20 20" fill="none" className="w-3.5 h-3.5">
                <rect x="2" y="2" width="20" height="20" rx="6" fill="#fff" />
                <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="5.25" stroke="#fff" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="5" stroke="#000" strokeWidth="1.5" fill="none" />
                <circle cx="12" cy="12" r="3" fill="#000" />
                <circle cx="17.1" cy="6.9" r="1" fill="#000" />
              </svg>
              <span className="text-[11px] sm:text-xs font-medium" style={{ color: '#FFFFFF' }}>Instagram</span>
            </a>
          </div>
        </main>

        {/* Footer con copyright - SIEMPRE VISIBLE */}
        <footer className="flex-shrink-0 pb-safe w-full">
          {/* Copyright y créditos */}
          <div className="flex flex-col items-center w-full">
            <div className="text-center text-gray-700 text-sm sm:text-base font-semibold">
              © 2025 COBRA Bar
            </div>
            {/* Créditos de desarrollo */}
            <div className="flex justify-center items-center gap-2 sm:gap-2.5 mt-1 sm:mt-1.5">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Dev by</p>
              <a
                href="https://akdmiastudio.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-gray-700 hover:text-gray-900 transition-colors duration-300 font-medium"
              >
                AKDMIA
              </a>
              <span className="text-xs sm:text-sm text-gray-500">•</span>
              <a
                href="https://livvvv.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-gray-700 hover:text-gray-900 transition-colors duration-300 font-medium"
              >
                Livv
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
