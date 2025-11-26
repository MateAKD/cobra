import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const HIERARCHY_FILE_PATH = path.join(process.cwd(), "data", "category-hierarchy.json")
const MAPPING_FILE_PATH = path.join(process.cwd(), "data", "subcategory-mapping.json")

// GET - Obtener la jerarquía completa
export async function GET() {
  try {
    const fileContents = await fs.readFile(HIERARCHY_FILE_PATH, "utf8")
    const hierarchy = JSON.parse(fileContents)
    
    return NextResponse.json(hierarchy)
  } catch (error) {
    console.error("Error reading category hierarchy:", error)
    // Si el archivo no existe, intentar migrar desde el antiguo formato
    try {
      const oldMapping = await fs.readFile(MAPPING_FILE_PATH, "utf8")
      const mapping = JSON.parse(oldMapping)
      
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
    
    // Leer el archivo actual
    let hierarchy: any = {}
    try {
      const fileContents = await fs.readFile(HIERARCHY_FILE_PATH, "utf8")
      hierarchy = JSON.parse(fileContents)
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
    
    // Leer el archivo actual
    const fileContents = await fs.readFile(HIERARCHY_FILE_PATH, "utf8")
    const hierarchy = JSON.parse(fileContents)
    
    // Eliminar la subcategoría
    delete hierarchy[subcategoryId]
    
    // Guardar de vuelta al archivo
    await fs.writeFile(
      HIERARCHY_FILE_PATH,
      JSON.stringify(hierarchy, null, 2),
      "utf8"
    )
    
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

