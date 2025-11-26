import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Función para leer el archivo de datos
const readMenuData = () => {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'menu.json')
    const data = fs.readFileSync(dataPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading menu data:', error)
    return null
  }
}

// Función para escribir el archivo de datos
const writeMenuData = (data: any) => {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'menu.json')
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error('Error writing menu data:', error)
    return false
  }
}

// Función para encontrar y actualizar un item en cualquier sección
const findAndUpdateItem = (menuData: any, section: string, id: string, updates: any) => {
  // Buscar en secciones simples
  if (menuData[section] && Array.isArray(menuData[section])) {
    const itemIndex = menuData[section].findIndex((item: any) => item.id === id)
    if (itemIndex !== -1) {
      menuData[section][itemIndex] = { ...menuData[section][itemIndex], ...updates }
      return true
    }
  }

  // Buscar en secciones anidadas (vinos, promociones)
  if (section.startsWith('vinos-')) {
    const category = section.split('-')[1]
    if (menuData.vinos && menuData.vinos[category]) {
      const itemIndex = menuData.vinos[category].findIndex((item: any) => item.id === id)
      if (itemIndex !== -1) {
        menuData.vinos[category][itemIndex] = { ...menuData.vinos[category][itemIndex], ...updates }
        return true
      }
    }
  }

  if (section.startsWith('promociones-')) {
    const category = section.split('-')[1]
    if (menuData.promociones && menuData.promociones[category]) {
      const itemIndex = menuData.promociones[category].findIndex((item: any) => item.id === id)
      if (itemIndex !== -1) {
        menuData.promociones[category][itemIndex] = { ...menuData.promociones[category][itemIndex], ...updates }
        return true
      }
    }
  }

  return false
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { section: string; id: string } }
) {
  try {
    const { section, id } = params
    const body = await request.json()
    const { hidden, reason, hiddenBy, timestamp } = body

    // Validar campos obligatorios
    if (typeof hidden !== 'boolean' || !reason || !hiddenBy) {
      return NextResponse.json(
        { error: 'Campos obligatorios: hidden, reason, hiddenBy' },
        { status: 400 }
      )
    }

    // Leer datos actuales
    const menuData = readMenuData()
    if (!menuData) {
      return NextResponse.json(
        { error: 'Error al leer los datos del menú' },
        { status: 500 }
      )
    }

    // Buscar y actualizar el item
    const itemUpdated = findAndUpdateItem(menuData, section, id, {
      hidden,
      hiddenReason: reason,
      hiddenBy,
      hiddenAt: timestamp
    })

    if (!itemUpdated) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Guardar cambios
    const saveSuccess = writeMenuData(menuData)
    if (!saveSuccess) {
      return NextResponse.json(
        { error: 'Error al guardar los cambios' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Producto ${hidden ? 'ocultado' : 'mostrado'} exitosamente`,
      item: {
        id,
        section,
        hidden,
        reason,
        hiddenBy,
        timestamp
      }
    })

  } catch (error) {
    console.error('Error updating item visibility:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
