import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { categories } = await request.json()
    
    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { error: 'Se requiere un array de categorías' },
        { status: 400 }
      )
    }

    // Leer el archivo de categorías actual
    const categoriesPath = path.join(process.cwd(), 'data', 'categories.json')
    const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'))
    
    // Crear un nuevo objeto preservando categorías existentes y actualizando solo el 'order'
    const reorderedCategories: { [key: string]: any } = { ...categoriesData }
    
    categories.forEach((category: any, index: number) => {
      if (reorderedCategories[category.id]) {
        // Actualizar el order de la categoría existente
        reorderedCategories[category.id] = {
          ...reorderedCategories[category.id],
          order: index + 1
        }
      } else {
        // Si la categoría no existe en categories.json, crearla
        reorderedCategories[category.id] = {
          name: category.name || category.id.split('-').map((word: string) => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          description: category.description || "",
          order: index + 1
        }
      }
    })
    
    // Escribir el archivo actualizado
    fs.writeFileSync(categoriesPath, JSON.stringify(reorderedCategories, null, 2))
    
    return NextResponse.json({ 
      success: true, 
      message: 'Orden de categorías actualizado correctamente' 
    })
    
  } catch (error) {
    console.error('Error al reordenar categorías:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
