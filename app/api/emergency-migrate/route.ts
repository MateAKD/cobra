import { NextResponse } from "next/server"
import Product from "@/models/Product"
import connectDB from "@/lib/db"
import fs from "fs"
import path from "path"

// EMERGENCY MIGRATION - Migrar datos desde menu.json a MongoDB
export async function POST() {
    try {
        await connectDB()

        // Leer el archivo menu.json
        const menuPath = path.join(process.cwd(), 'data', 'menu.json')
        const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'))

        const bulkOps: any[] = []
        let productCount = 0

        // Helper para procesar items
        const processItems = (items: any[], categoryId: string, section: string) => {
            items.forEach((item, index) => {
                productCount++
                bulkOps.push({
                    updateOne: {
                        filter: { id: item.id },
                        update: {
                            $set: {
                                id: item.id,
                                name: item.name,
                                description: item.description || '',
                                price: item.price,
                                categoryId: categoryId,
                                section: section,
                                image: item.image,
                                visible: !item.hidden,
                                hidden: item.hidden || false,
                                hiddenReason: item.hiddenReason,
                                hiddenBy: item.hiddenBy,
                                hiddenAt: item.hiddenAt,
                                ingredients: item.ingredients,
                                tags: item.tags || [],
                                order: index,
                                glass: item.glass,
                                technique: item.technique,
                                garnish: item.garnish
                            }
                        },
                        upsert: true
                    }
                })
            })
        }

        // Procesar todas las categorías
        for (const [key, value] of Object.entries(menuData)) {
            if (Array.isArray(value)) {
                // Categoría directa (ej: "parrilla", "tapeo")
                processItems(value, key, 'menu')
            } else if (typeof value === 'object' && value !== null) {
                // Sección con subcategorías (ej: "vinos" -> "tintos", "blancos")
                for (const [subKey, subValue] of Object.entries(value)) {
                    if (Array.isArray(subValue)) {
                        processItems(subValue as any[], subKey, key)
                    }
                }
            }
        }

        // Ejecutar migración
        if (bulkOps.length > 0) {
            const result = await Product.bulkWrite(bulkOps)

            return NextResponse.json({
                success: true,
                message: "Migración completada exitosamente",
                stats: {
                    totalProducts: productCount,
                    upserted: result.upsertedCount,
                    modified: result.modifiedCount,
                    matched: result.matchedCount
                }
            })
        } else {
            return NextResponse.json({
                success: false,
                message: "No se encontraron productos para migrar"
            })
        }

    } catch (error) {
        console.error("Error en migración:", error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido"
            },
            { status: 500 }
        )
    }
}
