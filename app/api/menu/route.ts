import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const MENU_FILE_PATH = path.join(process.cwd(), "data", "menu.json")

// GET - Obtener todos los datos del menú
export async function GET() {
  try {
    // Verificar si el archivo existe
    try {
      await fs.access(MENU_FILE_PATH)
    } catch {
      // Si no existe, crear un archivo vacío y devolverlo
      const emptyData = {}
      await fs.writeFile(MENU_FILE_PATH, JSON.stringify(emptyData, null, 2), "utf8")
      return NextResponse.json(emptyData)
    }

    const fileContents = await fs.readFile(MENU_FILE_PATH, "utf8")
    
    // Si el archivo está vacío, devolver objeto vacío
    if (!fileContents.trim()) {
      const emptyData = {}
      await fs.writeFile(MENU_FILE_PATH, JSON.stringify(emptyData, null, 2), "utf8")
      return NextResponse.json(emptyData)
    }
    
    const menuData = JSON.parse(fileContents)
    
    return NextResponse.json(menuData)
  } catch (error) {
    console.error("Error reading menu data:", error)
    // En caso de error, devolver objeto vacío en lugar de error 500
    try {
      const emptyData = {}
      await fs.writeFile(MENU_FILE_PATH, JSON.stringify(emptyData, null, 2), "utf8")
      return NextResponse.json(emptyData)
    } catch (writeError) {
      console.error("Error creating empty menu file:", writeError)
      return NextResponse.json(
        { error: "Error al leer los datos del menú" },
        { status: 500 }
      )
    }
  }
}

// POST - Actualizar todos los datos del menú (hace merge con los datos existentes)
export async function POST(request: NextRequest) {
  try {
    const newMenuData = await request.json()
    
    // Leer los datos existentes
    let existingData = {}
    try {
      const fileContents = await fs.readFile(MENU_FILE_PATH, "utf8")
      existingData = JSON.parse(fileContents)
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
