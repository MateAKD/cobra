import { NextRequest, NextResponse } from 'next/server'
import Category, { ICategory } from '@/models/Category'
import connectDB from '@/lib/db'
import { revalidatePath } from 'next/cache'

// GET - Obtener todas las categorías para el Admin y el cliente
export async function GET() {
  try {
    await connectDB()

    // Obtener todas las categorías y ordenarlas por 'order'
    // .lean() convierte los documentos de Mongoose a objetos JS planos para mejor rendimiento
    const categories = await Category.find({}).sort({ order: 1 }).lean()

    // Transformar el array de vuelta a un objeto mapeado por ID
    // para mantener compatibilidad con el frontend existente que espera Record<string, Category>
    const categoriesMap = categories.reduce((acc, category) => {
      acc[category.id] = category
      return acc
    }, {} as Record<string, any>)

    // Headers para cache control (revalidación corta para actualizaciones rápidas)
    const response = NextResponse.json(categoriesMap)
    response.headers.set('Cache-Control', 'public, s-maxage=1, stale-while-revalidate=5')

    return response
  } catch (error) {
    console.error('Error reading categories from DB:', error)
    return NextResponse.json({ error: 'Error al leer las categorías' }, { status: 500 })
  }
}

// PUT - Actualizar categorías (usado para reordenar o editar)
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const updates = await request.json()

    // Validar payload
    if (typeof updates !== 'object' || updates === null) {
      return NextResponse.json({ error: 'Datos de categorías inválidos' }, { status: 400 })
    }

    // Preparar operaciones bulk para actualizar múltiples categorías eficientemente
    const bulkOps = Object.entries(updates).map(([id, data]: [string, any]) => ({
      updateOne: {
        filter: { id: id },
        update: {
          $set: {
            name: data.name,
            description: data.description,
            order: data.order,
            timeRestricted: data.timeRestricted,
            startTime: data.startTime,
            endTime: data.endTime,
            visible: data.visible !== undefined ? data.visible : true
            // No actualizamos campos estructurales críticos automáticamente para evitar corrupción
          }
        },
        upsert: true // Si no existe, crearla (útil para nuevas categorías)
      }
    }))

    if (bulkOps.length > 0) {
      await Category.bulkWrite(bulkOps)
    }

    // Force revalidation of menu and admin pages
    revalidatePath('/menu')
    revalidatePath('/admin')
    revalidatePath('/api/categories')

    return NextResponse.json({ message: 'Categorías actualizadas exitosamente con MongoDB' })
  } catch (error) {
    console.error('Error updating categories in DB:', error)
    return NextResponse.json({ error: 'Error al actualizar las categorías' }, { status: 500 })
  }
}

