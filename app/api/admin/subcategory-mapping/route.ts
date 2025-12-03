import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { readJsonFileWithCache, fileCache } from "@/lib/cache"

const MAPPING_FILE_PATH = path.join(process.cwd(), "data", "subcategory-mapping.json")

// GET - Obtener el mapeo de subcategorías
// OPTIMIZACIÓN: Usa cache en memoria
export async function GET() {
  try {
    // OPTIMIZACIÓN: Usar cache en lugar de leer directamente
    const mappingData = await readJsonFileWithCache<any>(MAPPING_FILE_PATH, 5000)
    
    const response = NextResponse.json(mappingData)
    response.headers.set('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=10')
    
    return response
  } catch (error) {
    console.error("Error reading subcategory mapping:", error)
    // Si el archivo no existe, devolver un mapeo vacío
    return NextResponse.json({})
  }
}

// POST - Actualizar el mapeo de subcategorías
export async function POST(request: NextRequest) {
  try {
    const newMapping = await request.json()
    
    // Validar que sea un objeto
    if (typeof newMapping !== 'object' || newMapping === null) {
      return NextResponse.json(
        { error: "El mapeo debe ser un objeto válido" },
        { status: 400 }
      )
    }
    
    // Escribir el nuevo mapeo al archivo
    await fs.writeFile(MAPPING_FILE_PATH, JSON.stringify(newMapping, null, 2), "utf8")
    
    // OPTIMIZACIÓN: Invalidar cache después de escribir
    fileCache.invalidate(MAPPING_FILE_PATH)
    
    return NextResponse.json({ 
      message: "Mapeo de subcategorías actualizado exitosamente",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error updating subcategory mapping:", error)
    return NextResponse.json(
      { error: "Error al actualizar el mapeo de subcategorías" },
      { status: 500 }
    )
  }
}
