import { NextResponse } from "next/server"
import Product from "@/models/Product"
import Category from "@/models/Category"
import connectDB from "@/lib/db"

// GET - Listar todas las categorías que tienen productos
export async function GET() {
    try {
        await connectDB()

        // Agrupación de productos por categoría
        const distribution = await Product.aggregate([
            { $group: { _id: "$categoryId", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ])

        // Verificar si estas categorías existen
        const result = await Promise.all(distribution.map(async (item) => {
            const category = await Category.findOne({ id: item._id }).lean()
            return {
                categoryId: item._id,
                productCount: item.count,
                categoryExists: !!category,
                categoryName: category ? category.name : "NO EXISTE"
            }
        }))

        return NextResponse.json({
            totalProducts: await Product.countDocuments({}),
            distribution: result
        })

    } catch (error) {
        console.error("Error analyzing products:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error desconocido" },
            { status: 500 }
        )
    }
}
