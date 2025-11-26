import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const MAPPING_FILE_PATH = path.join(process.cwd(), "data", "subcategory-mapping.json")

// GET - Obtener el mapeo de subcategorías
export async function GET() {
  try {
    const fileContents = await fs.readFile(MAPPING_FILE_PATH, "utf8")
    const mappingData = JSON.parse(fileContents)
    
    return NextResponse.json(mappingData)
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
