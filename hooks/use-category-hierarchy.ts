import { useState, useEffect } from "react"

interface HierarchyItem {
  parent: string
  level: number
  type: string
}

export function useCategoryHierarchy() {
  const [hierarchy, setHierarchy] = useState<Record<string, HierarchyItem>>({})
  const [loading, setLoading] = useState(true)

  const loadHierarchy = async () => {
    try {
      // OPTIMIZACIÓN: Usar cache con revalidación en lugar de no-store
      // Reduce requests al servidor mientras mantiene datos relativamente frescos
      const response = await fetch("/api/admin/category-hierarchy", {
        next: { revalidate: 5 }, // Revalidar cada 5 segundos
      })
      
      if (response.ok) {
        const data = await response.json()
        setHierarchy(data)
      }
    } catch (error) {
      console.error("Error fetching category hierarchy:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHierarchy()
  }, [])

  // Obtener hijos directos de una categoría
  const getChildren = (parentId: string, level?: number) => {
    return Object.entries(hierarchy)
      .filter(([, value]) => {
        if (level !== undefined) {
          return value.parent === parentId && value.level === level
        }
        return value.parent === parentId
      })
      .map(([key]) => key)
  }

  // Obtener el nivel de una categoría
  const getLevel = (categoryId: string): number => {
    return hierarchy[categoryId]?.level || 0
  }

  // Obtener el padre de una categoría
  const getParent = (categoryId: string): string | null => {
    return hierarchy[categoryId]?.parent || null
  }

  // Agregar una nueva subcategoría
  const addSubcategory = async (subcategoryId: string, parentId: string, level: number = 1) => {
    try {
      const response = await fetch("/api/admin/category-hierarchy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subcategoryId,
          parentId,
          level,
          type: "category"
        }),
      })

      if (response.ok) {
        await loadHierarchy()
        return true
      }
      return false
    } catch (error) {
      console.error("Error adding subcategory:", error)
      return false
    }
  }

  // Eliminar una subcategoría
  const deleteSubcategory = async (subcategoryId: string) => {
    try {
      const response = await fetch(`/api/admin/category-hierarchy?id=${subcategoryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadHierarchy()
        return true
      }
      return false
    } catch (error) {
      console.error("Error deleting subcategory:", error)
      return false
    }
  }

  return {
    hierarchy,
    loading,
    getChildren,
    getLevel,
    getParent,
    addSubcategory,
    deleteSubcategory,
    refresh: loadHierarchy
  }
}

