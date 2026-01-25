import { NextResponse } from "next/server"
import { validateAdminAuth } from "@/lib/auth"
import Category from "@/models/Category"
import connectDB from "@/lib/db"

// POST - Limpiar categorías incorrectas y dejar solo las correctas
export async function POST(request: Request) {
    try {
        const { authorized, errorResponse } = validateAdminAuth(request as any)
        if (!authorized) return errorResponse

        await connectDB()

        // Lista de IDs de categorías que DEBEN existir
        const validCategoryIds = [
            "parrilla", "tapeos", "principales", "desayunos-y-meriendas", "bebidas", "promociones",
            "guarniciones", "milanesas", "hamburguesas", "ensaladas", "otros",
            "cafeteria", "pasteleria",
            "bebidas-sin-alcohol", "cervezas", "tragos-clasicos", "especiales", "tragos-con-red-bull", "shots", "vinos", "botellas",
            "tintos", "blancos", "rosados", "copas-de-vino",
            "gins", "whiskies", "vodkas", "espumantes",
            "cafe-promociones", "tapeos-promociones"
        ]

        // Eliminar TODAS las categorías que NO están en la lista
        const result = await Category.deleteMany({
            id: { $nin: validCategoryIds }
        })

        console.log(`✓ ${result.deletedCount} categorías incorrectas eliminadas`)

        // Verificar cuántas categorías correctas quedan
        const remainingCategories = await Category.countDocuments({})

        return NextResponse.json({
            success: true,
            message: "Categorías incorrectas eliminadas",
            deletedCount: result.deletedCount,
            remainingCategories: remainingCategories
        })

    } catch (error) {
        console.error("Error limpiando categorías:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error desconocido" },
            { status: 500 }
        )
    }
}
