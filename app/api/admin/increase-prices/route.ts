import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { readJsonFileWithCache, fileCache } from "@/lib/cache"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { percentage } = body

    // Validar que el porcentaje sea un número válido
    if (!percentage || isNaN(percentage) || percentage <= 0) {
      return NextResponse.json(
        { error: "El porcentaje debe ser un número mayor a 0" },
        { status: 400 }
      )
    }

    // OPTIMIZACIÓN: Usar cache y operaciones asíncronas en lugar de síncronas
    // Leer el archivo de menú actual usando cache
    const menuPath = path.join(process.cwd(), "data", "menu.json")
    const menuData = await readJsonFileWithCache<any>(menuPath, 5000)

    // Función para aumentar el precio de un elemento
    const increasePrice = (price: string): string => {
      // Limpiar el precio (remover puntos y comas, convertir a número)
      const cleanPrice = price.replace(/[.,]/g, "")
      const numericPrice = parseFloat(cleanPrice)
      
      if (isNaN(numericPrice)) {
        return price // Si no es un número válido, devolver el precio original
      }

      // Calcular el nuevo precio con el porcentaje
      const newPrice = numericPrice * (1 + percentage / 100)
      
      // Formatear el precio con puntos como separadores de miles
      return Math.round(newPrice).toLocaleString("es-AR")
    }

    // OPTIMIZACIÓN: Función recursiva optimizada para procesar todas las secciones
    // Evita crear objetos innecesarios y usa un solo pase cuando es posible
    const processSection = (section: any): any => {
      if (Array.isArray(section)) {
        // OPTIMIZACIÓN: Solo crear nuevo array si hay cambios
        const processed = section.map(item => {
          if (item.price) {
            return {
              ...item,
              price: increasePrice(item.price)
            }
          }
          return item
        })
        // Verificar si hubo cambios antes de retornar nuevo array
        return processed.some((item, idx) => item !== section[idx]) ? processed : section
      } else if (typeof section === "object" && section !== null) {
        const processedSection: any = {}
        const keys = Object.keys(section)
        let hasChanges = false
        
        // OPTIMIZACIÓN: Procesar en un solo bucle
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i]
          const processed = processSection(section[key])
          processedSection[key] = processed
          if (processed !== section[key]) {
            hasChanges = true
          }
        }
        
        return hasChanges ? processedSection : section
      }
      return section
    }

    // Procesar todo el menú
    const updatedMenuData = processSection(menuData)

    // OPTIMIZACIÓN: Usar operación asíncrona y invalidar cache después de escribir
    await fs.writeFile(menuPath, JSON.stringify(updatedMenuData, null, 2), "utf8")
    fileCache.invalidate(menuPath)

    return NextResponse.json({
      message: `Precios aumentados exitosamente en un ${percentage}%`,
      percentage: percentage,
      success: true
    })

  } catch (error) {
    console.error("Error al aumentar precios:", error)
    return NextResponse.json(
      { error: "Error interno del servidor al procesar los precios" },
      { status: 500 }
    )
  }
}
