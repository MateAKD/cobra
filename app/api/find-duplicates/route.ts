import { NextResponse } from "next/server"
import { validateAdminAuth } from "@/lib/auth"
import connectDB from "@/lib/db"
import Product from "@/models/Product"
import Category from "@/models/Category"

interface DuplicateReport {
    duplicateProducts: Array<{
        id: string
        name: string
        count: number
        categories: string[]
    }>
    duplicateCategories: Array<{
        id: string
        name: string
        count: number
    }>
    orphanedProducts: Array<{
        id: string
        name: string
        categoryId: string
    }>
}

// GET - Buscar duplicados en la base de datos
export async function GET(request: Request) {
    try {
        const { authorized, errorResponse } = validateAdminAuth(request as any)
        if (!authorized) return errorResponse

        await connectDB()

        const report: DuplicateReport = {
            duplicateProducts: [],
            duplicateCategories: [],
            orphanedProducts: []
        }

        // 1. Buscar productos duplicados por ID
        const products = await Product.find({}).lean()
        const productsByID = new Map<string, any[]>()

        products.forEach((product: any) => {
            const existing = productsByID.get(product.id) || []
            existing.push(product)
            productsByID.set(product.id, existing)
        })

        // Identificar duplicados por ID
        productsByID.forEach((prods, id) => {
            if (prods.length > 1) {
                report.duplicateProducts.push({
                    id,
                    name: prods[0].name,
                    count: prods.length,
                    categories: prods.map(p => p.categoryId)
                })
            }
        })

        // 2. Buscar categorías duplicadas por ID
        const categories = await Category.find({}).lean()
        const categoriesByID = new Map<string, any[]>()

        categories.forEach((category: any) => {
            const existing = categoriesByID.get(category.id) || []
            existing.push(category)
            categoriesByID.set(category.id, existing)
        })

        // Identificar duplicados por ID
        categoriesByID.forEach((cats, id) => {
            if (cats.length > 1) {
                report.duplicateCategories.push({
                    id,
                    name: cats[0].name,
                    count: cats.length
                })
            }
        })

        // 3. Buscar productos huérfanos (sin categoría válida)
        const validCategoryIds = new Set(categories.map((c: any) => c.id))

        products.forEach((product: any) => {
            if (!validCategoryIds.has(product.categoryId)) {
                report.orphanedProducts.push({
                    id: product.id,
                    name: product.name,
                    categoryId: product.categoryId
                })
            }
        })

        // Calcular totales
        const summary = {
            totalDuplicateProducts: report.duplicateProducts.reduce((sum, d) => sum + (d.count - 1), 0),
            totalDuplicateCategories: report.duplicateCategories.reduce((sum, d) => sum + (d.count - 1), 0),
            totalOrphanedProducts: report.orphanedProducts.length,
            hasIssues: report.duplicateProducts.length > 0 ||
                report.duplicateCategories.length > 0 ||
                report.orphanedProducts.length > 0
        }

        return NextResponse.json({
            summary,
            details: report,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error("Error finding duplicates:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error al buscar duplicados" },
            { status: 500 }
        )
    }
}
