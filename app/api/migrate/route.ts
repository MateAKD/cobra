import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Category from '@/models/Category'
import Product from '@/models/Product'
import fs from 'fs'
import path from 'path'

export async function POST() {
    try {
        await connectDB()

        // Leer archivos JSON
        const menuPath = path.join(process.cwd(), 'data', 'menu.json')
        const categoriesPath = path.join(process.cwd(), 'data', 'categories.json')

        const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8'))
        const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'))

        // Migrar categorías
        const categoryOps = Object.entries(categoriesData).map(([id, data]: [string, any]) => ({
            updateOne: {
                filter: { id },
                update: {
                    $set: {
                        id,
                        name: data.name,
                        description: data.description || '',
                        order: data.order || 0,
                        timeRestricted: data.timeRestricted || false,
                        startTime: data.startTime || '',
                        endTime: data.endTime || '',
                        visible: data.visible !== false
                    }
                },
                upsert: true
            }
        }))

        const catResult = await Category.bulkWrite(categoryOps)

        // Migrar productos
        const productOps: any[] = []

        Object.entries(menuData).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((item: any, index: number) => {
                    productOps.push({
                        updateOne: {
                            filter: { id: item.id },
                            update: {
                                $set: {
                                    id: item.id,
                                    name: item.name,
                                    description: item.description || '',
                                    price: item.price,
                                    categoryId: key,
                                    section: 'menu',
                                    image: item.image || '',
                                    visible: !item.hidden,
                                    hidden: item.hidden || false,
                                    hiddenReason: item.hiddenReason || '',
                                    hiddenBy: item.hiddenBy || '',
                                    ingredients: item.ingredients || '',
                                    tags: item.tags || [],
                                    order: index
                                }
                            },
                            upsert: true
                        }
                    })
                })
            } else if (typeof value === 'object') {
                Object.entries(value).forEach(([subKey, items]) => {
                    if (Array.isArray(items)) {
                        items.forEach((item: any, index: number) => {
                            productOps.push({
                                updateOne: {
                                    filter: { id: item.id },
                                    update: {
                                        $set: {
                                            id: item.id,
                                            name: item.name,
                                            description: item.description || '',
                                            price: item.price,
                                            categoryId: subKey,
                                            section: key,
                                            image: item.image || '',
                                            visible: !item.hidden,
                                            hidden: item.hidden || false,
                                            hiddenReason: item.hiddenReason || '',
                                            hiddenBy: item.hiddenBy || '',
                                            ingredients: item.ingredients || '',
                                            tags: item.tags || [],
                                            order: index
                                        }
                                    },
                                    upsert: true
                                }
                            })
                        })
                    }
                })
            }
        })

        const prodResult = await Product.bulkWrite(productOps)

        return NextResponse.json({
            success: true,
            categories: {
                upserted: catResult.upsertedCount,
                modified: catResult.modifiedCount
            },
            products: {
                upserted: prodResult.upsertedCount,
                modified: prodResult.modifiedCount
            }
        })

    } catch (error) {
        console.error('Migration error:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
