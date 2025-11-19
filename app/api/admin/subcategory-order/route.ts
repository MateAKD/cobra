import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const SUBCATEGORY_ORDER_FILE_PATH = path.join(process.cwd(), "data", "subcategory-order.json")

// GET - Obtener el orden de subcategorías
export async function GET() {
  try {
    const fileContents = await fs.readFile(SUBCATEGORY_ORDER_FILE_PATH, "utf8")
    const subcategoryOrder = JSON.parse(fileContents)
    
    return NextResponse.json(subcategoryOrder)
  } catch (error) {
    console.error("Error reading subcategory order:", error)
    // Si el archivo no existe, devolver orden por defecto
    return NextResponse.json({})
  }
}

// POST - Actualizar el orden de subcategorías
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoryId, subcategoryOrder } = body
    
    if (!categoryId || !Array.isArray(subcategoryOrder)) {
      return NextResponse.json(
        { error: "categoryId y subcategoryOrder (array) son requeridos" },
        { status: 400 }
      )
    }
    
    // Leer el archivo actual
    let allOrders: Record<string, string[]> = {}
    try {
      const fileContents = await fs.readFile(SUBCATEGORY_ORDER_FILE_PATH, "utf8")
      allOrders = JSON.parse(fileContents)
    } catch (error) {
      // Si el archivo no existe, empezar con objeto vacío
      console.log("Creating new subcategory-order.json file")
    }
    
    // Actualizar el orden para la categoría específica
    allOrders[categoryId] = subcategoryOrder
    
    // Guardar de vuelta al archivo
    await fs.writeFile(
      SUBCATEGORY_ORDER_FILE_PATH,
      JSON.stringify(allOrders, null, 2),
      "utf8"
    )
    
    return NextResponse.json({ 
      success: true, 
      message: "Orden de subcategorías actualizado correctamente" 
    })
  } catch (error) {
    console.error("Error updating subcategory order:", error)
    return NextResponse.json(
      { error: "Error al actualizar el orden de subcategorías" },
      { status: 500 }
    )
  }
}

