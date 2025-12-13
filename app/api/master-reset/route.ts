import { NextResponse } from "next/server"
import Product from "@/models/Product"
import Category from "@/models/Category"
import connectDB from "@/lib/db"
import fs from "fs"
import path from "path"

// POST - Reset completo y reimportación desde menu.json
export async function POST() {
    try {
        await connectDB()

        console.log("🔄 MASTER RESET: Iniciando...")

        // ============================================
        // PASO 1: ELIMINAR TODO
        // ============================================
        console.log("🗑️ Eliminando todos los productos y categorías...")
        await Product.deleteMany({})
        await Category.deleteMany({})
        console.log("✓ Base de datos limpia")

        // ============================================
        // PASO 2: CREAR CATEGORÍAS PRINCIPALES
        // ============================================
        console.log("📂 Creando categorías principales...")
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
                order: cat.order,
                visible: true,
                isSubcategory: false
            })
        }
        console.log("✓ 6 categorías principales creadas")

        // ============================================
        // PASO 3: CREAR SUBCATEGORÍAS
        // ============================================
        console.log("📁 Creando subcategorías...")
        const subcategories = [
            // Parrilla
            { id: "guarniciones", name: "Guarniciones", parent: "parrilla", order: 1 },
            // Principales
            { id: "milanesas", name: "Milanesas", parent: "principales", order: 1 },
            { id: "hamburguesas", name: "Hamburguesas", parent: "principales", order: 2 },
            { id: "ensaladas", name: "Ensaladas", parent: "principales", order: 3 },
            { id: "otros", name: "Otros", parent: "principales", order: 4 },
            // Desayunos
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
            // Sub-subcategorías de Vinos
            { id: "tintos", name: "Tintos", parent: "vinos", order: 1 },
            { id: "blancos", name: "Blancos", parent: "vinos", order: 2 },
            { id: "rosados", name: "Rosados", parent: "vinos", order: 3 },
            { id: "copas-de-vino", name: "Copas de vino", parent: "vinos", order: 4 },
            // Sub-subcategorías de Botellas
            { id: "gins", name: "Gins", parent: "botellas", order: 1 },
            { id: "whiskies", name: "Whiskies", parent: "botellas", order: 2 },
            { id: "vodkas", name: "Vodkas", parent: "botellas", order: 3 },
            { id: "espumantes", name: "Espumantes", parent: "botellas", order: 4 },
            // Promociones
            { id: "cafe-promociones", name: "Café", parent: "promociones", order: 1 },
            { id: "tapeos-promociones", name: "Tapeos", parent: "promociones", order: 2 }
        ]

        for (const sub of subcategories) {
            await Category.create({
                id: sub.id,
                name: sub.name,
                order: sub.order,
                visible: true,
                isSubcategory: true,
                parentCategory: sub.parent
            })
        }
        console.log(`✓ ${subcategories.length} subcategorías creadas`)

        // ============================================
        // PASO 4: MAPEO COMPLETO DE CATEGORÍAS
        // ============================================
        const categoryMapping: Record<string, string> = {
            // Mappings directos
            "parrilla": "parrilla",
            "guarniciones": "guarniciones",
            "tapeo": "tapeos",
            "tapeos": "tapeos",
            "milanesas": "milanesas",
            "hamburguesas": "hamburguesas",
            "ensaladas": "ensaladas",
            "otros": "otros",
            "postres": "otros",
            "cafeteria": "cafeteria",
            "pasteleria": "pasteleria",
            "cafe": "cafeteria",

            // Bebidas
            "licuados-y-jugos": "bebidas-sin-alcohol",
            "bebidas": "bebidas-sin-alcohol",
            "bebidas-sin-alcohol": "bebidas-sin-alcohol",
            "cervezas": "cervezas",
            "tragos-clasicos": "tragos-clasicos",
            "especiales": "especiales",
            "tragos-con-red-bull": "tragos-con-red-bull",
            "shots": "shots",

            // Vinos
            "tintos": "tintos",
            "blancos": "blancos",
            "rosados": "rosados",
            "copas-de-vino": "copas-de-vino",
            "vinos-tintos": "tintos",

            // Botellas
            "gins": "gins",
            "whiskies": "whiskies",
            "vodkas": "vodkas",
            "espumantes": "espumantes",

            // Promociones
            "cafe-promociones": "cafe-promociones",
            "tapeos-promociones": "tapeos-promociones",
            "promociones": "cafe-promociones",

            // Casos especiales de IDs viejos
            "de-12-a-16-hs-menu": "parrilla",
            "guarniciones-menu": "guarniciones",
            "desayunos-y-meriendas": "cafeteria",
            "principales": "otros"
        }

        // ============================================
        // PASO 5: LEER E IMPORTAR PRODUCTOS
        // ============================================
        console.log("📦 Leyendo menu.json...")
        const menuPath = path.join(process.cwd(), 'data', 'menu.json')
        const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'))

        const bulkOps: any[] = []
        let productCount = 0

        // Función recursiva para procesar objetos anidados
        function processItems(items: any[], sourceCategoryId: string) {
            const targetCategoryId = categoryMapping[sourceCategoryId] || sourceCategoryId

            items.forEach((item: any, index: number) => {
                productCount++
                bulkOps.push({
                    insertOne: {
                        document: {
                            id: item.id || `product-${Date.now()}-${productCount}`,
                            name: item.name,
                            description: item.description || '',
                            price: item.price,
                            categoryId: targetCategoryId,
                            section: 'menu',
                            image: item.image,
                            visible: !item.hidden,
                            hidden: item.hidden || false,
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

        // Procesar cada sección del menu.json
        for (const [key, value] of Object.entries(menuData)) {
            if (Array.isArray(value)) {
                // Es un array directo de productos
                processItems(value, key)
            } else if (typeof value === 'object' && value !== null) {
                // Es un objeto con subcategorías (ej: vinos, promociones)
                for (const [subKey, subValue] of Object.entries(value)) {
                    if (Array.isArray(subValue)) {
                        processItems(subValue, subKey)
                    }
                }
            }
        }

        if (bulkOps.length > 0) {
            await Product.bulkWrite(bulkOps)
        }
        console.log(`✓ ${productCount} productos importados`)

        // ============================================
        // PASO 6: GUARDAR MAPEO DE SUBCATEGORÍAS
        // ============================================
        const subcategoryMappingData: Record<string, string> = {}
        subcategories.forEach(sub => {
            subcategoryMappingData[sub.id] = sub.parent
        })

        const mappingPath = path.join(process.cwd(), 'data', 'subcategory-mapping.json')
        fs.writeFileSync(mappingPath, JSON.stringify(subcategoryMappingData, null, 2))
        console.log("✓ Mapeo de subcategorías guardado")

        // ============================================
        // RESULTADO FINAL
        // ============================================
        const totalCategories = await Category.countDocuments({})
        const totalProducts = await Product.countDocuments({})

        return NextResponse.json({
            success: true,
            message: "🎉 MASTER RESET completado exitosamente",
            stats: {
                categoriesCreated: totalCategories,
                productsImported: totalProducts
            }
        })

    } catch (error) {
        console.error("❌ Error en MASTER RESET:", error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido"
            },
            { status: 500 }
        )
    }
}
