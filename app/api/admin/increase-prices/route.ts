import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/models/Product"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { percentage } = body

    // Validar que el porcentaje sea un número válido
    if (!percentage || isNaN(percentage) || percentage <= 0) {
      return NextResponse.json(
        { error: "El porcentaje debe ser un número mayor a 0" },
        { status: 400 }
      )
    }

    await connectDB()

    // 1. Obtener todos los productos
    const products = await Product.find({})

    // 2. Calcular nuevas operaciones
    const bulkOps: any[] = []

    products.forEach((product: any) => {
      // Precio puede ser string ("1.200") o number (1200)
      const priceStr = String(product.price)
      const cleanPrice = priceStr.replace(/[.,]/g, "")
      const numericPrice = parseFloat(cleanPrice)

      if (!isNaN(numericPrice)) {
        const newPriceVal = numericPrice * (1 + percentage / 100)
        // Formatear estilo AR
        const formattedPrice = Math.round(newPriceVal).toLocaleString("es-AR")

        bulkOps.push({
          updateOne: {
            filter: { _id: product._id },
            update: { $set: { price: formattedPrice } }
          }
        })
      }
    })

    if (bulkOps.length > 0) {
      await Product.bulkWrite(bulkOps)
    }

    return NextResponse.json({
      message: `Precios aumentados exitosamente en un ${percentage}% `,
      percentage: percentage,
      success: true,
      updatedCount: bulkOps.length
    })

  } catch (error) {
    console.error("Error al aumentar precios en DB:", error)
    return NextResponse.json(
      { error: "Error interno del servidor al procesar los precios" },
      { status: 500 }
    )
  }
}

