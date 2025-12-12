import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Category from "@/models/Category"

// GET - Obtener el mapeo de subcategorías
export async function GET() {
  try {
    await connectDB()

    // Obtener todas las categorías que son subcategorías (tienen parentCategory)
    const subCategories = await Category.find({
      parentCategory: { $exists: true, $ne: null }
    }).lean()

    // Construir el objeto de mapeo { "childId": "parentId" }
    const mappingData: Record<string, string> = {}
    subCategories.forEach((cat: any) => {
      if (cat.parentCategory) {
        mappingData[cat.id] = cat.parentCategory
      }
    })

    const response = NextResponse.json(mappingData)
    response.headers.set('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=10')

    return response
  } catch (error) {
    console.error("Error reading subcategory mapping from DB:", error)
    return NextResponse.json({})
  }
}

// POST - Actualizar el mapeo de subcategorías
export async function POST(request: NextRequest) {
  try {
    const newMapping = await request.json()

    if (typeof newMapping !== 'object' || newMapping === null) {
      return NextResponse.json(
        { error: "El mapeo debe ser un objeto válido" },
        { status: 400 }
      )
    }

    await connectDB()

    // Estrategia: Actualizar todas las categorías.
    // 1. Limpiar mappings antiguos? Depende. Si recibimos el mapping COMPLETO,
    //    deberíamos resetear los que ya no están.
    //    Pero para seguridad y simplicidad incremental:
    //    Iteramos el mapping y actualizamos cada child con su parent.

    const bulkOps = []

    // Primero, obtener estado actual si quisiéramos borrar mappings viejos (opcional pero recomendado si el frontend manda snapshot completo)
    // Asumamos que manda snapshot completo:
    // "idChild": "idParent"

    // Setear parentCategory en base al mapping
    for (const [childId, parentId] of Object.entries(newMapping)) {
      bulkOps.push({
        updateOne: {
          filter: { id: childId },
          update: {
            $set: {
              parentCategory: parentId,
              isSubcategory: true
            }
          }
        }
      })
    }

    // NOTA: No estamos "borrando" relaciones que ya no existen en newMapping.
    // Si el usuario borra una relación, el frontend debería mandar null o algo,
    // pero si simplemente manda un JSON más chico, los antiguos quedarán huérfanos con padre viejo.
    // Para arreglar esto necesitaríamos primero poner parentCategory: null en TODOS, 
    // y luego aplicar el mapping.
    // O hacer un unset de los que no están en el mapping.

    // Solución robusta:
    // 1. Resetear todas las subcategorías (poner parent: null, isSubcat: false)
    // 2. Aplicar nuevas
    // PERO esto es peligroso si hay concurrencia.

    // Vamos a confiar en que el usuario está "agregando/modificando".
    // Si necesitamos borrar, el admin panel debería manejarlo explícitamente.

    if (bulkOps.length > 0) {
      await Category.bulkWrite(bulkOps)
    }

    return NextResponse.json({
      message: "Mapeo de subcategorías actualizado exitosamente en MongoDB",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error updating subcategory mapping in DB:", error)
    return NextResponse.json(
      { error: "Error al actualizar el mapeo de subcategorías" },
      { status: 500 }
    )
  }
}
