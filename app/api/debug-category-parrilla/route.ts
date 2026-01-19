import { NextResponse } from 'next/server'
import Category from '@/models/Category'
import connectDB from '@/lib/db'

export async function GET() {
    try {
        await connectDB()

        const parrillaCategory = await Category.findOne({ id: 'parrilla' }).lean()

        return NextResponse.json({
            exists: !!parrillaCategory,
            category: parrillaCategory || null
        })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
