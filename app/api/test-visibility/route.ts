import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Verificar que el archivo existe
    const dataPath = path.join(process.cwd(), 'data', 'menu.json')
    const fileExists = fs.existsSync(dataPath)
    
    if (!fileExists) {
      return NextResponse.json({
        error: 'Archivo menu.json no encontrado',
        path: dataPath
      }, { status: 404 })
    }

    // Verificar permisos de lectura
    try {
      const data = fs.readFileSync(dataPath, 'utf8')
      const parsed = JSON.parse(data)
      
      return NextResponse.json({
        success: true,
        message: "Archivo menu.json accesible",
        fileSize: data.length,
        sections: Object.keys(parsed),
        sampleItem: parsed.parrilla?.[0] || 'No hay items en parrilla'
      })
    } catch (readError) {
      return NextResponse.json({
        error: 'Error al leer el archivo',
        details: readError instanceof Error ? readError.message : 'Error desconocido'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error en endpoint de prueba de visibilidad:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { section, id, hidden, reason, hiddenBy } = body
    
    // Simular la lógica de visibilidad sin modificar el archivo
    const dataPath = path.join(process.cwd(), 'data', 'menu.json')
    const data = fs.readFileSync(dataPath, 'utf8')
    const menuData = JSON.parse(data)
    
    // Buscar el item
    let itemFound = false
    if (menuData[section] && Array.isArray(menuData[section])) {
      const item = menuData[section].find((item: any) => item.id === id)
      if (item) {
        itemFound = true
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Prueba de visibilidad exitosa",
      itemFound,
      section,
      id,
      hidden,
      reason,
      hiddenBy,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error en POST de prueba de visibilidad:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
