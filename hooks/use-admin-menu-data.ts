"use client"

import { useState, useEffect } from "react"
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

  const fetchData = async () => {
    try {
      setLoading(true)
      // En el admin, incluir productos ocultos para poder gestionarlos
      const data = await fetchMenuData(true) // true = incluir productos ocultos
      setMenuData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      console.error("Error fetching admin menu data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const refetch = () => {
    fetchData()
  }

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
