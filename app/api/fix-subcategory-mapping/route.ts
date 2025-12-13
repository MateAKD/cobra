import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// POST - Actualizar el mapeo de subcategorías
export async function POST() {
    try {
        // Definir el mapeo correcto de subcategorías
        const subcategoryMapping: Record<string, string> = {
            // Parrilla
            "guarniciones": "parrilla",

            // Principales
            "milanesas": "principales",
            "hamburguesas": "principales",
            "ensaladas": "principales",
            "otros": "principales",

            // Desayunos y meriendas
            "cafeteria": "desayunos-y-meriendas",
            "pasteleria": "desayunos-y-meriendas",

            // Bebidas
            "bebidas-sin-alcohol": "bebidas",
            "cervezas": "bebidas",
            "tragos-clasicos": "bebidas",
            "especiales": "bebidas",
            "tragos-con-red-bull": "bebidas",
            "shots": "bebidas",
            "vinos": "bebidas",
            "botellas": "bebidas",

            // Sub-subcategorías de Vinos
            "tintos": "vinos",
            "blancos": "vinos",
            "rosados": "vinos",
            "copas-de-vino": "vinos",

            // Sub-subcategorías de Botellas
            "gins": "botellas",
            "whiskies": "botellas",
            "vodkas": "botellas",
            "espumantes": "botellas",

            // Promociones
            "cafe-promociones": "promociones",
            "bebidas-promociones": "promociones"
        }

        // Guardar en el archivo JSON
        const filePath = path.join(process.cwd(), 'data', 'subcategory-mapping.json')

        // Crear directorio si no existe
        const dir = path.dirname(filePath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }

        fs.writeFileSync(filePath, JSON.stringify(subcategoryMapping, null, 2))

        return NextResponse.json({
            success: true,
            message: "Mapeo de subcategorías actualizado",
            mapping: subcategoryMapping,
            totalSubcategories: Object.keys(subcategoryMapping).length
        })

    } catch (error) {
        console.error("Error actualizando mapeo:", error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido"
            },
            { status: 500 }
        )
    }
}
