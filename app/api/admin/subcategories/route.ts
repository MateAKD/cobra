import { NextRequest, NextResponse } from "next/server"
import { validateAdminAuth } from "@/lib/auth"
import connectDB from "@/lib/db"
import Category from "@/models/Category"
import { revalidatePath } from "next/cache"

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/subcategories
 * Devuelve en una sola respuesta:
 *   - mapping: { childId: parentId }           (antes: /api/admin/subcategory-mapping)
 *   - hierarchy: { childId: { parent, level } } (antes: /api/admin/category-hierarchy)
 *   - order: { parentId: [childId, ...] }       (antes: /api/admin/subcategory-order)
 */
export async function GET() {
    try {
        await connectDB()

        const subCategories = await Category.find({
            parentCategory: { $exists: true, $ne: null }
        }).sort({ order: 1 }).lean()

        // Mapeo plano: { childId: parentId }
        const mapping: Record<string, string> = {}

        // Jerarquía completa: { childId: { parent, level, type } }
        const hierarchy: Record<string, { parent: string; level: number; type: string }> = {}

        // Orden por padre: { parentId: [childId1, childId2] }
        const order: Record<string, string[]> = {}

        subCategories.forEach((cat: any) => {
            if (!cat.parentCategory) return

            // mapping
            mapping[cat.id] = cat.parentCategory

            // hierarchy
            hierarchy[cat.id] = {
                parent: cat.parentCategory,
                level: 1,
                type: "category"
            }

            // order
            if (!order[cat.parentCategory]) {
                order[cat.parentCategory] = []
            }
            order[cat.parentCategory].push(cat.id)
        })

        const response = NextResponse.json({ mapping, hierarchy, order })
        response.headers.set('Cache-Control', 'no-store, max-age=0')
        return response

    } catch (error) {
        console.error("Error reading subcategory data:", error)
        return NextResponse.json({ mapping: {}, hierarchy: {}, order: {} })
    }
}

/**
 * POST /api/admin/subcategories
 * Crea o actualiza relaciones de subcategorías.
 *
 * Body opción A — subcategoryId + parentId (agregar/mover una sola):
 *   { subcategoryId: string, parentId: string }
 *
 * Body opción B — mapping completo (snapshot):
 *   { mapping: { childId: parentId, ... } }
 *
 * Body opción C — reordenar hijos de un padre:
 *   { categoryId: string, subcategoryOrder: string[] }
 */
export async function POST(request: NextRequest) {
    try {
        const { authorized, errorResponse } = validateAdminAuth(request)
        if (!authorized) return errorResponse

        await connectDB()
        const body = await request.json()

        // Opción C: reorder
        if (body.categoryId && Array.isArray(body.subcategoryOrder)) {
            const { categoryId, subcategoryOrder } = body

            if (!categoryId || subcategoryOrder.length === 0) {
                return NextResponse.json({ error: "categoryId y subcategoryOrder son requeridos" }, { status: 400 })
            }

            const bulkOps = subcategoryOrder.map((subcatId: string, index: number) => ({
                updateOne: {
                    filter: { id: subcatId },
                    update: { $set: { order: index, parentCategory: categoryId, isSubcategory: true } }
                }
            }))

            const result = await Category.bulkWrite(bulkOps)

            if (result.matchedCount < subcategoryOrder.length) {
                return NextResponse.json(
                    { error: `Solo se encontraron ${result.matchedCount} de ${subcategoryOrder.length} subcategorías` },
                    { status: 400 }
                )
            }

            revalidatePath('/menu')
            return NextResponse.json({ success: true, message: "Orden de subcategorías actualizado" })
        }

        // Opción B: mapping completo
        if (body.mapping && typeof body.mapping === 'object') {
            const { mapping } = body
            const bulkOps = Object.entries(mapping).map(([childId, parentId]) => ({
                updateOne: {
                    filter: { id: childId },
                    update: { $set: { parentCategory: parentId, isSubcategory: true } }
                }
            }))

            if (bulkOps.length > 0) {
                await Category.bulkWrite(bulkOps)
            }

            return NextResponse.json({ success: true, message: "Mapeo de subcategorías actualizado" })
        }

        // Opción A: una sola subcategoría
        const { subcategoryId, parentId, level = 1 } = body

        if (!subcategoryId || !parentId) {
            return NextResponse.json({ error: "subcategoryId y parentId son requeridos" }, { status: 400 })
        }

        let category = await Category.findOne({ id: subcategoryId })

        if (!category) {
            category = await Category.create({
                id: subcategoryId,
                name: subcategoryId.split('-').map((word: string) =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' '),
                isSubcategory: true,
                parentCategory: parentId
            })
        } else {
            category = await Category.findOneAndUpdate(
                { id: subcategoryId },
                { $set: { parentCategory: parentId, isSubcategory: true } },
                { new: true }
            )
        }

        return NextResponse.json({ success: true, message: "Subcategoría actualizada correctamente" })

    } catch (error) {
        console.error("Error updating subcategory:", error)
        return NextResponse.json({ error: "Error al actualizar subcategoría" }, { status: 500 })
    }
}

/**
 * DELETE /api/admin/subcategories?id=subcategoryId
 * Desvincula una subcategoría de su padre (la convierte en categoría raíz)
 */
export async function DELETE(request: NextRequest) {
    try {
        const { authorized, errorResponse } = validateAdminAuth(request)
        if (!authorized) return errorResponse

        const { searchParams } = new URL(request.url)
        const subcategoryId = searchParams.get("id")

        if (!subcategoryId) {
            return NextResponse.json({ error: "subcategoryId es requerido" }, { status: 400 })
        }

        await connectDB()

        await Category.findOneAndUpdate(
            { id: subcategoryId },
            { $unset: { parentCategory: "" }, $set: { isSubcategory: false } }
        )

        return NextResponse.json({ success: true, message: "Subcategoría desvinculada correctamente" })

    } catch (error) {
        console.error("Error deleting subcategory relation:", error)
        return NextResponse.json({ error: "Error al eliminar subcategoría" }, { status: 500 })
    }
}
