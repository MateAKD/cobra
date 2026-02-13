import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json()
        const adminPassword = process.env.ADMIN_PASSWORD || 'cobra2025'

        if (password === adminPassword) {
            // En una app real usaríamos JWT o Cookies seguras.
            // Por ahora, devolvemos success y la API Key para que el frontend la use (temporalmente mejor que hardcodeada).
            return NextResponse.json({
                success: true,
                token: process.env.ADMIN_API_KEY || 'cobra_xi92_secure_KEY_2026'
            })
        }

        return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    } catch (error) {
        return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 })
    }
}
