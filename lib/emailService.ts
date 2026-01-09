// Tipos de acciones para las notificaciones
export type NotificationAction = 'AGREGAR' | 'EDITAR' | 'ELIMINAR' | 'OCULTAR' | 'MOSTRAR' | 'AGREGAR_HORARIO' | 'EDITAR_HORARIO'

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

    console.log('✅ Notificación registrada exitosamente:', {
      logId: result.logId,
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

// Interface para los datos de horario de categoría
export interface TimeRangeNotificationData {
  categoryName: string
  categoryId: string
  timeRestricted: boolean
  startTime?: string
  endTime?: string
}

// Función para enviar notificaciones de horarios de categorías
export const sendTimeRangeNotification = async (
  action: 'AGREGAR_HORARIO' | 'EDITAR_HORARIO',
  timeRange: TimeRangeNotificationData,
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
        timeRange,
        userInfo
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    console.log('✅ Notificación de horario registrada exitosamente:', {
      logId: result.logId,
      action,
      category: timeRange.categoryName
    })

    return true
  } catch (error) {
    console.error('❌ Error al enviar notificación de horario por email:', error)
    return false
  }
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

// Export por defecto para asegurar compatibilidad con el build
export default {
  sendProductNotification,
  sendTimeRangeNotification,
  getUserInfo,
  validateEmailConfig
}