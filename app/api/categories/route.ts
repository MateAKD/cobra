import { NextRequest, NextResponse } from 'next/server'
import { validateAdminAuth } from "@/lib/auth"
import Category, { ICategory } from '@/models/Category'
import connectDB from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { CategoryCreateSchema, CategoryBulkUpdateSchema } from '@/lib/validation/schemas'
import { handleApiError, validateRequestBody } from '@/lib/errorHandling'

// GET - Obtener todas las categorías para el Admin y el cliente
export async function GET() {
  try {
    await connectDB()

    // Obtener todas las categorías y ordenarlas por 'order'
    // .lean() convierte los documentos de Mongoose a objetos JS planos para mejor rendimiento
    const categories = await Category.find({}).sort({ order: 1 }).lean()

    // Asegurar que todas las categorías tengan el campo 'name' (requerido por tests)
    const validCategories = categories.map((category: any) => ({
      id: category.id,
      name: category.name || category.id, // Fallback: usar ID si no tiene nombre
      description: category.description || '',
      order: category.order || 0,
      timeRestricted: category.timeRestricted || false,
      startTime: category.startTime,
      endTime: category.endTime,
      visible: category.visible !== undefined ? category.visible : true,
      isSubcategory: category.isSubcategory || false,
      parentCategory: category.parentCategory,
      image: category.image
    }))

    // Headers para cache control (revalidación corta para actualizaciones rápidas)
    // CRITICAL FIX: Devolver array en lugar de objeto para cumplir con estándares REST
    const response = NextResponse.json(validCategories)
    response.headers.set('Cache-Control', 'public, s-maxage=1, stale-while-revalidate=5')

    return response
  } catch (error) {
    console.error('Error reading categories from DB:', error)
    return NextResponse.json({ error: 'Error al leer las categorías' }, { status: 500 })
  }
}

// POST - Crear una nueva categoría o subcategoría
export async function POST(request: NextRequest) {
  try {
    const { authorized, errorResponse } = validateAdminAuth(request as any)
    if (!authorized) return errorResponse

    await connectDB()

    // SECURITY: Validate input with Zod (prevents NoSQL injection, XSS)
    const categoryData = await validateRequestBody(request, CategoryCreateSchema)

    // Verificar si la categoría ya existe
    const existingCategory = await Category.findOne({ id: categoryData.id })
    if (existingCategory) {
      return NextResponse.json({ error: 'La categoría ya existe' }, { status: 409 })
    }

    // Crear la nueva categoría (datos ya validados por Zod)
    const newCategory = new Category(categoryData)
    await newCategory.save()

    // Force revalidation of menu and admin pages
    revalidatePath('/menu')
    revalidatePath('/admin')
    revalidatePath('/api/categories')

    return NextResponse.json({
      success: true,
      message: 'Categoría creada exitosamente',
      category: newCategory
    })
  } catch (error) {
    return handleApiError(error, 'POST /api/categories')
  }
}

// PUT - Actualizar categorías (usado para reordenar o editar)
export async function PUT(request: NextRequest) {
  try {
    const { authorized, errorResponse } = validateAdminAuth(request as any)
    if (!authorized) return errorResponse

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
        upsert: false // SECURITY: PUT solo actualiza, nunca crea. Usar POST para crear categorías nuevas.
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

