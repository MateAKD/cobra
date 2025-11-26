"use client"

import { useState, useEffect } from "react"
import { fetchMenuData, filterHiddenItems, fetchCategories, filterCategoriesByTime } from "@/lib/menuUtils"

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

export function useMenuData() {
  const [menuData, setMenuData] = useState<MenuData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      // Usar la función compartida que ya filtra productos ocultos
      let data = await fetchMenuData(false) // false = no incluir productos ocultos
      
      // Obtener categorías y filtrar por horario
      const categories = await fetchCategories()
      data = filterCategoriesByTime(data, categories)
      
      setMenuData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      console.error("Error fetching menu data:", err)
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

  return {
    menuData,
    loading,
    error,
    refetch
  }
}
