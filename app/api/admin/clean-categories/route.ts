import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const CATEGORIES_FILE_PATH = path.join(process.cwd(), "data", "categories.json")
const MAPPING_FILE_PATH = path.join(process.cwd(), "data", "subcategory-mapping.json")

// POST - Limpiar categories.json de subcategorías
export async function POST() {
  try {
    // Leer categories.json
    const categoriesData = await fs.readFile(CATEGORIES_FILE_PATH, "utf8")
    const categories = JSON.parse(categoriesData)
    
    // Leer subcategory-mapping.json
    let subcategoryMapping: Record<string, string> = {}
    try {
      const mappingData = await fs.readFile(MAPPING_FILE_PATH, "utf8")
      subcategoryMapping = JSON.parse(mappingData)
    } catch (error) {
      console.warn("No se pudo leer subcategory-mapping.json:", error)
    }
    
    // Filtrar subcategorías
    const cleanedCategories: any = {}
    const removedCategories: string[] = []
    
    Object.keys(categories).forEach(key => {
      if (subcategoryMapping[key]) {
        // Es una subcategoría, no incluirla
        removedCategories.push(key)
      } else {
        // Es una categoría válida, incluirla
        cleanedCategories[key] = categories[key]
      }
    })
    
    // Guardar categories.json limpio
    await fs.writeFile(
      CATEGORIES_FILE_PATH,
      JSON.stringify(cleanedCategories, null, 2),
      "utf8"
    )
    
    return NextResponse.json({
      success: true,
      message: "Categorías limpiadas exitosamente",
      removed: removedCategories,
      kept: Object.keys(cleanedCategories)
    })
  } catch (error) {
    console.error("Error cleaning categories:", error)
    return NextResponse.json(
      { error: "Error al limpiar categorías" },
      { status: 500 }
    )
  }
}

