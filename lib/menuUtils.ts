// Utilidades compartidas para el manejo de datos del menú

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

// Función para filtrar productos ocultos de cualquier estructura de datos
export function filterHiddenItems(data: any): any {
  if (!data) return data
  
  // Si es un array, filtrar elementos ocultos
  if (Array.isArray(data)) {
    return data.filter((item: any) => !item.hidden)
  }
  
  // Si es un objeto, procesar recursivamente
  if (typeof data === 'object' && data !== null) {
    const filteredData: any = {}
    
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key])) {
        // Filtrar arrays de productos
        filteredData[key] = data[key].filter((item: any) => !item.hidden)
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        // Procesar objetos anidados recursivamente
        filteredData[key] = filterHiddenItems(data[key])
      } else {
        // Mantener valores primitivos
        filteredData[key] = data[key]
      }
    })
    
    return filteredData
  }
  
  // Para valores primitivos, devolver tal como están
  return data
}

// Función para obtener datos del menú con filtrado opcional
export async function fetchMenuData(includeHidden: boolean = false) {
  try {
    const response = await fetch("/api/menu", {
      cache: "no-store", // Siempre obtener datos frescos
    })
    
    if (!response.ok) {
      throw new Error("Error al cargar los datos del menú")
    }
    
    const data = await response.json()
    
    // Si no se incluyen productos ocultos, filtrarlos
    if (!includeHidden) {
      return filterHiddenItems(data)
    }
    
    return data
  } catch (error) {
    console.error("Error fetching menu data:", error)
    throw error
  }
}

// Función para verificar si un producto está oculto
export function isItemHidden(item: MenuItem | DrinkItem | WineItem): boolean {
  return Boolean(item.hidden)
}

// Función para contar productos visibles en una categoría
export function countVisibleItems(items: (MenuItem | DrinkItem | WineItem)[]): number {
  return items.filter(item => !item.hidden).length
}

// Función para contar productos totales en una categoría
export function countTotalItems(items: (MenuItem | DrinkItem | WineItem)[]): number {
  return items.length
}
