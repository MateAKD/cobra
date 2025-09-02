import emailjs from '@emailjs/browser'

// Configuración de EmailJS
const EMAIL_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID',
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID',
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY',
  recipientEmail: process.env.NEXT_PUBLIC_RECIPIENT_EMAIL || 'matepedace@gmail.com'
}

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

// Función principal para enviar notificaciones por email
export const sendProductNotification = async (
  action: NotificationAction,
  product: ProductData,
  userInfo?: { ip?: string; userAgent?: string }
): Promise<boolean> => {
  try {
    // Preparar los datos para la plantilla de email
    const templateParams = {
      action: action,
      product_name: product.name,
      product_description: product.description || 'Sin descripción',
      product_price: product.price,
      product_section: getSectionDisplayName(product.section),
      product_tags: product.tags?.join(', ') || 'Sin etiquetas',
      timestamp: new Date().toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      recipient_email: EMAIL_CONFIG.recipientEmail,
      // Información adicional para tragos
      ingredients: product.ingredients || '',
      glass: product.glass || '',
      technique: product.technique || '',
      garnish: product.garnish || '',
      // Información de ocultación/mostrar
      reason: product.reason || '',
      hidden_by: product.hiddenBy || '',
      // Información del sistema
      user_ip: userInfo?.ip || 'No disponible',
      user_agent: userInfo?.userAgent || 'No disponible'
    }

    // Enviar el email usando EmailJS
    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateId,
      templateParams,
      EMAIL_CONFIG.publicKey
    )

    console.log('✅ Notificación enviada exitosamente:', {
      status: response.status,
      text: response.text,
      action,
      product: product.name
    })

    return true
  } catch (error) {
    console.error('❌ Error al enviar notificación por email:', error)
    return false
  }
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

// Función para validar la configuración de EmailJS
export const validateEmailConfig = (): boolean => {
  const { serviceId, templateId, publicKey } = EMAIL_CONFIG
  
  if (serviceId === 'YOUR_SERVICE_ID' || 
      templateId === 'YOUR_TEMPLATE_ID' || 
      publicKey === 'YOUR_PUBLIC_KEY') {
    console.warn('⚠️ EmailJS no está configurado correctamente. Por favor configura las variables de entorno.')
    return false
  }
  
  return true
}

// Función para obtener información del usuario/sistema
export const getUserInfo = (): { ip?: string; userAgent?: string } => {
  if (typeof window !== 'undefined') {
    return {
      userAgent: navigator.userAgent,
      // La IP se obtendría del servidor, aquí solo tenemos el user agent
    }
  }
  return {}
}
