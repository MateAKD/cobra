import { NextResponse } from "next/server"
import { validateAdminAuth } from "@/lib/auth"
import Category from "@/models/Category"
import Product from "@/models/Product"
import connectDB from "@/lib/db"

// GET - Ver todas las categorías y productos actuales
export async function GET(request: Request) {
    try {
        const { authorized, errorResponse } = validateAdminAuth(request as any)
        if (!authorized) return errorResponse

        await connectDB()

        const categories = await Category.find({}).lean()
        const products = await Product.find({}).lean()

        // Agrupar productos por categoryId
        const productsByCategory: Record<string, number> = {}
        products.forEach((p: any) => {
            productsByCategory[p.categoryId] = (productsByCategory[p.categoryId] || 0) + 1
        })

        return NextResponse.json({
            totalCategories: categories.length,
            totalProducts: products.length,
            categories: categories.map((c: any) => ({
                id: c.id,
                name: c.name,
                isSubcategory: c.isSubcategory,
                parentCategory: c.parentCategory,
                productCount: productsByCategory[c.id] || 0
            })),
            productsByCategory
        })
    } catch (error) {
        console.error("Error:", error)
        return NextResponse.json(
            { error: "Error al obtener datos" },
            { status: 500 }
        )
    }
}
