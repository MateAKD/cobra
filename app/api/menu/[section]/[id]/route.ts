import { NextRequest, NextResponse } from "next/server"
import { validateAdminAuth } from "@/lib/auth"
import connectDB from "@/lib/db"
import Product from "@/models/Product"
import AuditLog from "@/models/AuditLog"
import { ProductUpdateSchema } from "@/lib/validation/schemas"
import { handleApiError, validateRequestBody } from "@/lib/errorHandling"

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
  console.log(`[API_DEBUG] PUT Request received. Params:`, params);

  try {
    const { authorized, errorResponse } = validateAdminAuth(request as any)
    if (!authorized) {
      console.log(`[API_DEBUG] Auth failed`);
      return errorResponse
    }

    await connectDB()
    console.log(`[API_DEBUG] DB Connected`);

    const bodyText = await request.text();
    console.log(`[API_DEBUG] Raw Body:`, bodyText);

    let bodyJson;
    try {
      bodyJson = JSON.parse(bodyText);
    } catch (e) {
      console.error(`[API_DEBUG] JSON parse error:`, e);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // SECURITY: Validate input with Zod
    console.log(`[API_DEBUG] Validating schema...`);
    const updatedData = ProductUpdateSchema.parse(bodyJson);
    console.log(`[API_DEBUG] Schema valid.`);

    const { id, section } = params // Section from URL

    // Get current product for audit logging
    const currentProduct = await Product.findOne({ id: id }).lean()

    if (!currentProduct) {
      return NextResponse.json(
        { error: `Elemento no encontrado: ${id}` },
        { status: 404 }
      )
    }

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
          tags: updatedData.tags,
          ...(updatedData.hidden !== undefined && { hidden: updatedData.hidden }),
          ...(updatedData.hiddenReason && { hiddenReason: updatedData.hiddenReason }),
        }
      },
      { new: true }
    )

    // Audit logging: Track changes
    const changes: { field: string; oldValue: any; newValue: any }[] = []

    // Track important field changes
    const fieldsToTrack = ['price', 'name', 'description', 'hidden', 'categoryId', 'section']
    fieldsToTrack.forEach(field => {
      const currentValue = (currentProduct as any)[field]
      const newValue = (updatedData as any)[field]
      if (newValue !== undefined && currentValue !== newValue) {
        changes.push({
          field,
          oldValue: currentValue,
          newValue: newValue
        })
      }
    })

    // Log changes if any
    if (changes.length > 0) {
      try {
        await AuditLog.create({
          entityType: 'product',
          entityId: id,
          action: 'update',
          changes,
          performedBy: 'admin', // TODO: Get from session when auth is implemented
          userAgent: request.headers.get('user-agent') || 'unknown'
        })
      } catch (auditError) {
        // Log error but don't fail the update
        console.error('Failed to create audit log:', auditError)
      }
    }

    return NextResponse.json({
      message: `Elemento ${id} actualizado exitosamente`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return handleApiError(error, "Error al actualizar el elemento del menú")
  }
}

// DELETE - Eliminar un elemento específico
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ section: string; id: string }> }
) {
  const params = await props.params;
  try {
    const { authorized, errorResponse } = validateAdminAuth(request as any)
    if (!authorized) return errorResponse

    const { id } = params

    await connectDB()

    // Soft delete: mark as deleted instead of removing from database
    const deleted = await Product.findOneAndUpdate(
      { id: id },
      {
        $set: {
          deletedAt: new Date(),
          deletedBy: 'admin' // TODO: Get from session when auth is implemented
        }
      },
      { new: true }
    )

    if (!deleted) {
      return NextResponse.json(
        { error: `Elemento no encontrado: ${id}` },
        { status: 404 }
      )
    }

    // Audit logging: Track deletion
    try {
      await AuditLog.create({
        entityType: 'product',
        entityId: id,
        action: 'delete',
        changes: [{
          field: 'deleted',
          oldValue: false,
          newValue: true
        }],
        performedBy: 'admin', // TODO: Get from session when auth is implemented
        userAgent: request.headers.get('user-agent') || 'unknown'
      })
    } catch (auditError) {
      console.error('Failed to create audit log for deletion:', auditError)
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
    const { authorized, errorResponse } = validateAdminAuth(request as any)
    if (!authorized) return errorResponse

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

    // Audit logging: Track creation
    try {
      await AuditLog.create({
        entityType: 'product',
        entityId: generatedId,
        action: 'create',
        changes: [{
          field: 'created',
          oldValue: null,
          newValue: product.toObject()
        }],
        performedBy: 'admin', // TODO: Get from session when auth is implemented
        userAgent: request.headers.get('user-agent') || 'unknown'
      })
    } catch (auditError) {
      console.error('Failed to create audit log for creation:', auditError)
    }

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
