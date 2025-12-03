import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { readJsonFileWithCache, fileCache } from "@/lib/cache"

const HIERARCHY_FILE_PATH = path.join(process.cwd(), "data", "category-hierarchy.json")
const MAPPING_FILE_PATH = path.join(process.cwd(), "data", "subcategory-mapping.json")

// GET - Obtener la jerarquía completa
// OPTIMIZACIÓN: Usa cache en memoria
export async function GET() {
  try {
    // OPTIMIZACIÓN: Usar cache en lugar de leer directamente
    const hierarchy = await readJsonFileWithCache<any>(HIERARCHY_FILE_PATH, 5000)
    
    const response = NextResponse.json(hierarchy)
    response.headers.set('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=10')
    
    return response
  } catch (error) {
    console.error("Error reading category hierarchy:", error)
    // Si el archivo no existe, intentar migrar desde el antiguo formato
    try {
      const mapping = await readJsonFileWithCache<Record<string, string>>(MAPPING_FILE_PATH, 5000)
      
      // Convertir al nuevo formato
      const hierarchy: any = {}
      Object.entries(mapping).forEach(([subcatId, parentId]) => {
        hierarchy[subcatId] = {
          parent: parentId,
          level: 1,
          type: "category"
        }
      })
      
      // Guardar el nuevo formato
      await fs.writeFile(
        HIERARCHY_FILE_PATH,
        JSON.stringify(hierarchy, null, 2),
        "utf8"
      )
      
      // Invalidar cache después de escribir
      fileCache.invalidate(HIERARCHY_FILE_PATH)
      
      return NextResponse.json(hierarchy)
    } catch (migrationError) {
      console.error("Error migrating to new format:", migrationError)
      return NextResponse.json({})
    }
  }
}

// POST - Agregar o actualizar una subcategoría
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subcategoryId, parentId, level, type } = body
    
    if (!subcategoryId || !parentId) {
      return NextResponse.json(
        { error: "subcategoryId y parentId son requeridos" },
        { status: 400 }
      )
    }
    
    // OPTIMIZACIÓN: Leer el archivo actual usando cache
    let hierarchy: any = {}
    try {
      hierarchy = await readJsonFileWithCache<any>(HIERARCHY_FILE_PATH, 5000)
    } catch (error) {
      console.log("Creating new category-hierarchy.json file")
    }
    
    // Agregar o actualizar la subcategoría
    hierarchy[subcategoryId] = {
      parent: parentId,
      level: level || 1,
      type: type || "category"
    }
    
    // Guardar de vuelta al archivo
    await fs.writeFile(
      HIERARCHY_FILE_PATH,
      JSON.stringify(hierarchy, null, 2),
      "utf8"
    )
    
    // OPTIMIZACIÓN: Invalidar cache después de escribir
    fileCache.invalidate(HIERARCHY_FILE_PATH)
    
    // NO sincronizar hacia subcategory-mapping.json porque eso destruye la información de niveles
    // El archivo subcategory-mapping.json se mantiene separado y se actualiza solo cuando es necesario
    
    return NextResponse.json({ 
      success: true, 
      message: "Subcategoría agregada correctamente" 
    })
  } catch (error) {
    console.error("Error adding subcategory:", error)
    return NextResponse.json(
      { error: "Error al agregar subcategoría" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una subcategoría de la jerarquía
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subcategoryId = searchParams.get("id")
    
    if (!subcategoryId) {
      return NextResponse.json(
        { error: "subcategoryId es requerido" },
        { status: 400 }
      )
    }
    
    // OPTIMIZACIÓN: Leer el archivo actual usando cache
    const hierarchy = await readJsonFileWithCache<any>(HIERARCHY_FILE_PATH, 5000)
    
    // Eliminar la subcategoría
    delete hierarchy[subcategoryId]
    
    // Guardar de vuelta al archivo
    await fs.writeFile(
      HIERARCHY_FILE_PATH,
      JSON.stringify(hierarchy, null, 2),
      "utf8"
    )
    
    // OPTIMIZACIÓN: Invalidar cache después de escribir
    fileCache.invalidate(HIERARCHY_FILE_PATH)
    
    // NO sincronizar hacia subcategory-mapping.json porque eso destruye la información de niveles
    // El archivo subcategory-mapping.json se mantiene separado
    
    return NextResponse.json({ 
      success: true, 
      message: "Subcategoría eliminada correctamente" 
    })
  } catch (error) {
    console.error("Error deleting subcategory:", error)
    return NextResponse.json(
      { error: "Error al eliminar subcategoría" },
      { status: 500 }
    )
  }
}

