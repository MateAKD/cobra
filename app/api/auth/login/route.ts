import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json()

        const passwordHash = process.env.ADMIN_PASSWORD_HASH

        if (!passwordHash) {
            console.error('🚨 SEGURIDAD CRÍTICA: ADMIN_PASSWORD_HASH no está configurado en el entorno.')
            return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 })
        }

        const isValid = await bcrypt.compare(password, passwordHash)

        if (!isValid) {
            return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
        }

        const token = process.env.ADMIN_API_KEY
        if (!token) {
            console.error('🚨 SEGURIDAD CRÍTICA: ADMIN_API_KEY no está configurado en el entorno.')
            return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 })
        }

        return NextResponse.json({ success: true, token })

    } catch (error) {
        return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 })
    }
}
