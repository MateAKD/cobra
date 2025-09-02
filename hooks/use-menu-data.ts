"use client"

import { useState, useEffect } from "react"

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

  // Función para filtrar productos ocultos
  const filterHiddenItems = (data: any): MenuData => {
    const filteredData: any = {}
    
    // Filtrar arrays simples
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key])) {
        filteredData[key] = data[key].filter((item: any) => !item.hidden)
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        // Filtrar objetos anidados
        filteredData[key] = filterHiddenItems(data[key])
      } else {
        filteredData[key] = data[key]
      }
    })
    
    return filteredData
  }

  const fetchMenuData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/menu", {
        cache: "no-store", // Siempre obtener datos frescos
      })
      
      if (!response.ok) {
        throw new Error("Error al cargar los datos del menú")
      }
      
      const data = await response.json()
      // Filtrar productos ocultos antes de establecer los datos
      const filteredData = filterHiddenItems(data)
      setMenuData(filteredData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      console.error("Error fetching menu data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenuData()
  }, [])

  const refetch = () => {
    fetchMenuData()
  }

  return {
    menuData,
    loading,
    error,
    refetch
  }
}
