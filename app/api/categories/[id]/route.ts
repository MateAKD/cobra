import { NextRequest, NextResponse } from 'next/server'
import Category from '@/models/Category'
import Product from '@/models/Product'
import connectDB from '@/lib/db'
import { revalidatePath } from 'next/cache'

// DELETE - Eliminar una categoría específica
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        await connectDB()
        const { id } = params

        // Primero, eliminar todos los productos asociados a esta categoría
        const deletedProducts = await Product.deleteMany({
            $or: [
                { categoryId: id },
                { section: id }
            ]
        })

        // Luego, eliminar todas las subcategorías que tienen esta categoría como padre
        const deletedSubcategories = await Category.deleteMany({
            parentCategory: id
        })

        // Finalmente, eliminar la categoría principal
        const deletedCategory = await Category.deleteOne({ id: id })

        if (deletedCategory.deletedCount === 0) {
            return NextResponse.json(
                { error: 'Categoría no encontrada' },
                { status: 404 }
            )
        }

        // Force revalidation of menu and admin pages
        revalidatePath('/menu')
        revalidatePath('/admin')
        revalidatePath('/api/categories')

        return NextResponse.json({
            success: true,
            message: 'Categoría eliminada exitosamente',
            deletedProducts: deletedProducts.deletedCount,
            deletedSubcategories: deletedSubcategories.deletedCount
        })
    } catch (error) {
        console.error('Error deleting category from DB:', error)
        return NextResponse.json(
            { error: 'Error al eliminar la categoría' },
            { status: 500 }
        )
    }
}
