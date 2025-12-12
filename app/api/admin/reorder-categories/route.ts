import { NextRequest, NextResponse } from 'next/server'
import Category from '@/models/Category'
import connectDB from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { categories } = await request.json()

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { error: 'Se requiere un array de categorías' },
        { status: 400 }
      )
    }

    await connectDB()

    // Preparar operaciones bulk para actualizar el orden
    const bulkOps = categories.map((category: any, index: number) => ({
      updateOne: {
        filter: { id: category.id },
        update: {
          $set: {
            order: index + 1 // El orden viene del índice del array enviado
          }
        }
      }
    }))

    if (bulkOps.length > 0) {
      await Category.bulkWrite(bulkOps)
    }

    return NextResponse.json({
      success: true,
      message: 'Orden de categorías actualizado correctamente en MongoDB'
    })

  } catch (error) {
    console.error('Error al reordenar categorías en DB:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
