import { NextResponse } from "next/server"
import Product from "@/models/Product"
import Category from "@/models/Category"
import connectDB from "@/lib/db"

// POST - Reorganizar el menú según la estructura final
export async function POST() {
    try {
        await connectDB()

        // PASO 1: Eliminar todas las categorías existentes
        await Category.deleteMany({})
        console.log("✓ Categorías antiguas eliminadas")

        // PASO 2: Crear las categorías principales
        const mainCategories = [
            { id: "parrilla", name: "PARRILLA", order: 1 },
            { id: "tapeos", name: "TAPEOS", order: 2 },
            { id: "principales", name: "PRINCIPALES", order: 3 },
            { id: "desayunos-y-meriendas", name: "DESAYUNOS Y MERIENDAS", order: 4 },
            { id: "bebidas", name: "BEBIDAS", order: 5 },
            { id: "promociones", name: "PROMOCIONES", order: 6 }
        ]

        for (const cat of mainCategories) {
            await Category.create({
                id: cat.id,
                name: cat.name,
                description: "",
                order: cat.order,
                visible: true,
                isSubcategory: false
            })
        }
        console.log("✓ Categorías principales creadas")

        // PASO 3: Crear subcategorías
        const subcategories = [
            // Parrilla
            { id: "guarniciones", name: "Guarniciones", parent: "parrilla", order: 1 },

            // Principales
            { id: "milanesas", name: "Milanesas", parent: "principales", order: 1 },
            { id: "hamburguesas", name: "Hamburguesas", parent: "principales", order: 2 },
            { id: "ensaladas", name: "Ensaladas", parent: "principales", order: 3 },
            { id: "otros", name: "Otros", parent: "principales", order: 4 },

            // Desayunos y meriendas
            { id: "cafeteria", name: "Cafetería", parent: "desayunos-y-meriendas", order: 1 },
            { id: "pasteleria", name: "Pastelería", parent: "desayunos-y-meriendas", order: 2 },

            // Bebidas
            { id: "bebidas-sin-alcohol", name: "Bebidas sin alcohol", parent: "bebidas", order: 1 },
            { id: "cervezas", name: "Cervezas", parent: "bebidas", order: 2 },
            { id: "tragos-clasicos", name: "Tragos Clásicos", parent: "bebidas", order: 3 },
            { id: "especiales", name: "Tragos Especiales", parent: "bebidas", order: 4 },
            { id: "tragos-con-red-bull", name: "Tragos con Red Bull", parent: "bebidas", order: 5 },
            { id: "shots", name: "Shots", parent: "bebidas", order: 6 },
            { id: "vinos", name: "Vinos", parent: "bebidas", order: 7 },
            { id: "botellas", name: "Botellas", parent: "bebidas", order: 8 },

            // Promociones
            { id: "cafe-promociones", name: "Café", parent: "promociones", order: 1 },
            { id: "bebidas-promociones", name: "Bebidas", parent: "promociones", order: 2 }
        ]

        for (const sub of subcategories) {
            await Category.create({
                id: sub.id,
                name: sub.name,
                description: "",
                order: sub.order,
                visible: true,
                isSubcategory: true,
                parentCategory: sub.parent
            })
        }
        console.log("✓ Subcategorías creadas")

        // PASO 4: Crear sub-subcategorías de Vinos
        const wineSubcategories = [
            { id: "tintos", name: "Tintos", parent: "vinos", order: 1 },
            { id: "blancos", name: "Blancos", parent: "vinos", order: 2 },
            { id: "rosados", name: "Rosados", parent: "vinos", order: 3 },
            { id: "copas-de-vino", name: "Copas de vino", parent: "vinos", order: 4 }
        ]

        for (const wine of wineSubcategories) {
            await Category.create({
                id: wine.id,
                name: wine.name,
                description: "",
                order: wine.order,
                visible: true,
                isSubcategory: true,
                parentCategory: wine.parent
            })
        }
        console.log("✓ Sub-subcategorías de vinos creadas")

        // PASO 5: Crear sub-subcategorías de Botellas
        const bottleSubcategories = [
            { id: "gins", name: "Gins", parent: "botellas", order: 1 },
            { id: "whiskies", name: "Whiskies", parent: "botellas", order: 2 },
            { id: "vodkas", name: "Vodkas", parent: "botellas", order: 3 },
            { id: "espumantes", name: "Espumantes", parent: "botellas", order: 4 }
        ]

        for (const bottle of bottleSubcategories) {
            await Category.create({
                id: bottle.id,
                name: bottle.name,
                description: "",
                order: bottle.order,
                visible: true,
                isSubcategory: true,
                parentCategory: bottle.parent
            })
        }
        console.log("✓ Sub-subcategorías de botellas creadas")

        // PASO 6: Reasignar productos a las nuevas categorías
        const categoryMappings: Record<string, { categoryId: string, section: string }> = {
            // Parrilla
            "parrilla": { categoryId: "parrilla", section: "menu" },
            "guarniciones": { categoryId: "guarniciones", section: "menu" },

            // Tapeos
            "tapeos": { categoryId: "tapeos", section: "menu" },

            // Principales
            "milanesas": { categoryId: "milanesas", section: "menu" },
            "hamburguesas": { categoryId: "hamburguesas", section: "menu" },
            "ensaladas": { categoryId: "ensaladas", section: "menu" },
            "otros": { categoryId: "otros", section: "menu" },

            // Desayunos y meriendas
            "cafeteria": { categoryId: "cafeteria", section: "menu" },
            "pasteleria": { categoryId: "pasteleria", section: "menu" },
            "cafe": { categoryId: "cafe-promociones", section: "menu" }, // Migrar cafe a cafe-promociones

            // Bebidas
            "bebidas": { categoryId: "bebidas-sin-alcohol", section: "menu" },
            "cervezas": { categoryId: "cervezas", section: "menu" },
            "tragos-clasicos": { categoryId: "tragos-clasicos", section: "menu" },
            "especiales": { categoryId: "especiales", section: "menu" },
            "tragos-con-red-bull": { categoryId: "tragos-con-red-bull", section: "menu" },
            "shots": { categoryId: "shots", section: "menu" },

            // Vinos
            "tintos": { categoryId: "tintos", section: "menu" },
            "blancos": { categoryId: "blancos", section: "menu" },
            "rosados": { categoryId: "rosados", section: "menu" },
            "copas-de-vino": { categoryId: "copas-de-vino", section: "menu" },

            // Botellas
            "gins": { categoryId: "gins", section: "menu" },
            "whiskies": { categoryId: "whiskies", section: "menu" },
            "vodkas": { categoryId: "vodkas", section: "menu" },
            "espumantes": { categoryId: "espumantes", section: "menu" },

            // Promociones
            "bebidas-promociones": { categoryId: "bebidas-promociones", section: "menu" },

            // Postres (mover a Principales > Otros)
            "postres": { categoryId: "otros", section: "menu" }
        }

        let updatedCount = 0
        for (const [oldCategoryId, newMapping] of Object.entries(categoryMappings)) {
            const result = await Product.updateMany(
                { categoryId: oldCategoryId },
                {
                    $set: {
                        categoryId: newMapping.categoryId,
                        section: newMapping.section
                    }
                }
            )
            if (result.modifiedCount > 0) {
                console.log(`✓ ${result.modifiedCount} productos migrados de "${oldCategoryId}" a "${newMapping.categoryId}"`)
                updatedCount += result.modifiedCount
            }
        }

        // PASO 7: Eliminar productos de categorías de test
        const testCategories = ["hamburguesas-test", "panchos-test"]
        for (const testCat of testCategories) {
            const result = await Product.deleteMany({ categoryId: testCat })
            if (result.deletedCount > 0) {
                console.log(`✓ ${result.deletedCount} productos de test eliminados de "${testCat}"`)
            }
        }

        // Contar resultados finales
        const finalCategoryCount = await Category.countDocuments({})
        const finalProductCount = await Product.countDocuments({})

        return NextResponse.json({
            success: true,
            message: "Menú reorganizado exitosamente",
            stats: {
                categoriesCreated: finalCategoryCount,
                productsUpdated: updatedCount,
                totalProducts: finalProductCount
            }
        })

    } catch (error) {
        console.error("Error reorganizando menú:", error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido"
            },
            { status: 500 }
        )
    }
}
