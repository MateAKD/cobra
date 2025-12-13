import { NextResponse } from "next/server"
import Product from "@/models/Product"
import connectDB from "@/lib/db"

// POST - Restaurar productos de parrilla
export async function POST() {
    try {
        await connectDB()

        const parrillaProducts = [
            {
                id: "parrilla-entrania",
                name: "ENTRAÑA",
                description: "250gr",
                price: "18500",
                categoryId: "parrilla",
                section: "menu",
                visible: true,
                hidden: false,
                order: 0
            },
            {
                id: "parrilla-ojo-bife",
                name: "OJO DE BIFE",
                description: "320gr",
                price: "19200",
                categoryId: "parrilla",
                section: "menu",
                visible: true,
                hidden: false,
                order: 1
            },
            {
                id: "parrilla-tira-asado",
                name: "TIRA DE ASADO",
                description: "320gr",
                price: "16500",
                categoryId: "parrilla",
                section: "menu",
                visible: true,
                hidden: false,
                order: 2
            },
            {
                id: "parrilla-chorizo-bombon",
                name: "CHORIZO BOMBON",
                description: "2 unidades",
                price: "5000",
                categoryId: "parrilla",
                section: "menu",
                visible: true,
                hidden: false,
                order: 3
            }
        ]

        // Verificar cuántos productos de parrilla existen
        const existingCount = await Product.countDocuments({ categoryId: "parrilla" })

        if (existingCount === 0) {
            // Solo insertar si no hay productos
            const result = await Product.insertMany(parrillaProducts)
            return NextResponse.json({
                success: true,
                message: "Productos de parrilla restaurados",
                count: result.length
            })
        } else {
            return NextResponse.json({
                success: true,
                message: "Productos de parrilla ya existen",
                existingCount
            })
        }

    } catch (error) {
        console.error("Error restoring parrilla products:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error desconocido" },
            { status: 500 }
        )
    }
}
