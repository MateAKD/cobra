import { NextResponse } from "next/server"
import Product from "@/models/Product"
import connectDB from "@/lib/db"

// POST - Agregar productos de promociones
export async function POST() {
    try {
        await connectDB()

        const promocionProducts = [
            // CAFÉ promociones
            {
                id: "promo-cafe-1",
                name: "1 AMERICANO O CAPUCCINO + 2 MEDIALUNAS",
                description: "",
                price: "9000",
                categoryId: "cafe-promociones",
                section: "menu",
                visible: true,
                hidden: false,
                order: 0
            },
            {
                id: "promo-cafe-2",
                name: "1 CAFE A ELECCIÓN + CHIPA",
                description: "",
                price: "9500",
                categoryId: "cafe-promociones",
                section: "menu",
                visible: true,
                hidden: false,
                order: 1
            },
            {
                id: "promo-cafe-3",
                name: "1 FLAT WHITE O LATTE + 1 BUDIN DE LIMON O BANANA",
                description: "",
                price: "10500",
                categoryId: "cafe-promociones",
                section: "menu",
                visible: true,
                hidden: false,
                order: 2
            },
            {
                id: "promo-cafe-4",
                name: "2 CAFES A ELECCIÓN + BROWNIE + COOKIE",
                description: "",
                price: "21500",
                categoryId: "cafe-promociones",
                section: "menu",
                visible: true,
                hidden: false,
                order: 3
            },
            // TAPEOS promociones
            {
                id: "promo-tapeos-1",
                name: "PAPAS FRITAS + 2 CORONAS",
                description: "",
                price: "18200",
                categoryId: "tapeos-promociones",
                section: "menu",
                visible: true,
                hidden: false,
                order: 0
            }
        ]

        // Eliminar promociones existentes y agregar nuevas
        await Product.deleteMany({ categoryId: { $in: ["cafe-promociones", "tapeos-promociones"] } })

        const result = await Product.insertMany(promocionProducts)

        return NextResponse.json({
            success: true,
            message: "Productos de promociones agregados",
            count: result.length
        })

    } catch (error) {
        console.error("Error adding promo products:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error desconocido" },
            { status: 500 }
        )
    }
}
