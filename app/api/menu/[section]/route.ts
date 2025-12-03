import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { readJsonFileWithCache, fileCache } from "@/lib/cache"

const MENU_FILE_PATH = path.join(process.cwd(), "data", "menu.json")

// GET - Obtener una sección específica del menú
// OPTIMIZACIÓN: Usa cache en memoria
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    // OPTIMIZACIÓN: Usar cache en lugar de leer directamente
    const menuData = await readJsonFileWithCache<any>(MENU_FILE_PATH, 5000)
    const { section } = await params
    
    if (!menuData[section]) {
      return NextResponse.json(
        { error: `Sección no encontrada: ${section}` },
        { status: 404 }
      )
    }
    
    const response = NextResponse.json(menuData[section])
    response.headers.set('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=10')
    
    return response
  } catch (error) {
    console.error("Error reading menu section:", error)
    return NextResponse.json(
      { error: "Error al leer la sección del menú" },
      { status: 500 }
    )
  }
}



// PUT - Actualizar o crear una sección específica del menú
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const sectionData = await request.json()
    const { section } = await params
    
    // OPTIMIZACIÓN: Leer datos actuales usando cache
    const menuData = await readJsonFileWithCache<any>(MENU_FILE_PATH, 5000)
    
    // Crear o actualizar la sección (no verificar si existe)
    menuData[section] = sectionData
    
    // Escribir los datos actualizados
    await fs.writeFile(MENU_FILE_PATH, JSON.stringify(menuData, null, 2), "utf8")
    
    // OPTIMIZACIÓN: Invalidar cache después de escribir
    fileCache.invalidate(MENU_FILE_PATH)
    
    return NextResponse.json({ 
      message: `Sección ${section} ${menuData.hasOwnProperty(section) ? 'actualizada' : 'creada'} exitosamente`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error updating/creating menu section:", error)
    return NextResponse.json(
      { error: "Error al actualizar/crear la sección del menú" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una sección completa del menú
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const { section } = await params
    
    // OPTIMIZACIÓN: Leer datos actuales usando cache
    const menuData = await readJsonFileWithCache<any>(MENU_FILE_PATH, 5000)
    
    if (!menuData.hasOwnProperty(section)) {
      return NextResponse.json(
        { error: `Sección no encontrada: ${section}` },
        { status: 404 }
      )
    }
    
    // Eliminar la sección completa
    delete menuData[section]
    
    // Escribir los datos actualizados
    await fs.writeFile(MENU_FILE_PATH, JSON.stringify(menuData, null, 2), "utf8")
    
    // OPTIMIZACIÓN: Invalidar cache después de escribir
    fileCache.invalidate(MENU_FILE_PATH)
    
    return NextResponse.json({ 
      message: `Sección ${section} eliminada exitosamente`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error deleting menu section:", error)
    return NextResponse.json(
      { error: "Error al eliminar la sección del menú" },
      { status: 500 }
    )
  }
}
