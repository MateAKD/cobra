import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/models/Product"
import Category from "@/models/Category"
import { validateAdminAuth } from "@/lib/auth"

// GET - Crear backup completo de la base de datos
export async function GET(request: Request) {
    try {
        const { authorized, errorResponse } = validateAdminAuth(request as any)
        if (!authorized) return errorResponse

        await connectDB()

        // Obtener todas las categorías
        const categories = await Category.find({}).lean()

        // Obtener todos los productos
        const products = await Product.find({}).lean()

        // Crear estructura de backup
        const backup = {
            timestamp: new Date().toISOString(),
            version: "1.0",
            collections: {
                categories: categories,
                products: products
            },
            stats: {
                totalCategories: categories.length,
                totalProducts: products.length,
                mainCategories: categories.filter((c: any) => !c.isSubcategory).length,
                subcategories: categories.filter((c: any) => c.isSubcategory).length
            }
        }

        // Retornar como JSON descargable
        return new NextResponse(JSON.stringify(backup, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="mongodb-backup-${new Date().toISOString().split('T')[0]}.json"`
            }
        })

    } catch (error) {
        console.error("Error creating backup:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error al crear backup" },
            { status: 500 }
        )
    }
}
