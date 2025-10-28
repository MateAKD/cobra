import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Tipos de acciones para las notificaciones
export type NotificationAction = 'AGREGAR' | 'EDITAR' | 'ELIMINAR' | 'OCULTAR' | 'MOSTRAR'

// Interface para los datos del producto
interface ProductData {
  name: string
  description?: string
  price: string
  section: string
  tags?: string[]
  ingredients?: string
  glass?: string
  technique?: string
  garnish?: string
  reason?: string
  hiddenBy?: string
}

// Función para generar el contenido HTML del email
const generateEmailContent = (
  action: NotificationAction,
  product: ProductData,
  userInfo?: { ip?: string; userAgent?: string }
): string => {
  const timestamp = new Date().toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Notificación COBRA</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #e9ecef;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e9ecef;
        }
        .detail-row {
          display: flex;
          margin-bottom: 8px;
          padding: 5px 0;
        }
        .detail-label {
          font-weight: bold;
          color: #495057;
          min-width: 120px;
          margin-right: 10px;
        }
        .detail-value {
          color: #6c757d;
          flex: 1;
        }
        .action-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .action-agregar { background: #d4edda; color: #155724; }
        .action-editar { background: #fff3cd; color: #856404; }
        .action-eliminar { background: #f8d7da; color: #721c24; }
        .action-ocultar { background: #e2e3e5; color: #383d41; }
        .action-mostrar { background: #cce5ff; color: #004085; }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
        }
        .system-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🐍 COBRA</div>
          <p style="margin: 0; color: #6c757d;">Sistema de Notificaciones</p>
        </div>

        <div class="section">
          <div class="section-title">📋 Detalles del Cambio</div>
          
          <div class="detail-row">
            <span class="detail-label">Acción:</span>
            <span class="detail-value">
              <span class="action-badge action-${action.toLowerCase()}">${action}</span>
            </span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Producto:</span>
            <span class="detail-value"><strong>${product.name}</strong></span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Descripción:</span>
            <span class="detail-value">${product.description || 'Sin descripción'}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Precio:</span>
            <span class="detail-value"><strong>$${product.price}</strong></span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Sección:</span>
            <span class="detail-value">${getSectionDisplayName(product.section)}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Etiquetas:</span>
            <span class="detail-value">${product.tags?.join(', ') || 'Sin etiquetas'}</span>
          </div>

          ${product.reason ? `
          <div class="detail-row">
            <span class="detail-label">Motivo:</span>
            <span class="detail-value">${product.reason}</span>
          </div>
          ` : ''}

          ${product.hiddenBy ? `
          <div class="detail-row">
            <span class="detail-label">${action === 'OCULTAR' ? 'Ocultado por:' : 'Mostrado por:'}</span>
            <span class="detail-value">${product.hiddenBy}</span>
          </div>
          ` : ''}

          ${product.ingredients ? `
          <div class="detail-row">
            <span class="detail-label">Ingredientes:</span>
            <span class="detail-value">${product.ingredients}</span>
          </div>
          ` : ''}

          ${product.glass ? `
          <div class="detail-row">
            <span class="detail-label">Vaso:</span>
            <span class="detail-value">${product.glass}</span>
          </div>
          ` : ''}

          ${product.technique ? `
          <div class="detail-row">
            <span class="detail-label">Técnica:</span>
            <span class="detail-value">${product.technique}</span>
          </div>
          ` : ''}

          ${product.garnish ? `
          <div class="detail-row">
            <span class="detail-label">Garnish:</span>
            <span class="detail-value">${product.garnish}</span>
          </div>
          ` : ''}
        </div>

        <div class="system-info">
          <div class="section-title">📊 Información del Sistema</div>
          
          <div class="detail-row">
            <span class="detail-label">Fecha y Hora:</span>
            <span class="detail-value">${timestamp}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">User Agent:</span>
            <span class="detail-value">${userInfo?.userAgent || 'No disponible'}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">IP:</span>
            <span class="detail-value">${userInfo?.ip || 'No disponible'}</span>
          </div>
        </div>

        <div class="footer">
          <p>Este email fue generado automáticamente por el Panel de Administración de COBRA.</p>
          <p><strong>Sistema de Notificaciones COBRA</strong></p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Función para obtener el nombre legible de la sección
const getSectionDisplayName = (section: string): string => {
  const sectionNames: Record<string, string> = {
    // Comidas
    parrilla: 'Parrilla',
    guarniciones: 'Guarniciones',
    tapeo: 'Tapeo',
    milanesas: 'Milanesas',
    hamburguesas: 'Hamburguesas',
    ensaladas: 'Ensaladas',
    otros: 'Otros Platos',
    sandwicheria: 'Sandwichería',
    postres: 'Postres',
    // Cafetería
    cafeteria: 'Cafetería',
    pasteleria: 'Pastelería',
    // Bebidas
    bebidasSinAlcohol: 'Bebidas Sin Alcohol',
    cervezas: 'Cervezas',
    botellas: 'Botellas',
    // Tragos
    tragosClasicos: 'Tragos Clásicos',
    tragosEspeciales: 'Tragos Especiales',
    tragosRedBull: 'Tragos con Red Bull',
    // Vinos
    'vinos-tintos': 'Vinos Tintos',
    'vinos-blancos': 'Vinos Blancos',
    'vinos-rosados': 'Vinos Rosados',
    'vinos-copas': 'Copas de Vino',
    // Promociones
    'promociones-cafe': 'Promociones de Café',
    'promociones-tapeos': 'Promociones de Tapeo',
    'promociones-bebidas': 'Promociones de Bebidas',
    // Secciones legacy
    tapas: 'Tapas',
    panes: 'Panes',
    tragos: 'Tragos de Autor',
    clasicos: 'Tragos Clásicos',
    sinAlcohol: 'Sin Alcohol'
  }

  return sectionNames[section] || section
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, product, userInfo } = body

    console.log('📧 Iniciando envío de notificación por email...')
    console.log('📋 Variables de entorno disponibles:', {
      hasApiKey: !!process.env.RESEND_API_KEY,
      hasRecipientEmail: !!process.env.RECIPIENT_EMAIL,
      recipientEmail: process.env.RECIPIENT_EMAIL
    })

    // Obtener la API key de Resend
    const apiKey = process.env.RESEND_API_KEY || 're_AmDvZQtu_8qGJ2g3Ua2K4Dapwxb4VC5Fd'
    
    // Validar que tenemos la API key de Resend
    if (!apiKey || apiKey === '') {
      console.error('❌ RESEND_API_KEY no está configurada')
      return NextResponse.json(
        { error: 'RESEND_API_KEY no está configurada correctamente' },
        { status: 500 }
      )
    }

    console.log('✅ API Key encontrada:', apiKey.substring(0, 10) + '...')

    // Crear instancia de Resend dentro de la función
    const resend = new Resend(apiKey)

    // Preparar el contenido del email
    const emailContent = generateEmailContent(action, product, userInfo)
    
    // Obtener el email destinatario de las variables de entorno
    const recipientEmail = process.env.RECIPIENT_EMAIL || 'matepedace@gmail.com'
    
    // Enviar el email usando Resend
    const response = await resend.emails.send({
      from: 'COBRA Restaurant <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: `🔔 Cambio en el Menú COBRA - ${action}`,
      html: emailContent,
    })

    console.log('✅ Notificación enviada exitosamente:', {
      id: response.data?.id,
      action,
      product: product.name,
      to: recipientEmail,
      from: 'COBRA Restaurant <onboarding@resend.dev>',
      response: response
    })

    return NextResponse.json({ 
      success: true, 
      messageId: response.data?.id 
    })

  } catch (error) {
    console.error('❌ Error al enviar notificación por email:', error)
    console.error('📊 Detalles del error:', {
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      fullError: JSON.stringify(error, null, 2)
    })
    return NextResponse.json(
      { 
        error: 'Error al enviar notificación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
