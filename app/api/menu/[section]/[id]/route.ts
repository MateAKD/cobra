import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/models/Product"

// GET - Obtener un elemento específico
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ section: string; id: string }> }
) {
  const params = await props.params;
  try {
    // Nota: 'section' en params es menos relevante si buscamos por ID único,
    // pero podemos usarlo para validar si queremos ser estrictos.
    // Por flexibilidad, buscaremos por ID directamente.

    await connectDB()
    const { id } = params

    const item = await Product.findOne({ id: id }).lean()

    if (!item) {
      return NextResponse.json(
        { error: `Elemento no encontrado: ${id}` },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error reading menu item from DB:", error)
    return NextResponse.json(
      { error: "Error al leer el elemento del menú" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un elemento específico
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ section: string; id: string }> }
) {
  const params = await props.params;
  try {
    const updatedData = await request.json()
    const { id, section } = params // Section from URL

    await connectDB()

    const updatedItem = await Product.findOneAndUpdate(
      { id: id },
      {
        $set: {
          name: updatedData.name,
          description: updatedData.description,
          price: updatedData.price,
          // Si cambian la categoría/sección, actualizarla
          // Si no, mantener la que tiene o la del URL (si queremos forzar)
          // Asumimos que updatedData trae lo necesario, o hacemos merge.
          // Si updatedData no trae categoryId, cuidado.
          ...(updatedData.categoryId && { categoryId: updatedData.categoryId }),
          ...(updatedData.section && { section: updatedData.section }),
          image: updatedData.image,
          ingredients: updatedData.ingredients,
          glass: updatedData.glass,
          technique: updatedData.technique,
          garnish: updatedData.garnish,
          tags: updatedData.tags
        }
      },
      { new: true }
    )

    if (!updatedItem) {
      return NextResponse.json(
        { error: `Elemento no encontrado: ${id}` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: `Elemento ${id} actualizado exitosamente`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error updating menu item in DB:", error)
    return NextResponse.json(
      { error: "Error al actualizar el elemento del menú" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un elemento específico
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ section: string; id: string }> }
) {
  const params = await props.params;
  try {
    const { id } = params

    await connectDB()
    const deleted = await Product.findOneAndDelete({ id: id })

    if (!deleted) {
      return NextResponse.json(
        { error: `Elemento no encontrado: ${id}` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: `Elemento ${id} eliminado exitosamente`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error deleting menu item from DB:", error)
    return NextResponse.json(
      { error: "Error al eliminar el elemento del menú" },
      { status: 500 }
    )
  }
}

// POST - Agregar un nuevo elemento (solo si el id es "new")
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ section: string; id: string }> }
) {
  const params = await props.params;
  // Solo permitir POST si el id es "new"
  if (params.id !== "new") {
    return NextResponse.json(
      { error: "Método no permitido para este endpoint" },
      { status: 405 }
    )
  }
  try {
    const newItem = await request.json()
    const { section } = params // section from URL could be 'vinos' or 'entradas'
    // Pero 'vinos' es section DB, 'entradas' es categoryId DB.
    // Necesitamos desambiguar si el frontend no manda categoryId.

    await connectDB()

    // Generar ID
    const timestamp = Date.now()
    const generatedId = newItem.id || timestamp.toString()

    // Determinar section y categoryId
    let dbSection = 'menu'
    let dbCategoryId = section

    if (section.startsWith('vinos') || section === 'vinos') {
      dbSection = 'vinos'
      // Si section URL es 'vinos-tintos', categoryId es 'tintos'
      if (section.includes('-')) {
        dbCategoryId = section.split('-')[1]
      } else if (newItem.categoryId) {
        dbCategoryId = newItem.categoryId
      }
    } else if (section.startsWith('promociones')) {
      dbSection = 'promociones'
      if (section.includes('-')) {
        dbCategoryId = section.split('-')[1]
      }
    } else {
      // Asumimos genérico: URL param es categoryId, section es 'menu'
      // Salvo que venga en el body
      if (newItem.section) dbSection = newItem.section
    }

    const product = new Product({
      ...newItem,
      id: generatedId,
      section: dbSection,
      categoryId: newItem.categoryId || dbCategoryId,
      order: newItem.order || 999
    })

    await product.save()

    return NextResponse.json({
      message: `Elemento agregado exitosamente`,
      item: product,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error adding menu item to DB:", error)
    return NextResponse.json(
      { error: "Error al agregar el elemento del menú" },
      { status: 500 }
    )
  }
}
