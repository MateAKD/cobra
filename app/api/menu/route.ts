import { NextRequest, NextResponse } from "next/server"
import { validateAdminAuth } from "@/lib/auth"
import Product from "@/models/Product"
import Category from "@/models/Category"
import connectDB from "@/lib/db"
import { revalidatePath } from 'next/cache'
import { isTimeInRange } from "@/lib/menuUtils"



// GET - Obtener todos los datos del menú desde MongoDB
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Check if this is an admin request (admin panel should see ALL products)
    const { searchParams } = new URL(request.url)
    const isAdminRequestParam = searchParams.get('admin') === 'true'
    const includeDeleted = searchParams.get('includeDeleted') === 'true'

    // SECURITY: Validate admin token before granting admin access
    let isAdminRequest = false
    if (isAdminRequestParam) {
      const { authorized } = validateAdminAuth(request as any)
      if (!authorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      isAdminRequest = true
    }

    // Build filter: exclude deleted products unless includeDeleted is true
    const filter = includeDeleted ? {} : { deletedAt: null }

    // Obtener todos los productos ordenados, aplicando filtro de soft delete
    const products = await Product.find(filter).sort({ order: 1 }).lean()

    // DEBUG: Log parrilla products before filtering
    const parrillaProducts = products.filter((p: any) => p.categoryId === 'parrilla')
    console.log('🔍 DEBUG - Parrilla products from DB:', {
      total: parrillaProducts.length,
      products: parrillaProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        hidden: p.hidden,
        section: p.section
      }))
    })

    // Obtener todas las categorías para verificar restricciones de tiempo
    let categories: any[] = []
    try {
      categories = await Category.find({}).lean()
    } catch (catError) {
      console.error("Error fetching categories:", catError)
      // Non-critical: continue without categories
    }

    const categoriesMap = categories.reduce((acc, cat: any) => {
      if (cat && cat.id) {
        acc[cat.id] = cat
      }
      return acc
    }, {} as Record<string, any>)

    // Reconstruir la estructura JSON que espera el frontend
    const menuData: any = {}

    products.forEach((product: any) => {
      const catId = product.categoryId

      // Asegurar que el ID de la categoría exista en la raíz (esto es lo que usa Parrilla)
      if (!menuData[catId]) {
        menuData[catId] = []
      }

      // Evitar duplicados si el producto ya fue agregado
      const alreadyAdded = menuData[catId].some((p: any) => p.id === product.id)
      if (!alreadyAdded) {
        menuData[catId].push(product)
      }

      // Si tiene una sección específica (como 'vinos'), mantener compatibilidad legacy
      if (product.section && product.section !== 'menu' && product.section !== catId) {
        if (!menuData[product.section]) {
          menuData[product.section] = {}
        }
        if (!menuData[product.section][catId]) {
          menuData[product.section][catId] = []
        }
        const alreadyInSection = menuData[product.section][catId].some((p: any) => p.id === product.id)
        if (!alreadyInSection) {
          menuData[product.section][catId].push(product)
        }
      }
    })

    // FILTER: Remove categories that are outside their time range or invisible
    // BUT: Skip filtering if this is an admin request (admin should see everything)
    const filteredMenuData: any = {}

    // Function to check visibility recursively (including parents)
    const checkVisibility = (catId: string): boolean => {
      const category = categoriesMap[catId]

      // If category doesn't exist in metadata, it's visible by default
      if (!category) return true

      // Check its own visibility
      if (category.visible === false) return false

      // Check its own time restriction
      if (category.timeRestricted && category.startTime && category.endTime) {
        if (!isTimeInRange(category.startTime, category.endTime)) return false
      }

      // Recursively check parent visibility if it exists
      if (category.parentCategory && category.parentCategory !== catId) {
        return checkVisibility(category.parentCategory)
      }

      return true
    }

    if (isAdminRequest) {
      // Admin mode: Return ALL categories without time or visibility filtering
      Object.entries(menuData).forEach(([categoryId, data]) => {
        filteredMenuData[categoryId] = data
      })
    } else {
      // Public menu: Apply recursive time-based and visibility filtering
      Object.entries(menuData).forEach(([categoryId, data]) => {
        if (checkVisibility(categoryId)) {
          filteredMenuData[categoryId] = data
        }
      })
    }

    const response = NextResponse.json(filteredMenuData)

    // PHASE 6: Different cache for admin vs public
    if (isAdminRequest) {
      // Admin: No cache, always fresh data
      response.headers.set('Cache-Control', 'no-store, must-revalidate')
    } else {
      // Public: 5s cache for performance
      response.headers.set('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=10')
    }

    return response
  } catch (error) {
    console.error("CRITICAL: Error reading menu data from DB:", error)

    const isProduction = process.env.NODE_ENV === 'production'
    return NextResponse.json(
      {
        error: "Error al leer los datos del menú",
        // SECURITY: Don't expose error details in production
        details: isProduction ? undefined : (error instanceof Error ? error.message : String(error))
      },
      { status: 500 }
    )
  }
}

