import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Category from "@/models/Category"

// POST - Mantenimiento: Asegurar integridad de categorías/subcategorías
export async function POST() {
  try {
    await connectDB()

    // Con MongoDB y el esquema definido, la limpieza de archivos ya no es necesaria.
    // En su lugar, podemos verificar que todas las subcategorías tengan el flag isSubcategory correcto.

    // 1. Buscar todas las categorías que tienen un padre
    const subcats = await Category.find({ parentCategory: { $exists: true, $ne: null } })

    // 2. Asegurar que tengan isSubcategory: true
    if (subcats.length > 0) {
      await Category.updateMany(
        { parentCategory: { $exists: true, $ne: null } },
        { $set: { isSubcategory: true } }
      )
    }

    // 3. Buscar categorías normales y asegurar que tengan isSubcategory: false (si no tienen parent)
    await Category.updateMany(
      { $or: [{ parentCategory: { $exists: false } }, { parentCategory: null }] },
      { $set: { isSubcategory: false } }
    )

    return NextResponse.json({
      success: true,
      message: "Integridad de categorías verificada en MongoDB",
    })
  } catch (error) {
    console.error("Error cleaning/verifying categories:", error)
    return NextResponse.json(
      { error: "Error de mantenimiento" },
      { status: 500 }
    )
  }
}

