/**
 * Garbage Collection Script
 * Elimina permanentemente productos soft-deleted hace más de 90 días
 * 
 * Uso:
 *   npx tsx scripts/cleanup-deleted-products.ts
 *   npx tsx scripts/cleanup-deleted-products.ts --days=60
 *   npx tsx scripts/cleanup-deleted-products.ts --dry-run
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import mongoose from 'mongoose'
import Product from '../models/Product'

// Cargar variables de entorno
config({ path: resolve(__dirname, '../.env.local') })

// Configuración
const DEFAULT_RETENTION_DAYS = 90
const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI no está definida')
    console.error('   Asegúrate de que .env.local existe en la raíz del proyecto')
    process.exit(1)
}

interface CleanupStats {
    totalFound: number
    totalDeleted: number
    deletedProducts: Array<{
        id: string
        name: string
        deletedAt: Date
        daysSinceDeletion: number
    }>
}

async function cleanupDeletedProducts(
    retentionDays: number = DEFAULT_RETENTION_DAYS,
    dryRun: boolean = false
): Promise<CleanupStats> {
    try {
        // Conectar a MongoDB
        await mongoose.connect(MONGODB_URI)
        console.log('✅ Conectado a MongoDB')

        // Calcular fecha límite (hace X días)
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

        console.log(`\n📅 Fecha límite: ${cutoffDate.toISOString()}`)
        console.log(`🗑️  Buscando productos eliminados hace más de ${retentionDays} días...\n`)

        // Buscar productos a eliminar
        const productsToDelete = await Product.find({
            deletedAt: { $ne: null, $lt: cutoffDate }
        }).lean()

        const stats: CleanupStats = {
            totalFound: productsToDelete.length,
            totalDeleted: 0,
            deletedProducts: []
        }

        if (productsToDelete.length === 0) {
            console.log('✨ No hay productos para limpiar')
            return stats
        }

        // Mostrar productos encontrados
        console.log(`🔍 Encontrados ${productsToDelete.length} productos:\n`)

        productsToDelete.forEach((product: any) => {
            const daysSince = Math.floor(
                (Date.now() - new Date(product.deletedAt).getTime()) / (1000 * 60 * 60 * 24)
            )

            console.log(`  - ${product.name} (ID: ${product.id})`)
            console.log(`    Eliminado: ${new Date(product.deletedAt).toISOString()}`)
            console.log(`    Días desde eliminación: ${daysSince}`)
            console.log()

            stats.deletedProducts.push({
                id: product.id,
                name: product.name,
                deletedAt: new Date(product.deletedAt),
                daysSinceDeletion: daysSince
            })
        })

        if (dryRun) {
            console.log('🔍 DRY RUN - No se eliminó nada')
            console.log('   Ejecuta sin --dry-run para eliminar permanentemente')
        } else {
            // Eliminar permanentemente
            const result = await Product.deleteMany({
                deletedAt: { $ne: null, $lt: cutoffDate }
            })

            stats.totalDeleted = result.deletedCount || 0

            console.log(`\n✅ Eliminados permanentemente: ${stats.totalDeleted} productos`)
            console.log(`💾 Espacio liberado en base de datos`)
        }

        return stats

    } catch (error) {
        console.error('❌ Error durante cleanup:', error)
        throw error
    } finally {
        await mongoose.disconnect()
        console.log('\n👋 Desconectado de MongoDB')
    }
}

// CLI Handler
async function main() {
    const args = process.argv.slice(2)

    // Parse arguments
    let retentionDays = DEFAULT_RETENTION_DAYS
    let dryRun = false

    args.forEach(arg => {
        if (arg.startsWith('--days=')) {
            retentionDays = parseInt(arg.split('=')[1], 10)
        }
        if (arg === '--dry-run') {
            dryRun = true
        }
    })

    console.log('🗑️  Garbage Collection - Productos Eliminados')
    console.log('━'.repeat(50))
    console.log(`⏰ Retención: ${retentionDays} días`)
    console.log(`🔍 Modo: ${dryRun ? 'DRY RUN (simulación)' : 'PRODUCCIÓN'}`)
    console.log('━'.repeat(50))

    const stats = await cleanupDeletedProducts(retentionDays, dryRun)

    console.log('\n📊 Resumen:')
    console.log(`   Encontrados: ${stats.totalFound}`)
    console.log(`   Eliminados: ${stats.totalDeleted}`)

    process.exit(0)
}

// Ejecutar main() directamente cuando se ejecuta el script
main().catch(error => {
    console.error('Error fatal:', error)
    process.exit(1)
})

export { cleanupDeletedProducts }

