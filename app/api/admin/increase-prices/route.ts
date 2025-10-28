import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

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

    // Leer el archivo de menú actual
    const menuPath = path.join(process.cwd(), "data", "menu.json")
    const menuData = JSON.parse(fs.readFileSync(menuPath, "utf8"))

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

    // Función recursiva para procesar todas las secciones
    const processSection = (section: any): any => {
      if (Array.isArray(section)) {
        return section.map(item => {
          if (item.price) {
            return {
              ...item,
              price: increasePrice(item.price)
            }
          }
          return item
        })
      } else if (typeof section === "object" && section !== null) {
        const processedSection: any = {}
        for (const [key, value] of Object.entries(section)) {
          processedSection[key] = processSection(value)
        }
        return processedSection
      }
      return section
    }

    // Procesar todo el menú
    const updatedMenuData = processSection(menuData)

    // Guardar el archivo actualizado
    fs.writeFileSync(menuPath, JSON.stringify(updatedMenuData, null, 2))

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
