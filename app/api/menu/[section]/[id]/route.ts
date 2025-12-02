import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const MENU_FILE_PATH = path.join(process.cwd(), "data", "menu.json")

// GET - Obtener un elemento específico
export async function GET(
  request: NextRequest,
  { params }: { params: { section: string; id: string } }
) {
  try {
    const fileContents = await fs.readFile(MENU_FILE_PATH, "utf8")
    const menuData = JSON.parse(fileContents)
    const { section, id } = params
    
    if (!menuData[section]) {
      return NextResponse.json(
        { error: `Sección no encontrada: ${section}` },
        { status: 404 }
      )
    }
    
    let item
    if (section === "vinos") {
      // Para vinos, buscar en subcategorías
      const [, subcategory] = section.split("-")
      if (subcategory && menuData.vinos[subcategory]) {
        item = menuData.vinos[subcategory].find((item: any) => item.id === id)
      }
    } else {
      item = menuData[section].find((item: any) => item.id === id)
    }
    
    if (!item) {
      return NextResponse.json(
        { error: `Elemento no encontrado: ${id}` },
        { status: 404 }
      )
    }
    
    return NextResponse.json(item)
  } catch (error) {
    console.error("Error reading menu item:", error)
    return NextResponse.json(
      { error: "Error al leer el elemento del menú" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un elemento específico
export async function PUT(
  request: NextRequest,
  { params }: { params: { section: string; id: string } }
) {
  try {
    const updatedItem = await request.json()
    const { section, id } = params
    
    // Leer datos actuales
    const fileContents = await fs.readFile(MENU_FILE_PATH, "utf8")
    const menuData = JSON.parse(fileContents)
    
    if (!menuData[section]) {
      return NextResponse.json(
        { error: `Sección no encontrada: ${section}` },
        { status: 404 }
      )
    }
    
    // Encontrar y actualizar el elemento
    let found = false
    if (section.startsWith("vinos-")) {
      // Para vinos, buscar en subcategorías
      const subcategory = section.split("-")[1]
      if (subcategory && menuData.vinos[subcategory]) {
        const index = menuData.vinos[subcategory].findIndex((item: any) => item.id === id)
        if (index !== -1) {
          menuData.vinos[subcategory][index] = updatedItem
          found = true
        }
      }
    } else {
      if (menuData[section]) {
        const index = menuData[section].findIndex((item: any) => item.id === id)
        if (index !== -1) {
          menuData[section][index] = updatedItem
          found = true
        }
      }
    }
    
    if (!found) {
      return NextResponse.json(
        { error: `Elemento no encontrado: ${id}` },
        { status: 404 }
      )
    }
    
    // Escribir los datos actualizados
    await fs.writeFile(MENU_FILE_PATH, JSON.stringify(menuData, null, 2), "utf8")
    
    return NextResponse.json({ 
      message: `Elemento ${id} actualizado exitosamente`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error updating menu item:", error)
    return NextResponse.json(
      { error: "Error al actualizar el elemento del menú" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un elemento específico
export async function DELETE(
  request: NextRequest,
  { params }: { params: { section: string; id: string } }
) {
  try {
    const { section, id } = params
    
    // Leer datos actuales
    const fileContents = await fs.readFile(MENU_FILE_PATH, "utf8")
    const menuData = JSON.parse(fileContents)
    
    if (!menuData[section]) {
      return NextResponse.json(
        { error: `Sección no encontrada: ${section}` },
        { status: 404 }
      )
    }
    
    // Encontrar y eliminar el elemento
    let found = false
    if (section.startsWith("vinos-")) {
      // Para vinos, buscar en subcategorías
      const subcategory = section.split("-")[1]
      if (subcategory && menuData.vinos[subcategory]) {
        const index = menuData.vinos[subcategory].findIndex((item: any) => item.id === id)
        if (index !== -1) {
          menuData.vinos[subcategory].splice(index, 1)
          found = true
        }
      }
    } else {
      if (menuData[section]) {
        const index = menuData[section].findIndex((item: any) => item.id === id)
        if (index !== -1) {
          menuData[section].splice(index, 1)
          found = true
        }
      }
    }
    
    if (!found) {
      return NextResponse.json(
        { error: `Elemento no encontrado: ${id}` },
        { status: 404 }
      )
    }
    
    // Escribir los datos actualizados
    await fs.writeFile(MENU_FILE_PATH, JSON.stringify(menuData, null, 2), "utf8")
    
    return NextResponse.json({ 
      message: `Elemento ${id} eliminado exitosamente`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error deleting menu item:", error)
    return NextResponse.json(
      { error: "Error al eliminar el elemento del menú" },
      { status: 500 }
    )
  }
}

// POST - Agregar un nuevo elemento (solo si el id es "new")
export async function POST(
  request: NextRequest,
  { params }: { params: { section: string; id: string } }
) {
      // Solo permitir POST si el id es "new"
    if (params.id !== "new") {
      return NextResponse.json(
        { error: "Método no permitido para este endpoint" },
        { status: 405 }
      )
    }
    try {
      const newItem = await request.json()
      const { section } = params
      
      // Leer datos actuales
      const fileContents = await fs.readFile(MENU_FILE_PATH, "utf8")
      const menuData = JSON.parse(fileContents)
      
      // Generar un nuevo ID
      const timestamp = Date.now()
      newItem.id = timestamp.toString()
      
      // Agregar el nuevo elemento
      if (section.startsWith("vinos-")) {
        // Para vinos, agregar a subcategoría
        const subcategory = section.split("-")[1]
        if (subcategory && menuData.vinos && menuData.vinos[subcategory]) {
          menuData.vinos[subcategory].push(newItem)
        } else {
          return NextResponse.json(
            { error: `Subcategoría de vinos no encontrada: ${subcategory}` },
            { status: 404 }
          )
        }
      } else if (section.startsWith("promociones-")) {
        // Para promociones, agregar a subcategoría
        const subcategory = section.split("-")[1]
        if (subcategory && menuData.promociones && menuData.promociones[subcategory]) {
          menuData.promociones[subcategory].push(newItem)
        } else {
          return NextResponse.json(
            { error: `Subcategoría de promociones no encontrada: ${subcategory}` },
            { status: 404 }
          )
        }
      } else {
        // Para secciones normales o categorías personalizadas
        if (!menuData[section]) {
          // Si la sección no existe, crearla como un array vacío
          menuData[section] = []
        }
        
        // Verificar que la sección sea un array
        if (!Array.isArray(menuData[section])) {
          menuData[section] = []
        }
        
        menuData[section].push(newItem)
      }
      
      // Escribir los datos actualizados
      await fs.writeFile(MENU_FILE_PATH, JSON.stringify(menuData, null, 2), "utf8")
      
      return NextResponse.json({ 
        message: `Elemento agregado exitosamente`,
        item: newItem,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error("Error adding menu item:", error)
      return NextResponse.json(
        { error: "Error al agregar el elemento del menú" },
        { status: 500 }
      )
    }
}
