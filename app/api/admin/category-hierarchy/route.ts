import { NextRequest, NextResponse } from "next/server"
import { validateAdminAuth } from "@/lib/auth"
import connectDB from "@/lib/db"
import Category from "@/models/Category"

// GET - Obtener la jerarquía completa
export async function GET() {
  try {
    await connectDB()

    // Obtener todas las categorías que son subcategorías
    const subcats = await Category.find({
      parentCategory: { $exists: true, $ne: null }
    }).lean()

    // Construir la jerarquía
    const hierarchy: any = {}
    subcats.forEach((cat: any) => {
      hierarchy[cat.id] = {
        parent: cat.parentCategory,
        level: 1, // Por ahora backend flat level 1
        type: "category"
      }
    })

    const response = NextResponse.json(hierarchy)
    response.headers.set('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=10')

    return response
  } catch (error) {
    console.error("Error reading category hierarchy from DB:", error)
    return NextResponse.json({})
  }
}

// POST - Agregar o actualizar una subcategoría
export async function POST(request: NextRequest) {
  try {
    const { authorized, errorResponse } = validateAdminAuth(request)
    if (!authorized) return errorResponse

    const body = await request.json()
    const { subcategoryId, parentId, level, type } = body

    if (!subcategoryId || !parentId) {
      return NextResponse.json(
        { error: "subcategoryId y parentId son requeridos" },
        { status: 400 }
      )
    }

    await connectDB()

    console.log(`[category-hierarchy POST] Procesando: subcategoryId=${subcategoryId}, parentId=${parentId}`)

    // Buscar o crear la categoría
    let category = await Category.findOne({ id: subcategoryId })

    if (!category) {
      // Si no existe, crearla primero
      console.log(`[category-hierarchy POST] Categoría ${subcategoryId} no existe, creando...`)
      category = await Category.create({
        id: subcategoryId,
        name: subcategoryId.split('-').map((word: string) =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        isSubcategory: true,
        parentCategory: parentId
      })
      console.log(`[category-hierarchy POST] Categoría ${subcategoryId} creada exitosamente`)
    } else {
      // Si existe, actualizar el padre
      category = await Category.findOneAndUpdate(
        { id: subcategoryId },
        {
          $set: {
            parentCategory: parentId,
            isSubcategory: true
          }
        },
        { new: true }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Subcategoría agregada correctamente en MongoDB"
    })
  } catch (error) {
    console.error("Error adding subcategory to DB:", error)
    return NextResponse.json(
      { error: "Error al agregar subcategoría" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una subcategoría de la jerarquía
export async function DELETE(request: NextRequest) {
  try {
    const { authorized, errorResponse } = validateAdminAuth(request)
    if (!authorized) return errorResponse

    const { searchParams } = new URL(request.url)
    const subcategoryId = searchParams.get("id")

    if (!subcategoryId) {
      return NextResponse.json(
        { error: "subcategoryId es requerido" },
        { status: 400 }
      )
    }

    await connectDB()

    // Desvincular del padre
    await Category.findOneAndUpdate(
      { id: subcategoryId },
      {
        $unset: { parentCategory: "" },
        $set: { isSubcategory: false }
      }
    )

    return NextResponse.json({
      success: true,
      message: "Subcategoría eliminada correctamente de la jerarquía en MongoDB"
    })
  } catch (error) {
    console.error("Error deleting subcategory from hierarchy DB:", error)
    return NextResponse.json(
      { error: "Error al eliminar subcategoría" },
      { status: 500 }
    )
  }
}

