import { NextRequest, NextResponse } from "next/server"
import { validateAdminAuth } from "@/lib/auth"

export async function GET() {
  return NextResponse.json({
    message: "API del Panel de Administración - COBRA",
    status: "active"
  })
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, errorResponse } = validateAdminAuth(request)
    if (!authorized) return errorResponse

    const body = await request.json()

    // Aquí implementarías la lógica para guardar en base de datos
    console.log("Datos recibidos:", body)

    return NextResponse.json({
      message: "Elemento guardado exitosamente",
      data: body
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}
