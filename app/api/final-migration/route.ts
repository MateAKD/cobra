import { NextResponse } from "next/server"
import Product from "@/models/Product"
import connectDB from "@/lib/db"

// POST - Migración final de productos a subcategorías correctas
export async function POST() {
    try {
        await connectDB()

        let totalMoved = 0

        // 1. Mover productos de "parrilla" a "parrilla" (mantener en la misma categoría principal)
        // Los productos de parrilla ya están bien, solo verificar

        // 2. Mover productos de "principales" a sus subcategorías correspondientes
        // Estos 4 productos deberían ir a "otros" ya que no son milanesas, hamburguesas ni ensaladas
        const principalesProducts = await Product.find({ categoryId: "principales" }).lean()
        for (const product of principalesProducts) {
            // Verificar si es milanesa, hamburguesa o ensalada por el nombre
            const name = product.name.toLowerCase()
            let targetCategory = "otros"

            if (name.includes("milanesa")) {
                targetCategory = "milanesas"
            } else if (name.includes("hamburguesa") || name.includes("burger")) {
                targetCategory = "hamburguesas"
            } else if (name.includes("ensalada") || name.includes("salad")) {
                targetCategory = "ensaladas"
            }

            await Product.updateOne(
                { _id: product._id },
                { $set: { categoryId: targetCategory } }
            )
            totalMoved++
            console.log(`✓ "${product.name}" movido a "${targetCategory}"`)
        }

        // 3. Mover productos de "desayunos-y-meriendas" a "cafeteria" o "pasteleria"
        const desayunosProducts = await Product.find({ categoryId: "desayunos-y-meriendas" }).lean()
        for (const product of desayunosProducts) {
            const name = product.name.toLowerCase()
            let targetCategory = "pasteleria" // Por defecto pastelería

            // Si contiene palabras relacionadas con café, va a cafetería
            if (name.includes("espresso") || name.includes("cafe") || name.includes("cappuccino") ||
                name.includes("latte") || name.includes("americano") || name.includes("flat white")) {
                targetCategory = "cafeteria"
            }

            await Product.updateOne(
                { _id: product._id },
                { $set: { categoryId: targetCategory } }
            )
            totalMoved++
            console.log(`✓ "${product.name}" movido a "${targetCategory}"`)
        }

        // 4. Crear la promoción de tapeos que falta
        const tapeoPromoExists = await Product.findOne({
            categoryId: "bebidas-promociones",
            name: { $regex: /papas.*corona/i }
        })

        if (!tapeoPromoExists) {
            // Buscar si existe en tapeos
            const tapeoPromo = await Product.findOne({
                categoryId: "tapeos",
                name: { $regex: /papas.*corona/i }
            })

            if (tapeoPromo) {
                // Duplicar para promociones
                await Product.create({
                    id: `promo-${Date.now()}-tapeos`,
                    name: tapeoPromo.name,
                    description: tapeoPromo.description || "",
                    price: tapeoPromo.price,
                    categoryId: "bebidas-promociones",
                    section: "menu",
                    hidden: false,
                    tags: [],
                    order: 1
                })
                console.log(`✓ Promoción de tapeos creada`)
            }
        }

        return NextResponse.json({
            success: true,
            message: "Productos migrados a subcategorías correctas",
            stats: {
                productsMoved: totalMoved
            }
        })

    } catch (error) {
        console.error("Error en migración final:", error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido"
            },
            { status: 500 }
        )
    }
}
