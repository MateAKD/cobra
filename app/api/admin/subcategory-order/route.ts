import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Category from "@/models/Category"

// GET - Obtener el orden de subcategorías
export async function GET() {
  try {
    await connectDB()

    // Obtener todas las subcategorías (tienen parentCategory)
    // Queremos construir un mapa: { "parentId": ["childId1", "childId2"] } ordenados
    const subCategories = await Category.find({
      parentCategory: { $exists: true, $ne: null }
    }).sort({ order: 1 }).lean()

    const subcategoryOrder: Record<string, string[]> = {}

    subCategories.forEach((cat: any) => {
      if (cat.parentCategory) {
        if (!subcategoryOrder[cat.parentCategory]) {
          subcategoryOrder[cat.parentCategory] = []
        }
        subcategoryOrder[cat.parentCategory].push(cat.id)
      }
    })

    const response = NextResponse.json(subcategoryOrder)
    response.headers.set('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=10')

    return response
  } catch (error) {
    console.error("Error reading subcategory order from DB:", error)
    return NextResponse.json({})
  }
}

// POST - Actualizar el orden de subcategorías
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoryId, subcategoryOrder } = body

    if (!categoryId || !Array.isArray(subcategoryOrder)) {
      return NextResponse.json(
        { error: "categoryId y subcategoryOrder (array) son requeridos" },
        { status: 400 }
      )
    }

    await connectDB()

    const bulkOps = subcategoryOrder.map((subcatId: string, index: number) => ({
      updateOne: {
        filter: { id: subcatId, parentCategory: categoryId }, // Ensure it belongs to the parent
        update: {
          $set: {
            order: index
          }
        }
      }
    }))

    if (bulkOps.length > 0) {
      await Category.bulkWrite(bulkOps)
    }

    return NextResponse.json({
      success: true,
      message: "Orden de subcategorías actualizado correctamente en MongoDB"
    })
  } catch (error) {
    console.error("Error updating subcategory order in DB:", error)
    return NextResponse.json(
      { error: "Error al actualizar el orden de subcategorías" },
      { status: 500 }
    )
  }
}

