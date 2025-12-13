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

// OPTIMIZACIÓN: Función optimizada para filtrar productos ocultos
// Usa un solo pase sobre los datos en lugar de múltiples iteraciones
export function filterHiddenItems(data: any): any {
  if (!data) return data

  // Si es un array, filtrar elementos ocultos
  // OPTIMIZACIÓN: Usar filter una sola vez en lugar de múltiples pasadas
  if (Array.isArray(data)) {
    return data.filter((item: any) => !item.hidden)
  }

  // Si es un objeto, procesar recursivamente
  // OPTIMIZACIÓN: Usar Object.keys una sola vez y procesar en un solo bucle
  if (typeof data === 'object' && data !== null) {
    const filteredData: any = {}
    const keys = Object.keys(data)

    // OPTIMIZACIÓN: Procesar todas las claves en un solo bucle
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const value = data[key]

      if (Array.isArray(value)) {
        // Filtrar arrays de productos
        filteredData[key] = value.filter((item: any) => !item.hidden)
      } else if (typeof value === 'object' && value !== null) {
        // Procesar objetos anidados recursivamente
        filteredData[key] = filterHiddenItems(value)
      } else {
        // Mantener valores primitivos
        filteredData[key] = value
      }
    }

    return filteredData
  }

  // Para valores primitivos, devolver tal como están
  return data
}

