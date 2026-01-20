import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Category from "@/models/Category"
import { revalidatePath } from "next/cache"
import { SubcategoryReorderSchema } from "@/lib/validation/schemas"
import { handleApiError, validateRequestBody } from "@/lib/errorHandling"

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
    await connectDB()

    // SECURITY: Validate input with Zod (prevents NoSQL injection)
    const { categoryId, subcategoryOrder } = await validateRequestBody(request, SubcategoryReorderSchema)

    console.log('📋 Subcategory Reorder Request:', { categoryId, subcategoryOrder })

    // First, verify all subcategories exist
    console.log('🔍 Verifying subcategories exist in DB...')
    const verificationResults = []
    for (const subcatId of subcategoryOrder) {
      const found = await Category.findOne({ id: subcatId })
      if (!found) {
        console.error(`❌ Subcategory NOT FOUND in DB: ${subcatId}`)
        verificationResults.push({ id: subcatId, found: false })
      } else {
        console.log(`✅ Found: ${subcatId} -> ${found.name} (order: ${found.order}, parent: ${found.parentCategory})`)
        verificationResults.push({ id: subcatId, found: true, current: found })
      }
    }

    // Build bulk operations with direct id match only
    const bulkOps = subcategoryOrder.map((subcatId: string, index: number) => ({
      updateOne: {
        filter: { id: subcatId },
        update: {
          $set: {
            order: index,
            parentCategory: categoryId,
            isSubcategory: true
          }
        }
      }
    }))

    console.log('🔧 Executing bulkWrite with', bulkOps.length, 'operations')

    if (bulkOps.length > 0) {
      const result = await Category.bulkWrite(bulkOps)
      console.log('✅ BulkWrite completed:', {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount
      })

      // Verify the updates were applied
      console.log('🔍 Verifying updates were applied...')
      for (let i = 0; i < subcategoryOrder.length; i++) {
        const subcatId = subcategoryOrder[i]
        const updated = await Category.findOne({ id: subcatId })
        if (updated) {
          console.log(`📝 ${subcatId}: order=${updated.order} (expected ${i}), parent=${updated.parentCategory}`)
          if (updated.order !== i) {
            console.error(`❌ ORDER MISMATCH for ${subcatId}: got ${updated.order}, expected ${i}`)
          }
        }
      }

      if (result.matchedCount < subcategoryOrder.length) {
        console.error(`❌ Only matched ${result.matchedCount}/${subcategoryOrder.length} subcategories!`)
        return NextResponse.json(
          {
            error: `Solo se encontraron ${result.matchedCount} de ${subcategoryOrder.length} subcategorías`,
            details: verificationResults
          },
          { status: 400 }
        )
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
    return handleApiError(error, "Error al actualizar el orden de subcategorías")
  }
}

