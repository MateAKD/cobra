import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/**
 * Centralized error handling utilities
 * Prevents information disclosure in production
 */

interface ErrorResponse {
    error: string
    details?: any
    timestamp: string
}

/**
 * Handle errors in API routes with production-safe messages
 */
export function handleApiError(error: unknown, context?: string): NextResponse<ErrorResponse> {
    const timestamp = new Date().toISOString()
    const isProduction = process.env.NODE_ENV === 'production'

    // Zod validation errors (400 Bad Request)
    if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
        }))

        return NextResponse.json(
            {
                error: 'Datos de entrada inválidos',
                details: formattedErrors, // Safe to expose validation errors
                timestamp
            },
            { status: 400 }
        )
    }

    // MongoDB duplicate key error (409 Conflict)
    if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
        return NextResponse.json(
            {
                error: 'El elemento ya existe',
                details: isProduction ? undefined : (error as any).keyValue,
                timestamp
            },
            { status: 409 }
        )
    }

    // Generic errors (500 Internal Server Error)
    // SECURITY: Never expose error.message or stack in production
    console.error(`[API Error] ${context || 'Unknown context'}:`, error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    return NextResponse.json(
        {
            error: isProduction
                ? 'Error interno del servidor'
                : `Error: ${errorMessage}`,
            details: isProduction ? undefined : {
                message: errorMessage,
                context,
                stack: error instanceof Error ? error.stack : undefined
            },
            timestamp
        },
        { status: 500 }
    )
}

/**
 * Wrapper for API route handlers with error handling
 */
export function withErrorHandling<T>(
    handler: () => Promise<T>,
    context: string
): Promise<T | NextResponse<ErrorResponse>> {
    return handler().catch((error) => handleApiError(error, context))
}

/**
 * Validate request body with Zod schema
 * Throws ZodError if validation fails (caught by handleApiError)
 */
export async function validateRequestBody<T>(
    request: Request,
    schema: { parse: (data: unknown) => T }
): Promise<T> {
    const body = await request.json()
    return schema.parse(body) // Throws ZodError if invalid
}
