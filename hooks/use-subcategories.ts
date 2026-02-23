"use client"

import { useState, useEffect, useCallback } from "react"

interface HierarchyItem {
    parent: string
    level: number
    type: string
}

interface SubcategoryData {
    mapping: Record<string, string>
    hierarchy: Record<string, HierarchyItem>
    order: Record<string, string[]>
}

/**
 * Hook unificado que reemplaza:
 *  - useSubcategoryMapping   → acceder a data.mapping
 *  - useCategoryHierarchy    → acceder a data.hierarchy
 *  - useSubcategoryOrder     → acceder a data.order
 */
export function useSubcategories() {
    const [data, setData] = useState<SubcategoryData>({ mapping: {}, hierarchy: {}, order: {} })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/admin/subcategories?t=${Date.now()}`, {
                cache: 'no-store'
            })
            if (response.ok) {
                const json = await response.json()
                setData(json)
                setError(null)
            } else {
                setError('Error al cargar datos de subcategorías')
            }
        } catch (err) {
            console.error("Error fetching subcategory data:", err)
            setError('Error al cargar datos de subcategorías')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    // ── Helpers de jerarquía ──────────────────────────────────────────────────
    const getChildren = (parentId: string) =>
        Object.entries(data.hierarchy)
            .filter(([, v]) => v.parent === parentId)
            .map(([key]) => key)

    const getLevel = (categoryId: string) =>
        data.hierarchy[categoryId]?.level || 0

    const getParent = (categoryId: string) =>
        data.hierarchy[categoryId]?.parent || null

    // ── Mutaciones ────────────────────────────────────────────────────────────
    const authHeader = () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('adminToken')
            return token ? { 'Authorization': token, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
        }
        return { 'Content-Type': 'application/json' }
    }

    /** Vincula una subcategoría a un padre */
    const addSubcategory = async (subcategoryId: string, parentId: string, level = 1) => {
        try {
            const res = await fetch('/api/admin/subcategories', {
                method: 'POST',
                headers: authHeader(),
                body: JSON.stringify({ subcategoryId, parentId, level })
            })
            if (res.ok) { await load(); return true }
            return false
        } catch (err) {
            console.error("Error adding subcategory:", err)
            return false
        }
    }

    /** Desvincula una subcategoría de su padre */
    const deleteSubcategory = async (subcategoryId: string) => {
        try {
            const res = await fetch(`/api/admin/subcategories?id=${subcategoryId}`, {
                method: 'DELETE',
                headers: authHeader()
            })
            if (res.ok) { await load(); return true }
            return false
        } catch (err) {
            console.error("Error deleting subcategory:", err)
            return false
        }
    }

    /** Reordena las subcategorías de una categoría padre */
    const reorderSubcategories = async (categoryId: string, subcategoryOrder: string[]) => {
        try {
            const res = await fetch('/api/admin/subcategories', {
                method: 'POST',
                headers: authHeader(),
                body: JSON.stringify({ categoryId, subcategoryOrder })
            })
            if (res.ok) { await load(); return true }
            return false
        } catch (err) {
            console.error("Error reordering subcategories:", err)
            return false
        }
    }

    /** Guarda un mapping completo (snapshot) */
    const updateMapping = async (mapping: Record<string, string>) => {
        try {
            const res = await fetch('/api/admin/subcategories', {
                method: 'POST',
                headers: authHeader(),
                body: JSON.stringify({ mapping })
            })
            return res.ok
        } catch (err) {
            console.error("Error updating mapping:", err)
            return false
        }
    }

    return {
        // Datos completos
        mapping: data.mapping,
        hierarchy: data.hierarchy,
        order: data.order,
        loading,
        error,
        // Compatibilidad con nombres anteriores
        subcategoryMapping: data.mapping,
        subcategoryOrder: data.order,
        // Helpers
        getChildren,
        getLevel,
        getParent,
        // Mutaciones
        addSubcategory,
        deleteSubcategory,
        reorderSubcategories,
        updateMapping,
        // Recarga
        refresh: load,
        loadSubcategoryMapping: load
    }
}

// ── Alias para retrocompatibilidad (evita tener que cambiar todos los imports existentes) ──

/** @deprecated Usar useSubcategories() directamente */
export function useCategoryHierarchy() {
    const s = useSubcategories()
    return {
        hierarchy: s.hierarchy,
        loading: s.loading,
        getChildren: s.getChildren,
        getLevel: s.getLevel,
        getParent: s.getParent,
        addSubcategory: s.addSubcategory,
        deleteSubcategory: s.deleteSubcategory,
        refresh: s.refresh
    }
}

/** @deprecated Usar useSubcategories() directamente */
export function useSubcategoryMapping() {
    const s = useSubcategories()
    return {
        subcategoryMapping: s.mapping,
        loading: s.loading,
        error: s.error,
        loadSubcategoryMapping: s.refresh
    }
}

/** @deprecated Usar useSubcategories() directamente */
export function useSubcategoryOrder() {
    const s = useSubcategories()
    return {
        subcategoryOrder: s.order,
        loading: s.loading
    }
}
