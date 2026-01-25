import { z } from 'zod'

/**
 * Validation schemas for API endpoints using Zod
 * Prevents NoSQL injection, XSS, and type confusion attacks
 */

// ============================================================================
// CATEGORY SCHEMAS
// ============================================================================

export const CategoryCreateSchema = z.object({
    id: z.string()
        .min(1, 'ID es requerido')
        .max(50, 'ID muy largo')
        .regex(/^[a-z0-9-]+$/, 'ID solo puede contener letras minúsculas, números y guiones'),
    name: z.string()
        .min(1, 'Nombre es requerido')
        .max(100, 'Nombre muy largo'),
    description: z.string()
        .max(500, 'Descripción muy larga')
        .optional()
        .default(''),
    order: z.number()
        .int('Order debe ser entero')
        .min(0, 'Order debe ser positivo')
        .optional()
        .default(0),
    timeRestricted: z.boolean()
        .optional()
        .default(false),
    startTime: z.string()
        .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
        .optional(),
    endTime: z.string()
        .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
        .optional(),
    visible: z.boolean()
        .optional()
        .default(true),
    isSubcategory: z.boolean()
        .optional()
        .default(false),
    parentCategory: z.string()
        .max(50)
        .optional(),
    image: z.string()
        .url('URL de imagen inválida')
        .optional()
})

export const CategoryUpdateSchema = CategoryCreateSchema.partial()

// Bulk category update (para reordenar múltiples categorías)
export const CategoryBulkUpdateSchema = z.record(
    z.string(), // categoryId
    z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        order: z.number().int().min(0),
        timeRestricted: z.boolean().optional(),
        startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        visible: z.boolean().optional()
    })
)

// ============================================================================
// PRODUCT SCHEMAS
// ============================================================================

export const ProductCreateSchema = z.object({
    id: z.string()
        .min(1, 'ID es requerido')
        .max(100, 'ID muy largo'),
    name: z.string()
        .min(1, 'Nombre es requerido')
        .max(200, 'Nombre muy largo'),
    description: z.string()
        .max(1000, 'Descripción muy larga')
        .optional(),
    price: z.string().regex(/^\d+([.,]\d{1,3})?$/, 'Precio inválido'),
    categoryId: z.string()
        .min(1, 'CategoryId es requerido')
        .max(50),
    section: z.string()
        .min(1, 'Section es requerida')
        .max(50),
    image: z.string()
        .url('URL de imagen inválida')
        .optional(),
    ingredients: z.string()
        .max(500)
        .optional(),
    glass: z.string()
        .max(100)
        .optional(),
    technique: z.string()
        .max(500)
        .optional(),
    garnish: z.string()
        .max(200)
        .optional(),
    tags: z.array(z.string().max(50))
        .optional()
        .default([]),
    hidden: z.boolean()
        .optional()
        .default(false),
    hiddenReason: z.string()
        .max(500)
        .optional(),
    hiddenBy: z.string()
        .max(100)
        .optional(),
    order: z.number()
        .int()
        .min(0)
        .optional()
        .default(0)
})

export const ProductUpdateSchema = ProductCreateSchema.partial()

// ============================================================================
// TIME RANGE SCHEMAS
// ============================================================================

export const TimeRangeSchema = z.object({
    categoryId: z.string().min(1).max(50),
    timeRestricted: z.boolean(),
    startTime: z.string()
        .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
    endTime: z.string()
        .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .optional()
}).refine(
    (data) => {
        // Si timeRestricted es true, startTime y endTime son requeridos
        if (data.timeRestricted) {
            return data.startTime !== undefined && data.endTime !== undefined
        }
        return true
    },
    {
        message: 'startTime y endTime son requeridos cuando timeRestricted es true'
    }
)

// ============================================================================
// REORDER SCHEMAS
// ============================================================================

export const CategoryReorderSchema = z.object({
    categories: z.array(
        z.object({
            id: z.string().min(1).max(50),
            order: z.number().int().min(0)
        })
    ).min(1, 'Al menos una categoría requerida')
})

export const SubcategoryReorderSchema = z.object({
    categoryId: z.string().min(1).max(50),
    subcategoryOrder: z.array(
        z.string().min(1).max(50)
    ).min(1, 'Al menos una subcategoría requerida')
})

export const SubcategoryMappingSchema = z.record(
    z.string()
        .min(1, 'Child ID no puede estar vacío')
        .max(50, 'Child ID muy largo'),
    z.string()
        .min(1, 'Parent ID no puede estar vacío')
        .max(50, 'Parent ID muy largo')
).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'Debe haber al menos un mapeo' }
).refine(
    (data) => Object.keys(data).length <= 100,
    { message: 'Máximo 100 mapeos permitidos' }
)

// ============================================================================
// TYPE EXPORTS (para usar en TypeScript)
// ============================================================================

export type CategoryCreate = z.infer<typeof CategoryCreateSchema>
export type CategoryUpdate = z.infer<typeof CategoryUpdateSchema>
export type ProductCreate = z.infer<typeof ProductCreateSchema>
export type ProductUpdate = z.infer<typeof ProductUpdateSchema>
export type TimeRange = z.infer<typeof TimeRangeSchema>
