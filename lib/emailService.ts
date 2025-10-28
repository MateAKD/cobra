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
    // Enviar la notificación a través de la API route
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        product,
        userInfo
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    console.log('✅ Notificación enviada exitosamente:', {
      messageId: result.messageId,
      action,
      product: product.name
    })

    return true
  } catch (error) {
    console.error('❌ Error al enviar notificación por email:', error)
    return false
  }
}

// Función para validar la configuración de Resend
export const validateEmailConfig = (): boolean => {
  // Esta función ahora solo valida en el cliente
  // La validación real se hace en el servidor
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