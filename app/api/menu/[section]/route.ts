import { NextRequest, NextResponse } from "next/server"
import { validateAdminAuth } from "@/lib/auth"
import connectDB from "@/lib/db"
import Product from "@/models/Product"

// GET - Obtener una sección específica del menú
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ section: string }> }
) {
  const params = await props.params;
  try {
    await connectDB()
    const { section } = params

    // Intentar buscar por 'section' (ej: 'vinos', 'promociones')
    // Esto devolverá productos que tienen section='vinos', agrupados por categoryId
    const productsBySection = await Product.find({ section: section }).sort({ order: 1 }).lean()

    if (productsBySection.length > 0) {
      // Es una sección contenedora (como vinos), devolver objeto agrupado
      const grouped: any = {}
      productsBySection.forEach((p: any) => {
        if (!grouped[p.categoryId]) grouped[p.categoryId] = []
        grouped[p.categoryId].push(p)
      })
      return NextResponse.json(grouped)
    }

    // Si no buscamos por section, buscar por 'categoryId' (ej: 'entradas')
    // Asumimos que son parte de la sección 'menu' o genérica
    const productsByCategory = await Product.find({ categoryId: section }).sort({ order: 1 }).lean()

    if (productsByCategory.length > 0) {
      // Es una categoría directa, devolver array
      return NextResponse.json(productsByCategory)
    }

    // Si no hay nada, 404
    return NextResponse.json(
      { error: `Sección/Categoría no encontrada: ${section}` },
      { status: 404 }
    )

  } catch (error) {
    console.error("Error reading menu section from DB:", error)
    return NextResponse.json(
      { error: "Error al leer la sección del menú" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar o crear una sección específica del menú
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ section: string }> }
) {
  const params = await props.params;
  try {
    const { authorized, errorResponse } = validateAdminAuth(request as any)
    if (!authorized) return errorResponse

    const sectionData = await request.json()
    const { section } = params

    await connectDB()

    // sectionData puede ser:
    // 1. Array de productos (si section es 'entradas')
    // 2. Objeto con arrays (si section es 'vinos')

    const bulkOps: any[] = []

    // Helper
    const createOps = (items: any[], catId: string, secName: string) => {
      items.forEach((item, idx) => {
        const itemId = item.id || `${catId}-${idx}-${Date.now()}`

        // INTEGRITY: Only include content fields — never overwrite hidden/deletedAt state
        const contentFields: any = {
          name: item.name,
          description: item.description,
          price: item.price,
          categoryId: catId,
          section: secName,
          image: item.image,
          ingredients: item.ingredients,
          tags: item.tags,
          // INTEGRITY FIX: order — use item.order if explicitly provided.
          // If not, DO NOT overwrite existing order (partial PUT must not reorder the whole category).
          // idx is only used as fallback when item.order is strictly undefined.
          ...(item.order !== undefined ? { order: item.order } : {})
        }

        // INTEGRITY: Only write hidden state if explicitly boolean
        if (typeof item.hidden === 'boolean') {
          contentFields.hidden = item.hidden
          if (item.hidden) {
            if (item.hiddenReason) contentFields.hiddenReason = item.hiddenReason
            if (item.hiddenBy) contentFields.hiddenBy = item.hiddenBy
          }
        }

        bulkOps.push({
          updateOne: {
            filter: { id: itemId },
            update: {
              $set: contentFields,
              // On insert only: initialize fields not already in $set
              // MongoDB rejects duplicate paths between $set and $setOnInsert
              $setOnInsert: {
                ...(item.order === undefined ? { order: idx } : {}),
                ...(typeof item.hidden !== 'boolean' ? { hidden: false } : {})
              }
            },
            upsert: true
          }
        })
      })
    }

    if (Array.isArray(sectionData)) {
      // Caso: Array directo (ej: PUT /api/menu/entradas)
      // Asumimos que la sección es 'menu' y la categoria es el param 'section'
      // O podemos intentar inferir. Para consistencia con migración:
      // Si la section es 'menu-principal' o similar, usamos eso.
      // Pero lo más probable es que 'section' del URL sea el categoryId.
      createOps(sectionData, section, 'menu')
    } else if (typeof sectionData === 'object' && sectionData !== null) {
      // Caso: Objeto agrupado (ej: PUT /api/menu/vinos)
      // section URL es la section DB. Keys del objeto son categoryIds.
      Object.entries(sectionData).forEach(([subCatId, items]) => {
        if (Array.isArray(items)) {
          createOps(items, subCatId, section)
        }
      })
    }

    if (bulkOps.length > 0) {
      await Product.bulkWrite(bulkOps)
    }

    return NextResponse.json({
      message: `Sección ${section} actualizada exitosamente en MongoDB`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error updating/creating menu section in DB:", error)
    return NextResponse.json(
      { error: "Error al actualizar/crear la sección del menú" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una sección completa del menú
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ section: string }> }
) {
  const params = await props.params;
  try {
    const { authorized, errorResponse } = validateAdminAuth(request as any)
    if (!authorized) return errorResponse

    const { section } = params

    await connectDB()

    // Intentar borrar por section (ej: borrar todos los vinos)
    const delBySection = await Product.deleteMany({ section: section })

    if (delBySection.deletedCount > 0) {
      return NextResponse.json({
        message: `Sección ${section} (Agrupador) eliminada. ${delBySection.deletedCount} productos borrados.`,
        timestamp: new Date().toISOString()
      })
    }

    // Si no, intentar por categoryId (ej: borrar entradas)
    const delByCat = await Product.deleteMany({ categoryId: section })

    if (delByCat.deletedCount > 0) {
      return NextResponse.json({
        message: `Categoría ${section} eliminada. ${delByCat.deletedCount} productos borrados.`,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json(
      { error: `Sección no encontrada: ${section}` },
      { status: 404 }
    )
  } catch (error) {
    console.error("Error deleting menu section in DB:", error)
    return NextResponse.json(
      { error: "Error al eliminar la sección del menú" },
      { status: 500 }
    )
  }
}
