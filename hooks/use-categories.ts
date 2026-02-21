import { useState, useEffect, useCallback, useMemo } from 'react'

interface Category {
  name: string
  description: string
  order: number
  timeRestricted?: boolean
  startTime?: string
  endTime?: string
}

interface Categories {
  [key: string]: Category
}

export function useCategories() {
  const [categories, setCategories] = useState<Categories>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  // OPTIMIZACIÓN: useCallback para evitar recrear la función en cada render
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // OPTIMIZACIÓN: Forzar recarga sin cache
      const response = await fetch('/api/categories', {
        cache: 'no-store', // No usar cache del navegador
      })

      if (!response.ok) {
        throw new Error('Error al cargar las categorías')
      }

      const data = await response.json()

      // COMPATIBILITY FIX: La API ahora devuelve un array, pero el frontend espera un objeto
      // Convertimos el array a un objeto mapeado por ID
      const categoriesMap = Array.isArray(data)
        ? data.reduce((acc: Categories, category: any) => {
          acc[category.id] = category
          return acc
        }, {})
        : data // Fallback si todavía es un objeto (retrocompatibilidad)

      setCategories(categoriesMap)
    } catch (err) {
      console.error('Error loading categories:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  // OPTIMIZACIÓN: useCallback para evitar recrear la función en cada render
  const updateCategories = useCallback(async (updatedCategories: Categories, authToken?: string) => {
    try {
      setLoading(true)
      setError(null)

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (authToken) {
        headers['Authorization'] = authToken
      }

      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedCategories),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar las categorías')
      }

      const data = await response.json()
      setCategories(updatedCategories)
      return data
    } catch (err) {
      console.error('Error updating categories:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // OPTIMIZACIÓN: useCallback para evitar recrear la función en cada render
  const updateCategory = useCallback(async (categoryId: string, updates: Partial<Category>, authToken?: string) => {
    const updatedCategories = {
      ...categories,
      [categoryId]: {
        ...categories[categoryId],
        ...updates,
      },
    }

    return await updateCategories(updatedCategories, authToken)
  }, [categories, updateCategories])

  return {
    categories,
    loading,
    error,
    loadCategories,
    updateCategories,
    updateCategory,
  }
}