// POST - Actualizar items del menú (hace merge/upsert)
export async function POST(request: NextRequest) {
  try {
    const { authorized, errorResponse } = validateAdminAuth(request as any)
    if (!authorized) return errorResponse

    // Nota: Este endpoint originalmente recibía TODO el JSON y lo guardaba.
    // Para no romper compatibilidad, aceptamos el JSON pero deberíamos procesarlo.
    // SIN EMBARGO, si el Admin panel usa este endpoint para guardar TODO de golpe,
    // es ineficiente en MongoDB.

    /* 
       Estrategia Temporal:
       Si el admin envía un objeto completo, iteramos y actualizamos.
       Idealmente, el admin debería usar endpoints más específicos (PATCH /products/:id).
       Pero asumimos que recibimos { "entradas": [...], "vinos": { ... } }
    */

    const newMenuData = await request.json()
    await connectDB()

    const bulkOps: any[] = []

    // Helper para generar operaciones
    const processItems = (items: any[], categoryId: string, section: string) => {
      items.forEach((item, index) => {
        // INTEGRITY: Build $set with only content fields — never touch hidden/deletedAt state
        const contentFields: any = {
          name: item.name,
          description: item.description,
          price: item.price,
          categoryId: categoryId,
          section: section,
          image: item.image,
          ingredients: item.ingredients,
          tags: item.tags,
          // Only update order if explicitly provided, otherwise preserve existing
          ...(item.order !== undefined ? { order: item.order } : { order: index })
        }

        // INTEGRITY: Only write hidden state if it comes explicitly as boolean
        // Avoids resetting visibility on bulk updates from incomplete payloads
        if (typeof item.hidden === 'boolean') {
          contentFields.hidden = item.hidden
          if (item.hidden) {
            // Only set reason/by if hiding; never overwrite with undefined on show
            if (item.hiddenReason) contentFields.hiddenReason = item.hiddenReason
            if (item.hiddenBy) contentFields.hiddenBy = item.hiddenBy
          }
        }

        bulkOps.push({
          updateOne: {
            filter: { id: item.id },
            update: { $set: contentFields },
            upsert: true
          }
        })
      })
    }

    // Iterar y procesar (similar al script de migración)
    for (const [key, value] of Object.entries(newMenuData)) {
      if (Array.isArray(value)) {
        processItems(value, key, 'menu')
      } else if (typeof value === 'object' && value !== null) {
        for (const [subKey, subValue] of Object.entries(value)) {
          processItems(subValue as any[], subKey, key)
        }
      }
    }

    if (bulkOps.length > 0) {
      await Product.bulkWrite(bulkOps)
    }

    // INVALIDAR CACHE
    revalidatePath('/menu')
    revalidatePath('/admin')
    revalidatePath('/api/menu')

    return NextResponse.json({
      message: "Menú actualizado exitosamente en MongoDB",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error updating menu data:", error)
    return NextResponse.json(
      { error: "Error al actualizar los datos del menú" },
      { status: 500 }
    )
  }
}
