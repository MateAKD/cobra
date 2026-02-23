import { NextResponse } from "next/server"
import { validateAdminAuth } from "@/lib/auth"
import connectDB from "@/lib/db"
import Product from "@/models/Product"
import Category from "@/models/Category"

/**
 * GET /api/admin/diagnostics
 * Busca duplicados y productos huérfanos en la base de datos (solo lectura / dry-run)
 */
export async function GET(request: Request) {
    try {
        const { authorized, errorResponse } = validateAdminAuth(request as any)
        if (!authorized) return errorResponse

        await connectDB()

        const report = {
            duplicateProducts: [] as Array<{ id: string; name: string; count: number; categories: string[] }>,
            duplicateCategories: [] as Array<{ id: string; name: string; count: number }>,
            orphanedProducts: [] as Array<{ id: string; name: string; categoryId: string }>
        }

        // 1. Buscar productos duplicados por ID
        const products = await Product.find({}).lean()
        const productsByID = new Map<string, any[]>()
        products.forEach((product: any) => {
            const existing = productsByID.get(product.id) || []
            existing.push(product)
            productsByID.set(product.id, existing)
        })
        productsByID.forEach((prods, id) => {
            if (prods.length > 1) {
                report.duplicateProducts.push({
                    id,
                    name: prods[0].name,
                    count: prods.length,
                    categories: prods.map((p: any) => p.categoryId)
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

        const summary = {
            totalDuplicateProducts: report.duplicateProducts.reduce((sum, d) => sum + (d.count - 1), 0),
            totalDuplicateCategories: report.duplicateCategories.reduce((sum, d) => sum + (d.count - 1), 0),
            totalOrphanedProducts: report.orphanedProducts.length,
            hasIssues:
                report.duplicateProducts.length > 0 ||
                report.duplicateCategories.length > 0 ||
                report.orphanedProducts.length > 0
        }

        return NextResponse.json({ summary, details: report, timestamp: new Date().toISOString() })

    } catch (error) {
        console.error("Error finding duplicates:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error al buscar duplicados" },
            { status: 500 }
        )
    }
}

/**
 * POST /api/admin/diagnostics
 * Elimina duplicados y productos huérfanos de la base de datos
 */
export async function POST(request: Request) {
    try {
        const { authorized, errorResponse } = validateAdminAuth(request as any)
        if (!authorized) return errorResponse

        await connectDB()

        const report = {
            productsRemoved: 0,
            categoriesRemoved: 0,
            orphanedProductsRemoved: 0,
            details: {
                removedProductIds: [] as string[],
                removedCategoryIds: [] as string[],
                removedOrphanedProductIds: [] as string[]
            }
        }

        // 1. Eliminar productos duplicados (mantener el primero)
        const products = await Product.find({}).lean()
        const seenProductIds = new Set<string>()
        for (const product of products) {
            if (seenProductIds.has(product.id)) {
                await Product.deleteOne({ _id: (product as any)._id })
                report.productsRemoved++
                report.details.removedProductIds.push(product.id)
            } else {
                seenProductIds.add(product.id)
            }
        }

        // 2. Eliminar categorías duplicadas (mantener la primera)
        const categories = await Category.find({}).lean()
        const seenCategoryIds = new Set<string>()
        for (const category of categories) {
            if (seenCategoryIds.has(category.id)) {
                await Category.deleteOne({ _id: (category as any)._id })
                report.categoriesRemoved++
                report.details.removedCategoryIds.push(category.id)
            } else {
                seenCategoryIds.add(category.id)
            }
        }

        // 3. Eliminar productos huérfanos (sin categoría válida)
        const validCategoryIds = new Set(
            (await Category.find({}).lean()).map((c: any) => c.id)
        )
        const allProducts = await Product.find({}).lean()
        for (const product of allProducts) {
            if (!validCategoryIds.has(product.categoryId)) {
                await Product.deleteOne({ _id: (product as any)._id })
                report.orphanedProductsRemoved++
                report.details.removedOrphanedProductIds.push(product.id)
            }
        }

        return NextResponse.json({
            success: true,
            summary: {
                totalItemsRemoved: report.productsRemoved + report.categoriesRemoved + report.orphanedProductsRemoved,
                productsRemoved: report.productsRemoved,
                categoriesRemoved: report.categoriesRemoved,
                orphanedProductsRemoved: report.orphanedProductsRemoved
            },
            details: report.details,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error("Error removing duplicates:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error al eliminar duplicados" },
            { status: 500 }
        )
    }
}
