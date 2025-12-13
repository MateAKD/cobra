import { NextResponse } from "next/server"
import Product from "@/models/Product"
import Category from "@/models/Category"
import connectDB from "@/lib/db"

// GET - Verificar el estado completo del sistema
export async function GET() {
    try {
        await connectDB()

        // 1. Contar categorías y productos
        const totalCategories = await Category.countDocuments({})
        const totalProducts = await Product.countDocuments({})

        // 2. Listar todas las categorías principales (no subcategorías)
        const mainCategories = await Category.find({ isSubcategory: false }).sort({ order: 1 }).lean()

        // 3. Para cada categoría principal, contar productos
        const categoryStats = []
        for (const cat of mainCategories) {
            const productCount = await Product.countDocuments({ categoryId: cat.id })

            // También buscar subcategorías
            const subcategories = await Category.find({ parentCategory: cat.id }).lean()
            const subcatStats = []

            for (const subcat of subcategories) {
                const subcatProducts = await Product.countDocuments({ categoryId: subcat.id })
                subcatStats.push({
                    id: subcat.id,
                    name: subcat.name,
                    productCount: subcatProducts
                })
            }

            categoryStats.push({
                id: cat.id,
                name: cat.name,
                directProducts: productCount,
                subcategories: subcatStats
            })
        }

        return NextResponse.json({
            summary: {
                totalCategories,
                totalProducts,
                mainCategoriesCount: mainCategories.length
            },
            categories: categoryStats
        })

    } catch (error) {
        console.error("Error verifying state:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error desconocido" },
            { status: 500 }
        )
    }
}
