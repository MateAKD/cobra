// Utilidades compartidas para el manejo de datos del menú

interface Category {
  name: string
  description: string
  order: number
  timeRestricted?: boolean
  startTime?: string
  endTime?: string
}

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

// Función para verificar si una hora está dentro de un rango horario
export function isTimeInRange(startTime: string, endTime: string): boolean {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTimeInMinutes = currentHour * 60 + currentMinute
  
  // Parsear hora de inicio
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const startTimeInMinutes = startHour * 60 + startMinute
  
  // Parsear hora de fin
  const [endHour, endMinute] = endTime.split(':').map(Number)
  const endTimeInMinutes = endHour * 60 + endMinute
  
  // Si el rango cruza la medianoche (ej: 22:00 a 02:00)
  if (startTimeInMinutes > endTimeInMinutes) {
    return currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes <= endTimeInMinutes
  }
  
  // Rango normal dentro del mismo día
  return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes
}

// Función para verificar si una categoría debe mostrarse según su horario
export function isCategoryVisible(categoryId: string, categories: Record<string, Category>): boolean {
  const category = categories[categoryId]
  
  // Si la categoría no existe o no tiene restricción horaria, mostrarla
  if (!category || !category.timeRestricted) {
    return true
  }
  
  // Si tiene restricción horaria pero no tiene horarios configurados, ocultarla por seguridad
  if (!category.startTime || !category.endTime) {
    return false
  }
  
  // Verificar si la hora actual está dentro del rango
  return isTimeInRange(category.startTime, category.endTime)
}

// Función para filtrar categorías según su horario
export function filterCategoriesByTime(menuData: any, categories: Record<string, Category>): any {
  if (!menuData || !categories) return menuData
  
  const filteredData: any = {}
  
  Object.keys(menuData).forEach(key => {
    // Verificar si la categoría debe mostrarse según su horario
    if (isCategoryVisible(key, categories)) {
      filteredData[key] = menuData[key]
    }
  })
  
  return filteredData
}

// Función para obtener categorías
export async function fetchCategories(): Promise<Record<string, Category>> {
  try {
    const response = await fetch("/api/categories", {
      cache: "no-store",
    })
    
    if (!response.ok) {
      throw new Error("Error al cargar las categorías")
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error fetching categories:", error)
    return {}
  }
}
