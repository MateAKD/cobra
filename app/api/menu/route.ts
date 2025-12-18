import { NextRequest, NextResponse } from "next/server"
import Product from "@/models/Product"
import Category from "@/models/Category"
import connectDB from "@/lib/db"
import { revalidatePath } from 'next/cache'

// Helper function to check if current time is within a time range
function isTimeInRange(startTime: string, endTime: string): boolean {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTimeInMinutes = currentHour * 60 + currentMinute

  const [startHour, startMinute] = startTime.split(':').map(Number)
  const startTimeInMinutes = startHour * 60 + startMinute

  const [endHour, endMinute] = endTime.split(':').map(Number)
  const endTimeInMinutes = endHour * 60 + endMinute

  // If range crosses midnight (e.g., 22:00 to 02:00)
  if (startTimeInMinutes > endTimeInMinutes) {
    return currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes <= endTimeInMinutes
  }

  // Normal range within same day
  return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes
}

// GET - Obtener todos los datos del menú desde MongoDB
export async function GET() {
  try {
    await connectDB()

    // Obtener todos los productos ordenados
    const products = await Product.find({}).sort({ order: 1 }).lean()

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
      // Determinar dónde va el producto
      if (product.section === 'menu') {
        // Categoría directa (ej: "entradas")
        if (!menuData[product.categoryId]) {
          menuData[product.categoryId] = []
        }
        menuData[product.categoryId].push(product)
      } else {
        // Sección anidada (ej: "vinos", "promociones")
        if (!menuData[product.section]) {
          menuData[product.section] = {}
        }
        if (!menuData[product.section][product.categoryId]) {
          menuData[product.section][product.categoryId] = []
        }
        menuData[product.section][product.categoryId].push(product)
      }
    })

    // FILTER: Remove categories that are outside their time range
    const filteredMenuData: any = {}

    Object.entries(menuData).forEach(([categoryId, data]) => {
      const category = categoriesMap[categoryId]

      // Check if category has time restriction
      if (category?.timeRestricted && category.startTime && category.endTime) {
        const isInRange = isTimeInRange(category.startTime, category.endTime)

        // Only include if current time is WITHIN the allowed range
        if (isInRange) {
          filteredMenuData[categoryId] = data
        }
        // Otherwise skip this category entirely (it's hidden)
      } else {
        // No restriction or invalid config - include it
        filteredMenuData[categoryId] = data
      }
    })

    const response = NextResponse.json(filteredMenuData)
    // Cache de 5s para no saturar DB pero datos frescos
    response.headers.set('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=10')

    return response
  } catch (error) {
    console.error("CRITICAL: Error reading menu data from DB:", error)
    return NextResponse.json(
      {
        error: "Error al leer los datos del menú",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// POST - Actualizar items del menú (hace merge/upsert)
export async function POST(request: NextRequest) {
  try {
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
        bulkOps.push({
          updateOne: {
            filter: { id: item.id },
            update: {
              $set: {
                name: item.name,
                description: item.description,
                price: item.price,
                categoryId: categoryId,
                section: section,
                image: item.image,
                visible: !item.hidden, // mapping legacy
                hidden: item.hidden,
                hiddenReason: item.hiddenReason,
                hiddenBy: item.hiddenBy,
                ingredients: item.ingredients,
                tags: item.tags,
                order: index // Actualizar orden según llega en el array
              }
            },
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
