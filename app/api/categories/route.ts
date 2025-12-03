import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { readJsonFileWithCache, fileCache } from '@/lib/cache'

const categoriesFilePath = path.join(process.cwd(), 'data', 'categories.json')

// GET - Obtener todas las categorías
// OPTIMIZACIÓN: Convertido de síncrono a asíncrono con cache
export async function GET() {
  try {
    // OPTIMIZACIÓN: Usar cache en memoria (5 segundos)
    const categories = await readJsonFileWithCache<Record<string, any>>(categoriesFilePath, 5000)
    
    // Convertir a array, ordenar por 'order' y volver a convertir a objeto
    // OPTIMIZACIÓN: Esta operación es rápida, pero podría cachearse si fuera más costosa
    const sortedCategories = Object.entries(categories)
      .sort(([, a], [, b]) => ((a as any).order || 0) - ((b as any).order || 0))
      .reduce((acc, [key, value]) => {
        acc[key] = value
        return acc
      }, {} as any)
    
    // Headers de cache HTTP
    const response = NextResponse.json(sortedCategories)
    response.headers.set('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=10')
    
    return response
  } catch (error) {
    console.error('Error reading categories:', error)
    return NextResponse.json({ error: 'Error al leer las categorías' }, { status: 500 })
  }
}

// PUT - Actualizar categorías
// OPTIMIZACIÓN: Convertido de síncrono a asíncrono con cache
export async function PUT(request: NextRequest) {
  try {
    const categories = await request.json()
    
    // Validar que categories sea un objeto
    if (typeof categories !== 'object' || categories === null) {
      return NextResponse.json({ error: 'Datos de categorías inválidos' }, { status: 400 })
    }

    // PROTECCIÓN: Filtrar subcategorías antes de guardar
    // Leer el mapeo de subcategorías para excluirlas
    const subcategoryMappingPath = path.join(process.cwd(), 'data', 'subcategory-mapping.json')
    let subcategoryMapping: Record<string, string> = {}
    
    try {
      // OPTIMIZACIÓN: Usar cache en lugar de existsSync + readFileSync
      subcategoryMapping = await readJsonFileWithCache<Record<string, string>>(
        subcategoryMappingPath,
        5000
      )
    } catch (error) {
      // Si el archivo no existe, continuar con mapeo vacío
      console.warn('Error leyendo subcategory-mapping.json:', error)
    }
    
    // Filtrar: remover cualquier categoría que esté en subcategoryMapping (es una subcategoría)
    const filteredCategories: any = {}
    Object.keys(categories).forEach(key => {
      // Solo incluir si NO es una subcategoría
      if (!subcategoryMapping[key]) {
        filteredCategories[key] = categories[key]
      } else {
        console.warn(`⚠️ Prevenido: Se intentó agregar la subcategoría "${key}" a categories.json. Fue filtrada automáticamente.`)
      }
    })

    // OPTIMIZACIÓN: Escribir de forma asíncrona
    await fs.writeFile(categoriesFilePath, JSON.stringify(filteredCategories, null, 2), 'utf-8')
    
    // OPTIMIZACIÓN: Invalidar cache después de escribir
    fileCache.invalidate(categoriesFilePath)
    
    return NextResponse.json({ message: 'Categorías actualizadas exitosamente', categories: filteredCategories })
  } catch (error) {
    console.error('Error updating categories:', error)
    return NextResponse.json({ error: 'Error al actualizar las categorías' }, { status: 500 })
  }
}
