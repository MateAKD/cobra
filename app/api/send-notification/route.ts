import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import NotificationLog from '@/models/NotificationLog'

// Tipos de acciones para las notificaciones
export type NotificationAction = 'AGREGAR' | 'EDITAR' | 'ELIMINAR' | 'OCULTAR' | 'MOSTRAR' | 'AGREGAR_HORARIO' | 'EDITAR_HORARIO'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, product, timeRange, userInfo } = body

    console.log('📝 Registrando notificación para resumen diario...')

    await connectDB()

    // Determinar tipo de notificación
    const isTimeRangeNotification = action === 'AGREGAR_HORARIO' || action === 'EDITAR_HORARIO'

    // Validar datos requeridos
    if (isTimeRangeNotification && !timeRange) {
      return NextResponse.json({ error: 'timeRange es requerido' }, { status: 400 })
    }
    if (!isTimeRangeNotification && !product) {
      return NextResponse.json({ error: 'product es requerido' }, { status: 400 })
    }

    // Guardar en la base de datos para el resumen diario
    const logEntry = new NotificationLog({
      action,
      type: isTimeRangeNotification ? 'TIME_RANGE' : 'PRODUCT',
      details: isTimeRangeNotification ? timeRange : product,
      userInfo,
      processed: false
    })

    await logEntry.save()

    console.log('✅ Notificación guardada en log:', logEntry._id)

    return NextResponse.json({
      success: true,
      message: 'Notificación registrada para resumen diario',
      logId: logEntry._id
    })

  } catch (error) {
    console.error('❌ Error al registrar notificación:', error)
    return NextResponse.json(
      {
        error: 'Error al registrar notificación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
