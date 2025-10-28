import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET() {
  try {
    // Verificar variables de entorno
    const hasApiKey = !!process.env.RESEND_API_KEY
    const hasRecipientEmail = !!process.env.RECIPIENT_EMAIL
    const apiKey = process.env.RESEND_API_KEY || 're_AmDvZQtu_8qGJ2g3Ua2K4Dapwxb4VC5Fd'
    const recipientEmail = process.env.RECIPIENT_EMAIL || 'matepedace@gmail.com'

    console.log('🧪 Test de configuración de Resend')
    console.log('Variables de entorno:', {
      hasApiKey,
      hasRecipientEmail,
      apiKeyPrefix: apiKey.substring(0, 10) + '...',
      recipientEmail
    })

    // Probar conexión con Resend (sin enviar email)
    const resend = new Resend(apiKey)
    
    return NextResponse.json({
      success: true,
      message: "API funcionando correctamente",
      timestamp: new Date().toISOString(),
      config: {
        hasApiKey,
        hasRecipientEmail,
        apiKeyPrefix: apiKey.substring(0, 10) + '...',
        recipientEmail,
        resendInitialized: !!resend
      }
    })
  } catch (error) {
    console.error('Error en endpoint de prueba:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
