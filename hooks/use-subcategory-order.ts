import { useState, useEffect } from "react"

export function useSubcategoryOrder() {
  const [subcategoryOrder, setSubcategoryOrder] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // OPTIMIZACIÓN: Usar cache con revalidación en lugar de no-store
        // Reduce requests al servidor mientras mantiene datos relativamente frescos
        const response = await fetch("/api/admin/subcategory-order", {
          next: { revalidate: 5 }, // Revalidar cada 5 segundos
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

