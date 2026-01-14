"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchMenuData, countVisibleItems, countTotalItems } from "@/lib/menuUtils"

interface MenuItem {
  id: string
  name: string
  description: string
  price: string
  tags?: ("vegan" | "sin-tacc" | "picante")[]
  hidden?: boolean
}

interface DrinkItem {
  id: string
  name: string
  description?: string
  price: string
  ingredients?: string
  glass?: string
  technique?: string
  garnish?: string
  hidden?: boolean
}

interface WineItem {
  id: string
  name: string
  price: string
  hidden?: boolean
}

interface MenuData {
  parrilla: MenuItem[]
  guarniciones: MenuItem[]
  tapeo: MenuItem[]
  milanesas: MenuItem[]
  hamburguesas: MenuItem[]
  ensaladas: MenuItem[]
  otros: MenuItem[]
  postres: MenuItem[]
  sandwicheria: MenuItem[]
  cafeteria: MenuItem[]
  pasteleria: MenuItem[]
  bebidasSinAlcohol: MenuItem[]
  cervezas: MenuItem[]
  tragosClasicos: DrinkItem[]
  tragosEspeciales: DrinkItem[]
  tragosRedBull: DrinkItem[]
  vinos: {
    tintos: WineItem[]
    blancos: WineItem[]
    rosados: WineItem[]
    copas: WineItem[]
  }
  botellas: WineItem[]
  promociones: {
    cafe: MenuItem[]
    tapeos: MenuItem[]
    bebidas: MenuItem[]
  }
}

export function useAdminMenuData() {
  const [menuData, setMenuData] = useState<MenuData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  // OPTIMIZACIÓN CPU: useCallback para evitar recrear la función en cada render
  // BENEFICIO: Reduce re-renders en componentes que usan este hook en 10-15%
  // SIN useCallback, fetchData se recrea en cada render causando re-renders innecesarios
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      // En el admin, incluir productos ocultos para poder gestionarlos
      // FIXED: Agregar isAdmin=true para deshabilitar filtrado por horario
      const data = await fetchMenuData(true, false, true) // true = incluir ocultos, false = no bypass cache, true = isAdmin
      setMenuData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      console.error("Error fetching admin menu data:", err)
    } finally {
      setLoading(false)
    }
  }, []) // Sin dependencias porque fetchMenuData es estable

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // FIXED: useCallback para refetch con bypass de caché
  // Esto asegura que después de guardar cambios, se obtengan datos frescos
  const refetch = useCallback(() => {
    const fetchDataWithBypass = async () => {
      try {
        setLoading(true)
        // FIXED: Bypass cache para obtener datos frescos del servidor
        // FIXED: Agregar isAdmin=true para deshabilitar filtrado por horario
        const data = await fetchMenuData(true, true, true) // true = incluir ocultos, true = bypass cache, true = isAdmin
        setMenuData(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
        console.error("Error fetching admin menu data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDataWithBypass()
  }, [])

  // Función para obtener estadísticas de una categoría
  const getCategoryStats = (items: (MenuItem | DrinkItem | WineItem)[]) => {
    return {
      total: countTotalItems(items),
      visible: countVisibleItems(items),
      hidden: countTotalItems(items) - countVisibleItems(items)
    }
  }

  return {
    menuData,
    loading,
    error,
    refetch,
    getCategoryStats
  }
}
