"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Search, Trash2, AlertCircle } from "lucide-react"

export default function DiagnosticTools() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [duplicates, setDuplicates] = useState<any>(null)

    const handleBackupDatabase = async () => {
        try {
            setLoading(true)
            setMessage("Descargando backup...")

            const response = await fetch("/api/db-export")
            const blob = await response.blob()

            // Crear link de descarga
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `mongodb-backup-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            setMessage("✅ Backup descargado exitosamente")
        } catch (error) {
            setMessage("❌ Error al descargar backup")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleFindDuplicates = async () => {
        try {
            setLoading(true)
            setMessage("Buscando duplicados...")

            const response = await fetch("/api/admin/diagnostics")
            const data = await response.json()

            setDuplicates(data)

            if (data.summary.hasIssues) {
                setMessage(`⚠️ Se encontraron ${data.summary.totalDuplicateProducts} productos duplicados, ${data.summary.totalDuplicateCategories} categorías duplicadas, y ${data.summary.totalOrphanedProducts} productos huérfanos`)
            } else {
                setMessage("✅ No se encontraron duplicados")
            }
        } catch (error) {
            setMessage("❌ Error al buscar duplicados")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveDuplicates = async () => {
        if (!confirm("¿Estás seguro de que quieres eliminar todos los duplicados? Esta acción no se puede deshacer.")) {
            return
        }

        try {
            setLoading(true)
            setMessage("Eliminando duplicados...")

            const response = await fetch("/api/admin/diagnostics", {
                method: "POST"
            })
            const data = await response.json()

            setMessage(`✅ Eliminados: ${data.summary.productsRemoved} productos, ${data.summary.categoriesRemoved} categorías, ${data.summary.orphanedProductsRemoved} huérfanos`)
            setDuplicates(null)
        } catch (error) {
            setMessage("❌ Error al eliminar duplicados")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-6 w-6" />
                        Herramientas de Diagnóstico
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                            onClick={handleBackupDatabase}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Descargar Backup
                        </Button>

                        <Button
                            onClick={handleFindDuplicates}
                            disabled={loading}
                            className="flex items-center gap-2"
                            variant="outline"
                        >
                            <Search className="h-4 w-4" />
                            Buscar Duplicados
                        </Button>

                        <Button
                            onClick={handleRemoveDuplicates}
                            disabled={loading || !duplicates?.summary.hasIssues}
                            className="flex items-center gap-2"
                            variant="destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                            Eliminar Duplicados
                        </Button>
                    </div>

                    {message && (
                        <div className="p-4 bg-gray-100 rounded-md">
                            <p className="text-sm">{message}</p>
                        </div>
                    )}

                    {duplicates && duplicates.summary.hasIssues && (
                        <div className="space-y-4">
                            <h3 className="font-semibold">Duplicados Encontrados:</h3>

                            {duplicates.details.duplicateProducts.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-sm">Productos Duplicados:</h4>
                                    <ul className="list-disc list-inside text-sm">
                                        {duplicates.details.duplicateProducts.map((p: any) => (
                                            <li key={p.id}>
                                                {p.name} (ID: {p.id}) - {p.count} copias en categorías: {p.categories.join(", ")}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {duplicates.details.duplicateCategories.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-sm">Categorías Duplicadas:</h4>
                                    <ul className="list-disc list-inside text-sm">
                                        {duplicates.details.duplicateCategories.map((c: any) => (
                                            <li key={c.id}>
                                                {c.name} (ID: {c.id}) - {c.count} copias
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {duplicates.details.orphanedProducts.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-sm">Productos Huérfanos:</h4>
                                    <ul className="list-disc list-inside text-sm">
                                        {duplicates.details.orphanedProducts.map((p: any) => (
                                            <li key={p.id}>
                                                {p.name} (categoría inválida: {p.categoryId})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
