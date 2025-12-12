import { NextRequest, NextResponse } from 'next/server'
import Product from '@/models/Product'
import connectDB from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { section: string; id: string } }
) {
  try {
    const { section, id } = params
    const body = await request.json()
    const { hidden, reason, hiddenBy, timestamp } = body

    // Validar campos obligatorios
    if (typeof hidden !== 'boolean' || !reason || !hiddenBy) {
      return NextResponse.json(
        { error: 'Campos obligatorios: hidden, reason, hiddenBy' },
        { status: 400 }
      )
    }

    await connectDB()

    // Actualizar producto en DB
    // Buscamos por ID. La sección es útil para verificación pero el ID debería ser único.
    const updatedProduct = await Product.findOneAndUpdate(
      { id: id },
      {
        $set: {
          hidden: hidden,
          hiddenReason: reason,
          hiddenBy: hiddenBy,
          hiddenAt: timestamp
        }
      },
      { new: true } // Devolver el documento actualizado
    )

    if (!updatedProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Producto ${hidden ? 'ocultado' : 'mostrado'} exitosamente`,
      item: {
        id,
        section: updatedProduct.section,
        hidden: updatedProduct.hidden,
        reason: updatedProduct.hiddenReason,
        hiddenBy: updatedProduct.hiddenBy,
        timestamp: updatedProduct.hiddenAt
      }
    })

  } catch (error) {
    console.error('Error updating item visibility in DB:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
