import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/models/Product"
import Category from "@/models/Category"

interface RemovalReport {
    productsRemoved: number
    categoriesRemoved: number
    orphanedProductsRemoved: number
    details: {
        removedProductIds: string[]
        removedCategoryIds: string[]
        removedOrphanedProductIds: string[]
    }
}

// POST - Eliminar duplicados de la base de datos
export async function POST() {
    try {
        await connectDB()

        const report: RemovalReport = {
            productsRemoved: 0,
            categoriesRemoved: 0,
            orphanedProductsRemoved: 0,
            details: {
                removedProductIds: [],
                removedCategoryIds: [],
                removedOrphanedProductIds: []
            }
        }

        // 1. Eliminar productos duplicados (mantener el primero)
        const products = await Product.find({}).lean()
        const seenProductIds = new Set<string>()

        for (const product of products) {
            if (seenProductIds.has(product.id)) {
                // Este es un duplicado, eliminarlo
                await Product.deleteOne({ _id: (product as any)._id })
                report.productsRemoved++
                report.details.removedProductIds.push(product.id)
                console.log(`Eliminado producto duplicado: ${product.id} - ${product.name}`)
            } else {
                seenProductIds.add(product.id)
            }
        }

        // 2. Eliminar categorías duplicadas (mantener la primera)
        const categories = await Category.find({}).lean()
        const seenCategoryIds = new Set<string>()

        for (const category of categories) {
            if (seenCategoryIds.has(category.id)) {
                // Esta es una duplicada, eliminarla
                await Category.deleteOne({ _id: (category as any)._id })
                report.categoriesRemoved++
                report.details.removedCategoryIds.push(category.id)
                console.log(`Eliminada categoría duplicada: ${category.id} - ${category.name}`)
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
                console.log(`Eliminado producto huérfano: ${product.id} - ${product.name} (categoría: ${product.categoryId})`)
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
