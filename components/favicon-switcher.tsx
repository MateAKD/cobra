'use client'

import { useEffect } from 'react'

export function FaviconSwitcher() {
  useEffect(() => {
    const updateFavicon = () => {
      // Obtener el link del favicon o crearlo si no existe
      let favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement
      
      if (!favicon) {
        favicon = document.createElement('link')
        favicon.rel = 'icon'
        document.head.appendChild(favicon)
      }

      // Detectar si el usuario prefiere modo oscuro
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      // Cambiar el favicon según el tema
      if (prefersDark) {
        // Modo oscuro: usar logo blanco
        favicon.href = encodeURI('/Logo cobra sf.png')
      } else {
        // Modo claro: usar logo negro
        favicon.href = encodeURI('/Logo cobra NEGRO.png')
      }
    }

    // Actualizar al cargar
    updateFavicon()

    // Escuchar cambios en la preferencia de tema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    // Agregar listener para cambios en tiempo real
    const handleChange = () => {
      updateFavicon()
    }

    // Soporte para navegadores modernos
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback para navegadores antiguos
      mediaQuery.addListener(handleChange)
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  return null
}

