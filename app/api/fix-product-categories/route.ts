import { NextResponse } from "next/server"
import Product from "@/models/Product"
import connectDB from "@/lib/db"

// POST - Arreglar categorías de productos
export async function POST() {
    try {
        await connectDB()

        const fixes = [
            // Arreglar "tapeo" → "tapeos"
            { from: "tapeo", to: "tapeos" },

            // Arreglar vinos
            { from: "vinos-tintos", to: "tintos" },

            // Mover "licuados-y-jugos" → "bebidas-sin-alcohol"
            { from: "licuados-y-jugos", to: "bebidas-sin-alcohol" },

            // Mover "de-12-a-16-hs-menu" → "parrilla"
            { from: "de-12-a-16-hs-menu", to: "parrilla" },

            // Mover "guarniciones-menu" → "guarniciones"
            { from: "guarniciones-menu", to: "guarniciones" },

            // Eliminar duplicado "tapeos-promociones" (ya existe en tapeos)
            { from: "tapeos-promociones", to: "DELETE" }
        ]

        let totalUpdated = 0
        let totalDeleted = 0

        for (const fix of fixes) {
            if (fix.to === "DELETE") {
                const result = await Product.deleteMany({ categoryId: fix.from })
                totalDeleted += result.deletedCount
                console.log(`✓ ${result.deletedCount} productos eliminados de "${fix.from}"`)
            } else {
                const result = await Product.updateMany(
                    { categoryId: fix.from },
                    { $set: { categoryId: fix.to } }
                )
                totalUpdated += result.modifiedCount
                console.log(`✓ ${result.modifiedCount} productos migrados de "${fix.from}" a "${fix.to}"`)
            }
        }

        // Eliminar productos duplicados de cafe-promociones (mantener solo los más recientes)
        const cafePromos = await Product.find({ categoryId: "cafe-promociones" }).sort({ createdAt: -1 }).lean()
        const seenNames = new Set()
        const duplicateIds = []

        for (const product of cafePromos) {
            if (seenNames.has(product.name)) {
                duplicateIds.push(product.id)
            } else {
                seenNames.add(product.name)
            }
        }

        if (duplicateIds.length > 0) {
            const deleteResult = await Product.deleteMany({ id: { $in: duplicateIds } })
            totalDeleted += deleteResult.deletedCount
            console.log(`✓ ${deleteResult.deletedCount} productos duplicados eliminados de cafe-promociones`)
        }

        return NextResponse.json({
            success: true,
            message: "Categorías de productos arregladas",
            stats: {
                productsUpdated: totalUpdated,
                productsDeleted: totalDeleted
            }
        })

    } catch (error) {
        console.error("Error arreglando categorías:", error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido"
            },
            { status: 500 }
        )
    }
}
