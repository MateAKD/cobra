import { NextResponse } from "next/server"
import Product from "@/models/Product"
import connectDB from "@/lib/db"

// POST - Reasignación final de productos
export async function POST() {
    try {
        await connectDB()

        const reassignments = [
            { from: "licuados-y-jugos", to: "bebidas-sin-alcohol" },
            { from: "de-12-a-16-hs-menu", to: "parrilla" },
            { from: "vinos-tintos", to: "tintos" },
            { from: "guarniciones-menu", to: "guarniciones" },
            { from: "desayunos-y-meriendas", to: "cafeteria" } // Mover todos los de desayunos a cafetería
        ]

        let totalUpdated = 0

        for (const { from, to } of reassignments) {
            const result = await Product.updateMany(
                { categoryId: from },
                { $set: { categoryId: to } }
            )
            console.log(`✓ ${result.modifiedCount} productos movidos de "${from}" a "${to}"`)
            totalUpdated += result.modifiedCount
        }

        return NextResponse.json({
            success: true,
            message: "Productos reasignados a categorías correctas",
            stats: {
                productsUpdated: totalUpdated
            }
        })

    } catch (error) {
        console.error("Error reassiging products:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error desconocido" },
            { status: 500 }
        )
    }
}
