import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { readJsonFileWithCache, fileCache } from "@/lib/cache"

const MENU_FILE_PATH = path.join(process.cwd(), "data", "menu.json")

// GET - Obtener todos los datos del menú
// OPTIMIZACIÓN: Usa cache en memoria para evitar lecturas repetidas del disco
export async function GET() {
  try {
    // Cache de 5 segundos - suficiente para reducir CPU pero mantiene datos frescos
    const menuData = await readJsonFileWithCache<any>(MENU_FILE_PATH, 5000)
    
    // Headers de cache HTTP para el cliente
    const response = NextResponse.json(menuData)
    response.headers.set('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=10')
    
    return response
  } catch (error) {
    console.error("Error reading menu data:", error)
    return NextResponse.json(
      { error: "Error al leer los datos del menú" },
      { status: 500 }
    )
  }
}

// POST - Actualizar todos los datos del menú (hace merge con los datos existentes)
export async function POST(request: NextRequest) {
  try {
    const newMenuData = await request.json()
    
    // Leer los datos existentes (usando cache si está disponible)
    let existingData = {}
    try {
      existingData = await readJsonFileWithCache<any>(MENU_FILE_PATH, 5000)
    } catch (error) {
      console.log("No existing menu data, creating new file")
    }
    
    // Hacer merge: los datos nuevos se agregan o actualizan sobre los existentes
    const mergedData = {
      ...existingData,
      ...newMenuData
    }
    
    // Escribir los datos combinados al archivo
    await fs.writeFile(MENU_FILE_PATH, JSON.stringify(mergedData, null, 2), "utf8")
    
    // OPTIMIZACIÓN: Invalidar cache después de escribir para que la próxima lectura sea fresca
    fileCache.invalidate(MENU_FILE_PATH)
    
    return NextResponse.json({ 
      message: "Menú actualizado exitosamente",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error updating menu data:", error)
    return NextResponse.json(
      { error: "Error al actualizar los datos del menú" },
      { status: 500 }
    )
  }
}
