import { useState, useEffect } from 'react'

export const useSubcategoryMapping = () => {
  const [subcategoryMapping, setSubcategoryMapping] = useState<{[key: string]: string}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSubcategoryMapping = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/subcategory-mapping')
      if (response.ok) {
        const data = await response.json()
        setSubcategoryMapping(data)
      } else {
        setError('Error al cargar el mapeo de subcategorías')
      }
    } catch (err) {
      setError('Error al cargar el mapeo de subcategorías')
      console.error('Error loading subcategory mapping:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubcategoryMapping()
  }, [])

  return { subcategoryMapping, loading, error, loadSubcategoryMapping }
}
