import { NextResponse } from "next/server"
import Product from "@/models/Product"
import Category from "@/models/Category"
import connectDB from "@/lib/db"
import fs from "fs"
import path from "path"

// POST - Limpieza completa y migración desde cero
export async function POST() {
    try {
        await connectDB()

        console.log("🧹 PASO 1: Limpiando MongoDB...")

        // Eliminar TODOS los productos y categorías
        await Product.deleteMany({})
        await Category.deleteMany({})

        console.log("✓ MongoDB limpiado")

        console.log("📋 PASO 2: Creando estructura de categorías...")

        // Crear categorías principales
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

        // Crear subcategorías
        const subcategories = [
            { id: "guarniciones", name: "Guarniciones", parent: "parrilla", order: 1 },
            { id: "milanesas", name: "Milanesas", parent: "principales", order: 1 },
            { id: "hamburguesas", name: "Hamburguesas", parent: "principales", order: 2 },
            { id: "ensaladas", name: "Ensaladas", parent: "principales", order: 3 },
            { id: "otros", name: "Otros", parent: "principales", order: 4 },
            { id: "cafeteria", name: "Cafetería", parent: "desayunos-y-meriendas", order: 1 },
            { id: "pasteleria", name: "Pastelería", parent: "desayunos-y-meriendas", order: 2 },
            { id: "bebidas-sin-alcohol", name: "Bebidas sin alcohol", parent: "bebidas", order: 1 },
            { id: "cervezas", name: "Cervezas", parent: "bebidas", order: 2 },
            { id: "tragos-clasicos", name: "Tragos Clásicos", parent: "bebidas", order: 3 },
            { id: "especiales", name: "Tragos Especiales", parent: "bebidas", order: 4 },
            { id: "tragos-con-red-bull", name: "Tragos con Red Bull", parent: "bebidas", order: 5 },
            { id: "shots", name: "Shots", parent: "bebidas", order: 6 },
            { id: "vinos", name: "Vinos", parent: "bebidas", order: 7 },
            { id: "botellas", name: "Botellas", parent: "bebidas", order: 8 },
            { id: "cafe-promociones", name: "Café", parent: "promociones", order: 1 },
            { id: "tapeos-promociones", name: "Tapeos", parent: "promociones", order: 2 }
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

        // Sub-subcategorías de Vinos
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

        // Sub-subcategorías de Botellas
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

        console.log("✓ Categorías creadas")

        console.log("📦 PASO 3: Migrando productos desde menu.json...")

        // Leer menu.json
        const menuPath = path.join(process.cwd(), 'data', 'menu.json')
        const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'))

        // Mapeo de categorías antiguas a nuevas
        const categoryMapping: Record<string, string> = {
            "parrilla": "parrilla",
            "guarniciones": "guarniciones",
            "tapeo": "tapeos",
            "tapeos": "tapeos",
            "milanesas": "milanesas",
            "hamburguesas": "hamburguesas",
            "ensaladas": "ensaladas",
            "otros": "otros",
            "postres": "otros",
            "principales": "otros",
            "cafeteria": "cafeteria",
            "pasteleria": "pasteleria",
            "cafe": "cafe-promociones",
            "bebidas": "bebidas-sin-alcohol",
            "cervezas": "cervezas",
            "tragos-clasicos": "tragos-clasicos",
            "especiales": "especiales",
            "tragos-con-red-bull": "tragos-con-red-bull",
            "shots": "shots",
            "tintos": "tintos",
            "blancos": "blancos",
            "rosados": "rosados",
            "copas-de-vino": "copas-de-vino",
            "gins": "gins",
            "whiskies": "whiskies",
            "vodkas": "vodkas",
            "espumantes": "espumantes",
            "promociones": "cafe-promociones",
            "bebidas-promociones": "tapeos-promociones"
        }

        let productCount = 0
        const bulkOps: any[] = []

        // Procesar productos
        for (const [oldCategoryId, value] of Object.entries(menuData)) {
            if (Array.isArray(value)) {
                const newCategoryId = categoryMapping[oldCategoryId] || oldCategoryId

                value.forEach((item: any, index: number) => {
                    productCount++
                    bulkOps.push({
                        insertOne: {
                            document: {
                                id: item.id || `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                name: item.name,
                                description: item.description || '',
                                price: item.price,
                                categoryId: newCategoryId,
                                section: 'menu',
                                image: item.image,
                                visible: !item.hidden,
                                hidden: item.hidden || false,
                                hiddenReason: item.hiddenReason,
                                hiddenBy: item.hiddenBy,
                                hiddenAt: item.hiddenAt,
                                ingredients: item.ingredients,
                                tags: item.tags || [],
                                order: index,
                                glass: item.glass,
                                technique: item.technique,
                                garnish: item.garnish
                            }
                        }
                    })
                })
            }
        }

        if (bulkOps.length > 0) {
            await Product.bulkWrite(bulkOps)
        }

        console.log(`✓ ${productCount} productos migrados`)

        // Crear mapeo de subcategorías
        const subcategoryMapping: Record<string, string> = {}
        subcategories.forEach(sub => {
            subcategoryMapping[sub.id] = sub.parent
        })
        wineSubcategories.forEach(wine => {
            subcategoryMapping[wine.id] = wine.parent
        })
        bottleSubcategories.forEach(bottle => {
            subcategoryMapping[bottle.id] = bottle.parent
        })

        // Guardar mapeo
        const mappingPath = path.join(process.cwd(), 'data', 'subcategory-mapping.json')
        fs.writeFileSync(mappingPath, JSON.stringify(subcategoryMapping, null, 2))

        console.log("✓ Mapeo de subcategorías guardado")

        return NextResponse.json({
            success: true,
            message: "Migración completa exitosa",
            stats: {
                categoriesCreated: mainCategories.length + subcategories.length + wineSubcategories.length + bottleSubcategories.length,
                productsImported: productCount
            }
        })

    } catch (error) {
        console.error("❌ Error en migración completa:", error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido"
            },
            { status: 500 }
        )
    }
}
