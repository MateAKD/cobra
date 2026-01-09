import { useState, useEffect } from "react"

export function useSubcategoryOrder() {
  const [subcategoryOrder, setSubcategoryOrder] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Sin cache - siempre obtener datos frescos de MongoDB
        // Esto asegura que el /menu refleje los cambios del admin inmediatamente al recargar
        const response = await fetch("/api/admin/subcategory-order", {
          cache: 'no-store',
        })

        if (response.ok) {
          const data = await response.json()
          setSubcategoryOrder(data)
        }
      } catch (error) {
        console.error("Error fetching subcategory order:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [])

  return { subcategoryOrder, loading }
}

