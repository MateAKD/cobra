import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Category from '@/models/Category'
import Product from '@/models/Product'

export async function GET() {
    try {
        await dbConnect()

        // Obtener la categoría parrilla
        const parrillaCategory = await Category.findOne({ id: 'parrilla' }).lean()

        // Obtener los productos de parrilla
        const parrillaProducts = await Product.find({ categoryId: 'parrilla' }).lean()

        return NextResponse.json({
            category: parrillaCategory,
            products: parrillaProducts.map(p => ({
                id: p.id,
                name: p.name,
                hidden: p.hidden,
                categoryId: p.categoryId
            })),
            productCount: parrillaProducts.length,
            visibleProductCount: parrillaProducts.filter((p: any) => !p.hidden).length
        })
    } catch (error) {
        console.error('Error in debug endpoint:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
