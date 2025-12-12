import { NextResponse } from "next/server"
import Product from "@/models/Product"
import connectDB from "@/lib/db"

// EMERGENCY ENDPOINT - Verificar y resetear productos
export async function GET() {
    try {
        await connectDB()

        // Contar productos
        const totalProducts = await Product.countDocuments({})
        const hiddenProducts = await Product.countDocuments({ hidden: true })
        const visibleProducts = await Product.countDocuments({ hidden: false })
        const noHiddenField = await Product.countDocuments({ hidden: { $exists: false } })

        // Obtener algunos productos de ejemplo
        const sampleProducts = await Product.find({}).limit(5).lean()

        return NextResponse.json({
            stats: {
                total: totalProducts,
                hidden: hiddenProducts,
                visible: visibleProducts,
                noHiddenField: noHiddenField
            },
            sampleProducts: sampleProducts
        })
    } catch (error) {
        console.error("Error checking products:", error)
        return NextResponse.json(
            { error: "Error al verificar productos" },
            { status: 500 }
        )
    }
}

// POST - Resetear campo hidden de todos los productos
export async function POST() {
    try {
        await connectDB()

        // Resetear todos los productos a visible (hidden: false)
        const result = await Product.updateMany(
            {},
            { $set: { hidden: false, visible: true } }
        )

        return NextResponse.json({
            message: "Productos reseteados exitosamente",
            modifiedCount: result.modifiedCount,
            matchedCount: result.matchedCount
        })
    } catch (error) {
        console.error("Error resetting products:", error)
        return NextResponse.json(
            { error: "Error al resetear productos" },
            { status: 500 }
        )
    }
}