// Función para obtener datos del menú con filtrado opcional
// OPTIMIZACIÓN: Usa cache con revalidación en lugar de no-store
// FIXED: Agregado parámetro bypassCache para forzar datos frescos cuando sea necesario
export async function fetchMenuData(includeHidden: boolean = false, bypassCache: boolean = false) {
  try {
    // FIXED: Si bypassCache es true, usar no-store para obtener datos frescos
    const fetchOptions: RequestInit = bypassCache
      ? { cache: 'no-store' }
      : { next: { revalidate: 5 } }

    const response = await fetch("/api/menu", fetchOptions)

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

// FIXED: Función para verificar si una categoría debe mostrarse según su horario
// CAMBIO CRÍTICO: Ahora es fail-safe - retorna true si la configuración es inválida
// Esto previene que categorías desaparezcan por configuraciones incorrectas
export function isCategoryVisible(categoryId: string, categories: Record<string, Category>): boolean {
  const category = categories[categoryId]

  // Si la categoría no existe o no tiene restricción horaria, mostrarla
  if (!category || !category.timeRestricted) {
    return true
  }

  // FIXED: Si tiene restricción horaria pero no tiene horarios configurados,
  // MOSTRARLA en lugar de ocultarla (fail-safe approach)
  // Esto previene que categorías queden invisibles permanentemente
  if (!category.startTime || !category.endTime) {
    console.warn(`⚠️ Categoría "${categoryId}" tiene timeRestricted=true pero horarios inválidos. Mostrando por defecto.`)
    return true
  }

  // Verificar si la hora actual está dentro del rango
  return isTimeInRange(category.startTime, category.endTime)
}

// NUEVA FUNCIÓN: Verificar si una categoría debe ocultarse completamente
// Retorna true si la categoría debe ocultarse por:
// 1. Restricción de horario (fuera del horario permitido)
// 2. Todos los productos están ocultos
export function shouldHideCategory(
  categoryId: string,
  categories: Record<string, Category>,
  categoryData: any,
  subcategoryMapping?: Record<string, string>
): boolean {
  const category = categories[categoryId]

  // CRITICAL FIX: Si la categoría no existe en metadata, NO ocultarla
  // Muchas categorías pueden no tener metadata pero sí tener productos
  if (!category) {
    return false // NO ocultar si no hay metadata
  }

  // 1. Verificar restricción de horario
  if (category.timeRestricted && category.startTime && category.endTime) {
    const isInTimeRange = isTimeInRange(category.startTime, category.endTime)
    if (!isInTimeRange) {
      return true // Ocultar si está fuera del horario
    }
  }

  // 2. Verificar si todos los productos están ocultos
  // Si la categoría tiene datos (productos)
  if (categoryData && Array.isArray(categoryData)) {
    // Si no hay productos visibles, ocultar la categoría
    const visibleProducts = categoryData.filter((item: any) => !item.hidden)
    if (visibleProducts.length === 0) {
      // Solo ocultar si no tiene subcategorías
      if (subcategoryMapping) {
        const hasSubcategories = Object.values(subcategoryMapping).includes(categoryId)
        if (!hasSubcategories) {
          return true // Ocultar si no tiene productos visibles ni subcategorías
        }
      } else {
        return true // Ocultar si no hay productos visibles
      }
    }
  }

  return false // No ocultar
}

// NUEVA FUNCIÓN: Verificar si una subcategoría debe ocultarse
// Una subcategoría se oculta si:
// 1. Su categoría padre está oculta por horario
// 2. Todos sus productos están ocultos Y no tiene sub-subcategorías CON PRODUCTOS
export function shouldHideSubcategory(
  subcategoryId: string,
  parentCategoryId: string,
  categories: Record<string, Category>,
  subcategoryData: any,
  subcategoryMapping?: Record<string, string>,
  menuData?: any
): boolean {
  // 1. Si la categoría padre está oculta por horario, ocultar la subcategoría
  const parentCategory = categories[parentCategoryId]
  if (parentCategory && parentCategory.timeRestricted && parentCategory.startTime && parentCategory.endTime) {
    const isInTimeRange = isTimeInRange(parentCategory.startTime, parentCategory.endTime)
    if (!isInTimeRange) {
      return true // Ocultar si el padre está fuera del horario
    }
  }

  // 2. Verificar si tiene sub-subcategorías CON PRODUCTOS (no ocultar si las tiene)
  if (subcategoryMapping && menuData) {
    const subSubcategoryIds = Object.entries(subcategoryMapping)
      .filter(([, parentId]) => parentId === subcategoryId)
      .map(([subsubId]) => subsubId)

    // Verificar si alguna sub-subcategoría tiene productos
    const hasSubSubcategoriesWithProducts = subSubcategoryIds.some(subsubId => {
      const subsubData = menuData[subsubId]
      return Array.isArray(subsubData) && subsubData.filter((item: any) => !item.hidden).length > 0
    })

    if (hasSubSubcategoriesWithProducts) {
      return false // NO ocultar si tiene sub-subcategorías con productos
    }
  }

  // 3. Verificar si todos los productos de la subcategoría están ocultos
  if (subcategoryData && Array.isArray(subcategoryData)) {
    const visibleProducts = subcategoryData.filter((item: any) => !item.hidden)
    if (visibleProducts.length === 0) {
      return true // Ocultar si no hay productos visibles
    }
  }

  return false // No ocultar
}




// DEPRECATED: Esta función ya no se usa para filtrar categorías del menú
// Las categorías ahora siempre se muestran, con indicadores de disponibilidad
// Mantenida solo para compatibilidad hacia atrás
export function filterCategoriesByTime(menuData: any, categories: Record<string, Category>): any {
  console.warn('⚠️ filterCategoriesByTime está deprecated y no debería usarse. Las categorías ya no se ocultan automáticamente.')
  // Retornar todos los datos sin filtrar
  return menuData
}

// NUEVA FUNCIÓN: Obtener información de disponibilidad sin ocultar categorías
export interface CategoryAvailabilityStatus {
  categoryId: string
  isAvailable: boolean
  timeRestricted: boolean
  startTime?: string
  endTime?: string
  availabilityMessage?: string
}

export function getCategoryAvailabilityStatus(
  categoryId: string,
  categories: Record<string, Category>
): CategoryAvailabilityStatus {
  const category = categories[categoryId]

  // Si no existe o no tiene restricción, está disponible
  if (!category || !category.timeRestricted) {
    return {
      categoryId,
      isAvailable: true,
      timeRestricted: false
    }
  }

  // Si tiene restricción pero horarios inválidos, marcar como disponible con advertencia
  if (!category.startTime || !category.endTime) {
    return {
      categoryId,
      isAvailable: true,
      timeRestricted: true,
      availabilityMessage: 'Configuración de horario inválida'
    }
  }

  // Verificar disponibilidad según horario
  const isAvailable = isTimeInRange(category.startTime, category.endTime)

  return {
    categoryId,
    isAvailable,
    timeRestricted: true,
    startTime: category.startTime,
    endTime: category.endTime,
    availabilityMessage: isAvailable
      ? undefined
      : `Disponible de ${category.startTime} a ${category.endTime}`
  }
}

// Función para obtener categorías
// OPTIMIZACIÓN: Usa cache con revalidación en lugar de no-store
export async function fetchCategories(): Promise<Record<string, Category>> {
  try {
    // OPTIMIZACIÓN: Cache de 5 segundos con revalidación en background
    const response = await fetch("/api/categories", {
      next: { revalidate: 5 }, // Revalidar cada 5 segundos
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
