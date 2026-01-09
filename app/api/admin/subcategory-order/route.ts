import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Category from "@/models/Category"
import { revalidatePath } from "next/cache"

export const dynamic = 'force-dynamic'

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
    response.headers.set('Cache-Control', 'no-store, max-age=0')

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

    console.log('📋 Subcategory Reorder Request:', { categoryId, subcategoryOrder })

    if (!categoryId || !Array.isArray(subcategoryOrder)) {
      console.log('❌ Invalid request: missing categoryId or subcategoryOrder is not array')
      return NextResponse.json(
        { error: "categoryId y subcategoryOrder (array) son requeridos" },
        { status: 400 }
      )
    }

    await connectDB()

    const bulkOps = subcategoryOrder.map((subcatId: string, index: number) => ({
      updateOne: {
        // Fallback: try to match by id OR by name (case-insensitive) to be extra robust
        filter: {
          $or: [
            { id: subcatId },
            { name: { $regex: new RegExp("^" + subcatId + "$", "i") } }
          ]
        },
        update: {
          $set: {
            order: index,
            parentCategory: categoryId,
            isSubcategory: true
          }
        }
      }
    }))

    console.log('🔧 Bulk operations to execute:', JSON.stringify(bulkOps, null, 2))

    if (bulkOps.length > 0) {
      const result = await Category.bulkWrite(bulkOps)
      console.log('✅ BulkWrite execution completed')
      console.log('📊 Result details:', {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount,
        insertedCount: result.insertedCount
      })

      if (result.matchedCount < subcategoryOrder.length) {
        console.warn(`⚠️ Warning: Only matched ${result.matchedCount} out of ${subcategoryOrder.length} subcategories.`)
        // Log which ones didn't match (simplified check)
        console.log('Requested IDs:', subcategoryOrder)
      }
    }

    // Invalidar cache para que /menu cargue el nuevo orden
    revalidatePath('/menu')
    revalidatePath('/api/admin/subcategory-order')

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

