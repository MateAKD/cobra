import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import connectDB from '@/lib/db'
import NotificationLog from '@/models/NotificationLog'

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Validar autorización (simple API key check si es necesario, o confiar en Vercel Cron headers)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Buscar notificaciones no procesadas
        const notifications = await NotificationLog.find({
            processed: false
        }).sort({ createdAt: 1 });

        if (notifications.length === 0) {
            console.log('ℹ️ No hay notificaciones pendientes para el resumen diario.');
            return NextResponse.json({ message: 'No notification pending' });
        }

        // Agrupar cambios por usuario (si es posible) o simplemente listarlos
        // Generar HTML del resumen
        const emailContent = generateDailySummaryEmail(notifications);

        // Enviar Email
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) throw new Error('RESEND_API_KEY missing');

        const resend = new Resend(apiKey);
        const recipientEmails = (process.env.RECIPIENT_EMAIL || 'matepedace@gmail.com').split(',').map(e => e.trim());

        const { data, error } = await resend.emails.send({
            from: 'COBRA Restaurant <notificaciones@cobramenu.com>',
            to: recipientEmails,
            subject: `📊 Resumen Diario de Cambios - ${new Date().toLocaleDateString('es-AR')}`,
            html: emailContent,
        });

        if (error) {
            console.error('Error sending email:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Marcar notificaciones como procesadas
        const notificationIds = notifications.map(n => n._id);
        await NotificationLog.updateMany(
            { _id: { $in: notificationIds } },
            { $set: { processed: true } }
        );

        return NextResponse.json({
            success: true,
            count: notifications.length,
            messageId: data?.id
        });

    } catch (error) {
        console.error('Error in daily summary cron:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function generateDailySummaryEmail(notifications: any[]) {
    const changesList = notifications.map(n => {
        const time = new Date(n.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        const user = n.userInfo?.userAgent ? 'Desde Admin' : 'Sistema'; // Simplified user attribution
        let details = '';

        if (n.type === 'PRODUCT') {
            const sectionName = getSectionDisplayName(n.details.section);
            details = `Producto: <strong>${n.details.name}</strong> (${sectionName}) - $${n.details.price}`;
        } else if (n.type === 'TIME_RANGE') {
            details = `Horario Categoría: <strong>${n.details.categoryName}</strong> - ${n.details.timeRestricted ? 'Activado' : 'Desactivado'}`;
        }

        return `
            <li style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                <span style="color: #666; font-size: 0.9em;">[${time}]</span> 
                <span style="font-weight: bold; color: #2c3e50;">${n.action}</span>
                <br/>
                ${details}
            </li>
        `;
    }).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            h1 { color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 15px; }
            .stats { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            ul { list-style: none; padding: 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📊 Resumen Diario de Cambios</h1>
            <p>Resumen de actividad de las últimas 24 horas.</p>
            
            <div class="stats">
                <strong>Total de cambios:</strong> ${notifications.length}
            </div>

            <ul>
                ${changesList}
            </ul>

            <p style="font-size: 0.8em; color: #999; margin-top: 30px;">
                Este reporte se genera automáticamente todos los días a las 23:45 HS.
            </p>
        </div>
    </body>
    </html>
    `;
}

// Función para obtener el nombre legible de la sección
const getSectionDisplayName = (section: string): string => {
    const sectionNames: Record<string, string> = {
        parrilla: 'Parrilla',
        guarniciones: 'Guarniciones',
        tapeo: 'Tapeo',
        milanesas: 'Milanesas',
        hamburguesas: 'Hamburguesas',
        ensaladas: 'Ensaladas',
        otros: 'Otros Platos',
        sandwicheria: 'Sandwichería',
        postres: 'Postres',
        cafeteria: 'Cafetería',
        pasteleria: 'Pastelería',
        bebidasSinAlcohol: 'Bebidas Sin Alcohol',
        cervezas: 'Cervezas',
        botellas: 'Botellas',
        tragosClasicos: 'Tragos Clásicos',
        tragosEspeciales: 'Tragos Especiales',
        tragosRedBull: 'Tragos con Red Bull',
        'vinos-tintos': 'Vinos Tintos',
        'vinos-blancos': 'Vinos Blancos',
        'vinos-rosados': 'Vinos Rosados',
        'vinos-copas': 'Copas de Vino',
        'promociones-cafe': 'Promociones de Café',
        'promociones-tapeos': 'Promociones de Tapeo',
        'promociones-bebidas': 'Promociones de Bebidas',
        tapas: 'Tapas',
        panes: 'Panes',
        tragos: 'Tragos de Autor',
        clasicos: 'Tragos Clásicos',
        sinAlcohol: 'Sin Alcohol'
    }
    return sectionNames[section] || section
}
