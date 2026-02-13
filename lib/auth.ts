import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates the authorization header against the ADMIN_API_KEY or CRON_SECRET.
 * This is a basic protection layer for administrative endpoints.
 */
export function validateAdminAuth(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_API_KEY || process.env.CRON_SECRET;

    console.log(`[AUTH DEBUG] Validating request to ${request.url}`);
    console.log(`[AUTH DEBUG] Encoded Key Length: ${adminKey ? adminKey.length : 0}`);
    console.log(`[AUTH DEBUG] Auth Header: ${authHeader}`);

    // In production, we MUST have a key defined
    if (!adminKey) {
        console.error('🚨 SECURITY CRITICAL: ADMIN_API_KEY/CRON_SECRET not defined');
        // We only allow bypassing in development if NO key is set (convenience, but risky)
        if (process.env.NODE_ENV === 'production') {
            return { authorized: false, errorResponse: NextResponse.json({ error: 'System misconfigured: Auth key missing' }, { status: 500 }) };
        }
    }



    if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
        console.warn(`[AUTH FAIL] Invalid header. Received: '${authHeader}'. Expected: 'Bearer ${adminKey?.substring(0, 5)}...'`);
        return {
            authorized: false,
            errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        };
    }

    return { authorized: true };
}
