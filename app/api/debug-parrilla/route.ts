import { NextResponse } from 'next/server'
import Product from '@/models/Product'
import connectDB from '@/lib/db'

export async function GET() {
    try {
        await connectDB()

        const parrillaProducts = await Product.find({
            categoryId: 'parrilla',
            deletedAt: null
        }).lean()

        return NextResponse.json({
            total: parrillaProducts.length,
            products: parrillaProducts.map((p: any) => ({
                id: p.id,
                name: p.name,
                hidden: p.hidden,
                section: p.section,
                categoryId: p.categoryId
            }))
        })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
