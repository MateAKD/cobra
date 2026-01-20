import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/models/Product"

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/cleanup-deleted
 * Ejecuta garbage collection de productos soft-deleted
 * 
 * Body (opcional):
 *   { "retentionDays": 90, "dryRun": false }
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB()

        const body = await request.json().catch(() => ({}))
        const retentionDays = body.retentionDays || 90
        const dryRun = body.dryRun || false

        // Validar retentionDays
        if (retentionDays < 1 || retentionDays > 365) {
            return NextResponse.json(
                { error: 'retentionDays debe estar entre 1 y 365' },
                { status: 400 }
            )
        }

        // Calcular fecha límite
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

        // Buscar productos a eliminar
        const productsToDelete = await Product.find({
            deletedAt: { $ne: null, $lt: cutoffDate }
        }).select('id name deletedAt deletedBy').lean()

        if (productsToDelete.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No hay productos para limpiar',
                stats: {
                    found: 0,
                    deleted: 0
                }
            })
        }

        // Preparar datos de productos
        const productDetails = productsToDelete.map((p: any) => ({
            id: p.id,
            name: p.name,
            deletedAt: p.deletedAt,
            deletedBy: p.deletedBy,
            daysSinceDeletion: Math.floor(
                (Date.now() - new Date(p.deletedAt).getTime()) / (1000 * 60 * 60 * 24)
            )
        }))

        let deletedCount = 0

        if (!dryRun) {
            // Eliminar permanentemente
            const result = await Product.deleteMany({
                deletedAt: { $ne: null, $lt: cutoffDate }
            })
            deletedCount = result.deletedCount || 0
        }

        return NextResponse.json({
            success: true,
            message: dryRun
                ? `Simulación: ${productsToDelete.length} productos serían eliminados`
                : `${deletedCount} productos eliminados permanentemente`,
            stats: {
                found: productsToDelete.length,
                deleted: deletedCount,
                dryRun
            },
            products: productDetails,
            cutoffDate: cutoffDate.toISOString(),
            retentionDays
        })

    } catch (error) {
        console.error('Error en cleanup:', error)
        return NextResponse.json(
            { error: 'Error al ejecutar limpieza' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/admin/cleanup-deleted
 * Obtiene estadísticas sin eliminar nada (dry run)
 */
export async function GET() {
    try {
        await connectDB()

        const retentionDays = 90
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

        // Contar productos a limpiar
        const count = await Product.countDocuments({
            deletedAt: { $ne: null, $lt: cutoffDate }
        })

        // Obtener productos más antiguos
        const oldestDeleted = await Product.find({
            deletedAt: { $ne: null }
        })
            .sort({ deletedAt: 1 })
            .limit(5)
            .select('id name deletedAt')
            .lean()

        return NextResponse.json({
            stats: {
                totalSoftDeleted: await Product.countDocuments({ deletedAt: { $ne: null } }),
                readyForCleanup: count,
                retentionDays,
                cutoffDate: cutoffDate.toISOString()
            },
            oldestProducts: oldestDeleted.map((p: any) => ({
                id: p.id,
                name: p.name,
                deletedAt: p.deletedAt,
                daysSinceDeletion: Math.floor(
                    (Date.now() - new Date(p.deletedAt).getTime()) / (1000 * 60 * 60 * 24)
                )
            }))
        })

    } catch (error) {
        console.error('Error obteniendo stats:', error)
        return NextResponse.json(
            { error: 'Error al obtener estadísticas' },
            { status: 500 }
        )
    }
}
