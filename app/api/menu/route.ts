import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const MENU_FILE_PATH = path.join(process.cwd(), "data", "menu.json")

// GET - Obtener todos los datos del menú
export async function GET() {
  try {
    const fileContents = await fs.readFile(MENU_FILE_PATH, "utf8")
    const menuData = JSON.parse(fileContents)
    
    return NextResponse.json(menuData)
  } catch (error) {
    console.error("Error reading menu data:", error)
    return NextResponse.json(
      { error: "Error al leer los datos del menú" },
      { status: 500 }
    )
  }
}

// POST - Actualizar todos los datos del menú
export async function POST(request: NextRequest) {
  try {
    const newMenuData = await request.json()
    
    // Validar que los datos tengan la estructura correcta
    const requiredSections = ["tapas", "entrePanes", "postres", "tragosAutor", "vinos", "tragosClasicos", "sinAlcohol"]
    for (const section of requiredSections) {
      if (!newMenuData.hasOwnProperty(section)) {
        return NextResponse.json(
          { error: `Sección faltante: ${section}` },
          { status: 400 }
        )
      }
    }
    
    // Escribir los nuevos datos al archivo
    await fs.writeFile(MENU_FILE_PATH, JSON.stringify(newMenuData, null, 2), "utf8")
    
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
