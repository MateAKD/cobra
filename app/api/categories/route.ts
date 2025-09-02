import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const categoriesFilePath = path.join(process.cwd(), 'data', 'categories.json')

// GET - Obtener todas las categorías
export async function GET() {
  try {
    if (!fs.existsSync(categoriesFilePath)) {
      return NextResponse.json({ error: 'Archivo de categorías no encontrado' }, { status: 404 })
    }

    const categoriesData = fs.readFileSync(categoriesFilePath, 'utf-8')
    const categories = JSON.parse(categoriesData)
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error reading categories:', error)
    return NextResponse.json({ error: 'Error al leer las categorías' }, { status: 500 })
  }
}

// PUT - Actualizar categorías
export async function PUT(request: NextRequest) {
  try {
    const categories = await request.json()
    
    // Validar que categories sea un objeto
    if (typeof categories !== 'object' || categories === null) {
      return NextResponse.json({ error: 'Datos de categorías inválidos' }, { status: 400 })
    }

    // Escribir las categorías al archivo
    fs.writeFileSync(categoriesFilePath, JSON.stringify(categories, null, 2), 'utf-8')
    
    return NextResponse.json({ message: 'Categorías actualizadas exitosamente', categories })
  } catch (error) {
    console.error('Error updating categories:', error)
    return NextResponse.json({ error: 'Error al actualizar las categorías' }, { status: 500 })
  }
}
