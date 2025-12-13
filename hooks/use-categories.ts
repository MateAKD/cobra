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
      setCategories(data)
    } catch (err) {
      console.error('Error loading categories:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  // OPTIMIZACIÓN: useCallback para evitar recrear la función en cada render
  const updateCategories = useCallback(async (updatedCategories: Categories) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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
  const updateCategory = useCallback(async (categoryId: string, updates: Partial<Category>) => {
    const updatedCategories = {
      ...categories,
      [categoryId]: {
        ...categories[categoryId],
        ...updates,
      },
    }

    return await updateCategories(updatedCategories)
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
