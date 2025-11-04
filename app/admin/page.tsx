"use client"

import { useState, useEffect } from "react"
import "./admin-buttons.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Utensils, 
  Wine, 
  Coffee, 
  Cake, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  X,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  GripVertical,
  Clock
} from "lucide-react"
import EditForm from "./components/EditForm"
import AddForm from "./components/AddForm"
import HideItemModal from "./components/HideItemModal"
import TimeRangeModal, { TimeRangeData } from "./components/TimeRangeModal"
import CategoryDragDrop from "./components/CategoryDragDrop"
import { sendProductNotification, getUserInfo, validateEmailConfig, type NotificationAction } from "@/lib/emailService"
import { useAdminMenuData } from "@/hooks/use-admin-menu-data"
import { useCategories } from "@/hooks/use-categories"
import { isCategoryVisible } from "@/lib/menuUtils"

interface MenuItem {
  id: string
  name: string
  description: string
  price: string
  tags?: ("vegan" | "sin-tacc" | "picante")[]
  hidden?: boolean
}

interface DrinkItem {
  id: string
  name: string
  description?: string
  price: string
  ingredients?: string
  glass?: string
  technique?: string
  garnish?: string
  hidden?: boolean
}

interface WineItem {
  id: string
  name: string
  price: string
  description?: string
  hidden?: boolean
}

interface Category {
  id: string
  name: string
  description: string
  subcategories?: SubCategory[]
}

interface SubCategory {
  id: string
  name: string
  description: string
  categoryId: string
}

export default function AdminPanel() {
  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  
  // Hook para datos del menú del admin (incluye productos ocultos)
  const { menuData: adminMenuData, loading: adminMenuLoading, refetch: refetchAdminMenu, getCategoryStats } = useAdminMenuData()
  
  // Hook para gestionar categorías
  const { categories, updateCategory } = useCategories()
  
  const [activeTab, setActiveTab] = useState("parrilla")
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notificationStatus, setNotificationStatus] = useState<string>("")
  
  // Estados para ocultar/mostrar productos
  const [hideModalOpen, setHideModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [selectedSection, setSelectedSection] = useState<string>("")
  const [hideModalLoading, setHideModalLoading] = useState(false)
  
  // Estados para configurar horarios de categorías
  const [timeRangeModalOpen, setTimeRangeModalOpen] = useState(false)
  const [selectedCategoryForTime, setSelectedCategoryForTime] = useState<string>("")
  const [selectedCategoryTimeData, setSelectedCategoryTimeData] = useState<TimeRangeData | undefined>(undefined)
  
  // Estado para el modo de reordenamiento de categorías
  const [isReorderingCategories, setIsReorderingCategories] = useState(false)

  // Estado para cada sección del menú - Nuevas categorías
  const [parrilla, setParrilla] = useState<any[]>([])
  const [guarniciones, setGuarniciones] = useState<any[]>([])
  const [tapeo, setTapeo] = useState<any[]>([])
  const [milanesas, setMilanesas] = useState<any[]>([])
  const [hamburguesas, setHamburguesas] = useState<any[]>([])
  const [ensaladas, setEnsaladas] = useState<any[]>([])
  const [otros, setOtros] = useState<any[]>([])
  const [postres, setPostres] = useState<any[]>([])
  const [sandwicheria, setSandwicheria] = useState<any[]>([])
  const [cafeteria, setCafeteria] = useState<any[]>([])
  const [pasteleria, setPasteleria] = useState<any[]>([])
  const [bebidasSinAlcohol, setBebidasSinAlcohol] = useState<any[]>([])
  const [cervezas, setCervezas] = useState<any[]>([])
  const [tragosClasicos, setTragosClasicos] = useState<any[]>([])
  const [tragosEspeciales, setTragosEspeciales] = useState<any[]>([])
  const [tragosRedBull, setTragosRedBull] = useState<any[]>([])
  const [vinos, setVinos] = useState<any>({
    tintos: [],
    blancos: [],
    rosados: [],
    copas: [],
  })
  const [botellas, setBotellas] = useState<any[]>([])
  const [promociones, setPromociones] = useState<any>({
    cafe: [],
    tapeos: [],
    bebidas: [],
  })

  // Estado para almacenar dinámicamente las secciones del menú
  const [menuSections, setMenuSections] = useState<{[key: string]: any[]}>({})

  // Estado para todas las categorías (se cargarán dinámicamente desde el JSON)
  const [allCategories, setAllCategories] = useState<any[]>([])

  // Estado para mapear subcategorías con sus categorías padre
  const [subcategoryMapping, setSubcategoryMapping] = useState<{[key: string]: string}>({
    'guarniciones': 'parrilla',
    'milanesas': 'principales',
    'hamburguesas': 'principales',
    'ensaladas': 'principales',
    'otros': 'principales',
    'cafe': 'promociones',
    'tapeos': 'promociones',
    'bebidas': 'promociones'
  })

  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false)
  const [isEditingCategories, setIsEditingCategories] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [deletedCategories, setDeletedCategories] = useState<any[]>([])
  const [editingCategoryDescription, setEditingCategoryDescription] = useState<string>("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newSubcategoryName, setNewSubcategoryName] = useState("")
  const [selectedCategoryForSubcategory, setSelectedCategoryForSubcategory] = useState("")
  const [bulkPriceIncrease, setBulkPriceIncrease] = useState("")
  
  // Estados para aumento porcentual de precios
  const [showPriceIncreaseModal, setShowPriceIncreaseModal] = useState(false)
  const [priceIncreasePercentage, setPriceIncreasePercentage] = useState("")
  const [isIncreasingPrices, setIsIncreasingPrices] = useState(false)
  
  // Estados para agregar productos
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [selectedSectionForProduct, setSelectedSectionForProduct] = useState("")
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    tags: [] as ("vegan" | "sin-tacc" | "picante")[]
  })


  // Verificar autenticación al cargar
  useEffect(() => {
    const authStatus = localStorage.getItem('cobra-admin-auth')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
      
      // Verificar configuración de Resend
      if (!validateEmailConfig()) {
        setNotificationStatus("⚠️ Resend no configurado - Ver EMAIL_SETUP.md")
      }
    } else {
      setLoading(false)
    }
  }, [])

  // Función de login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "cobra2025") {
      setIsAuthenticated(true)
      localStorage.setItem('cobra-admin-auth', 'true')
      setLoginError("")
      setPassword("")
    } else {
      setLoginError("Contraseña incorrecta")
    }
  }

  // Función de logout
  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('cobra-admin-auth')
    setPassword("")
  }

  // Función para manejar el reordenamiento de categorías
  const handleCategoriesReorder = async (reorderedCategories: any[]) => {
    try {
      setSaving(true)
      setNotificationStatus("Guardando nuevo orden de categorías...")
      
      // Actualizar el estado local
      setAllCategories(reorderedCategories)
      
      // Enviar al servidor
      const response = await fetch('/api/admin/reorder-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categories: reorderedCategories }),
      })
      
      if (response.ok) {
        setNotificationStatus("✅ Orden de categorías actualizado correctamente")
        setTimeout(() => setNotificationStatus(""), 3000)
      } else {
        throw new Error('Error al guardar el orden')
      }
    } catch (error) {
      console.error('Error al reordenar categorías:', error)
      setNotificationStatus("❌ Error al guardar el orden de categorías")
      setTimeout(() => setNotificationStatus(""), 3000)
    } finally {
      setSaving(false)
    }
  }

  // Función para sincronizar datos del admin con los estados locales
  const syncAdminData = async () => {
    if (!adminMenuData) return

    // Siempre cargar el mapeo de subcategorías más reciente desde la API
    let currentSubcategoryMapping = subcategoryMapping
    try {
      const mappingResponse = await fetch("/api/admin/subcategory-mapping")
      if (mappingResponse.ok) {
        currentSubcategoryMapping = await mappingResponse.json()
        setSubcategoryMapping(currentSubcategoryMapping)
      }
    } catch (error) {
      console.warn("Error cargando mapeo de subcategorías:", error)
    }

    // Actualizar todos los estados con las nuevas categorías
    setParrilla(adminMenuData.parrilla || [])
    setGuarniciones(adminMenuData.guarniciones || [])
    setTapeo(adminMenuData.tapeo || [])
    setMilanesas(adminMenuData.milanesas || [])
    setHamburguesas(adminMenuData.hamburguesas || [])
    setEnsaladas(adminMenuData.ensaladas || [])
    setOtros(adminMenuData.otros || [])
    setPostres(adminMenuData.postres || [])
    setSandwicheria(adminMenuData.sandwicheria || [])
    setCafeteria(adminMenuData.cafeteria || [])
    setPasteleria(adminMenuData.pasteleria || [])
    setBebidasSinAlcohol(adminMenuData.bebidasSinAlcohol || [])
    setCervezas(adminMenuData.cervezas || [])
    setTragosClasicos(adminMenuData.tragosClasicos || [])
    setTragosEspeciales(adminMenuData.tragosEspeciales || [])
    setTragosRedBull(adminMenuData.tragosRedBull || [])
    setVinos(adminMenuData.vinos || {
      tintos: [],
      blancos: [],
      rosados: [],
      copas: [],
    })
    setBotellas(adminMenuData.botellas || [])
    setPromociones(adminMenuData.promociones || {
      cafe: [],
      tapeos: [],
      bebidas: [],
    })

    // Crear un objeto con todas las secciones del menú para acceso dinámico
    const sections: {[key: string]: any[]} = {}
    Object.keys(adminMenuData).forEach(key => {
      const categoryData = adminMenuData[key as keyof typeof adminMenuData]
      
      if (Array.isArray(categoryData)) {
        // Categoría con array directo
        sections[key] = categoryData as any[]
      } else if (typeof categoryData === 'object' && categoryData !== null) {
        // Para objetos como vinos que tienen subcategorías
        const obj = categoryData as any
        Object.keys(obj).forEach(subKey => {
          if (Array.isArray(obj[subKey])) {
            sections[`${key}-${subKey}`] = obj[subKey]
          }
        })
        
        // También agregar la categoría principal si tiene contenido
        if (Object.keys(obj).length > 0) {
          sections[key] = [] // Array vacío para indicar que existe pero tiene subcategorías
        }
      }
    })
    setMenuSections(sections)

    // Actualizar el estado de todas las categorías basándose en el archivo JSON
    setAllCategories(prev => {
      // Obtener todas las categorías del archivo JSON (solo las que realmente existen)
      const jsonCategories: any[] = []
      
      // Solo agregar categorías que están realmente en el archivo JSON
      Object.keys(adminMenuData).forEach(key => {
        const categoryData = adminMenuData[key as keyof typeof adminMenuData]
        
        // Verificar si es un array directo o un objeto con subcategorías
        const isArray = Array.isArray(categoryData)
        const isObjectWithSubcategories = typeof categoryData === 'object' && categoryData !== null && !Array.isArray(categoryData)
        
        if (isArray || isObjectWithSubcategories) {
          // Determinar si es una categoría estándar o personalizada
          const standardCategories = [
            'parrilla', 'guarniciones', 'tapeo', 'milanesas', 'hamburguesas', 
            'ensaladas', 'otros', 'postres', 'sandwicheria', 'cafeteria', 
            'pasteleria', 'bebidasSinAlcohol', 'cervezas', 'tragosClasicos', 
            'tragosEspeciales', 'tragosRedBull', 'vinos', 'botellas', 'promociones'
          ]
          
          const isStandard = standardCategories.includes(key)
          
          // EXCLUIR SUBCATEGORÍAS: No agregar si esta clave es una subcategoría
          const isSubcategory = Object.keys(currentSubcategoryMapping).includes(key)
          
          if (!isSubcategory) {
            jsonCategories.push({
              id: key,
              name: key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
              isStandard: isStandard
            })
          }
        }
      })
      return jsonCategories
    })
  }

  // Sincronizar datos cuando cambien los datos del admin
  useEffect(() => {
    if (adminMenuData && isAuthenticated) {
      syncAdminData().then(() => {
        setLoading(false)
      })
    }
  }, [adminMenuData, isAuthenticated])

  const loadMenuData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/menu")
      
      if (!response.ok) {
        throw new Error("Error al cargar los datos del menú")
      }
      
      const data = await response.json()
      
      // Actualizar todos los estados con las nuevas categorías
      setParrilla(data.parrilla || [])
      setGuarniciones(data.guarniciones || [])
      setTapeo(data.tapeo || [])
      setMilanesas(data.milanesas || [])
      setHamburguesas(data.hamburguesas || [])
      setEnsaladas(data.ensaladas || [])
      setOtros(data.otros || [])
      setPostres(data.postres || [])
      setSandwicheria(data.sandwicheria || [])
      setCafeteria(data.cafeteria || [])
      setPasteleria(data.pasteleria || [])
      setBebidasSinAlcohol(data.bebidasSinAlcohol || [])
      setCervezas(data.cervezas || [])
      setTragosClasicos(data.tragosClasicos || [])
      setTragosEspeciales(data.tragosEspeciales || [])
      setTragosRedBull(data.tragosRedBull || [])
      setVinos(data.vinos || {
        tintos: [],
        blancos: [],
        rosados: [],
        copas: [],
      })
      setBotellas(data.botellas || [])
      setPromociones(data.promociones || {
        cafe: [],
        tapeos: [],
        bebidas: [],
      })

      // Crear un objeto con todas las secciones del menú para acceso dinámico
      const sections: {[key: string]: MenuItem[]} = {}
      Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
          sections[key] = data[key]
        } else if (typeof data[key] === 'object' && data[key] !== null) {
          // Para objetos como vinos que tienen subcategorías
          Object.keys(data[key]).forEach(subKey => {
            if (Array.isArray(data[key][subKey])) {
              sections[`${key}-${subKey}`] = data[key][subKey]
            }
          })
        }
      })
      setMenuSections(sections)

      // CARGAR EL MAPEO DE SUBCATEGORÍAS DESDE EL ARCHIVO JSON
      try {
        const mappingResponse = await fetch("/api/admin/subcategory-mapping")
        if (mappingResponse.ok) {
          const mappingData = await mappingResponse.json()
          setSubcategoryMapping(mappingData)
          console.log("Mapeo de subcategorías cargado exitosamente:", mappingData)
        } else {
          console.warn("No se pudo cargar el mapeo de subcategorías")
        }
      } catch (error) {
        console.warn("Error cargando mapeo de subcategorías:", error)
      }

      // Cargar categorías personalizadas desde el archivo JSON
      const standardCategories = [
        'parrilla', 'guarniciones', 'tapeo', 'milanesas', 'hamburguesas', 
        'ensaladas', 'otros', 'postres', 'sandwicheria', 'cafeteria', 
        'pasteleria', 'bebidasSinAlcohol', 'cervezas', 'tragosClasicos', 
        'tragosEspeciales', 'tragosRedBull', 'vinos', 'botellas', 'promociones'
      ]
      
      const customCategories: any[] = []
      Object.keys(data).forEach(key => {
        if (!standardCategories.includes(key) && Array.isArray(data[key])) {
          // EXCLUIR SUBCATEGORÍAS: No agregar si esta clave es una subcategoría
          const isSubcategory = Object.keys(subcategoryMapping).includes(key)
          
          if (!isSubcategory) {
            // Crear una categoría personalizada con el nombre como ID
            customCategories.push({
              id: key,
              name: key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
              isStandard: false
            })
          }
        }
      })
      
      // Actualizar el estado de todas las categorías con las existentes + las nuevas
      setAllCategories(prev => {
        // Combinar categorías estándar con las nuevas del archivo JSON
        const existingIds = prev.map(cat => cat.id)
        const newCategories = customCategories.filter(cat => !existingIds.includes(cat.id))
        const updatedCategories = [...prev, ...newCategories]
        console.log("Categorías actualizadas:", updatedCategories)
        return updatedCategories
      })

      // Migrar categorías con IDs numéricos a nombres descriptivos (solo en desarrollo)
      if (process.env.NODE_ENV === 'development') {
        try {
          await migrateNumericCategories(data)
        } catch (error) {
          console.warn("Error en migración de categorías:", error)
        }
      }
    } catch (error) {
      console.error("Error loading menu data:", error)
      alert("Error al cargar los datos del menú")
    } finally {
      setLoading(false)
    }
  }

  // Función para migrar categorías con IDs numéricos a nombres descriptivos
  const migrateNumericCategories = async (data: any) => {
    try {
      const standardCategories = [
        'parrilla', 'guarniciones', 'tapeo', 'milanesas', 'hamburguesas', 
        'ensaladas', 'otros', 'postres', 'sandwicheria', 'cafeteria', 
        'pasteleria', 'bebidasSinAlcohol', 'cervezas', 'tragosClasicos', 
        'tragosEspeciales', 'tragosRedBull', 'vinos', 'botellas', 'promociones'
      ]
      
      // Identificar categorías con IDs numéricos (timestamps)
      const numericCategories = Object.keys(data).filter(key => {
        if (standardCategories.includes(key)) return false
        if (!Array.isArray(data[key])) return false
        // Verificar si es un timestamp (número de 13 dígitos)
        return /^\d{13}$/.test(key)
      })

      if (numericCategories.length === 0) return

      // Para cada categoría numérica, crear una nueva con nombre descriptivo
      for (const numericKey of numericCategories) {
        // Generar un nombre descriptivo basado en el primer producto
        const firstProduct = data[numericKey][0]
        let descriptiveName = 'Nueva Categoría'
        
        if (firstProduct && firstProduct.name) {
          // Usar el nombre del primer producto como base para el nombre de la categoría
          descriptiveName = firstProduct.name.charAt(0).toUpperCase() + firstProduct.name.slice(1)
        }
        
        // Crear nueva clave descriptiva
        const newKey = descriptiveName.toLowerCase().replace(/\s+/g, '-')
        
        // Solo migrar si la nueva clave no existe
        if (!data[newKey]) {
          // Crear la nueva categoría en el archivo JSON
          const response = await fetch(`/api/menu/${newKey}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data[numericKey]),
          })
          
          if (response.ok) {
            // Eliminar la categoría numérica
            await fetch(`/api/menu/${numericKey}`, {
              method: "DELETE",
            })
            
            console.log(`Categoría migrada: ${numericKey} → ${newKey}`)
          }
        }
      }
    } catch (error) {
      console.error("Error migrating numeric categories:", error)
    }
  }

  const handleEdit = (item: any, section: string) => {
    setIsEditing(section)
    setEditingItem({ ...item })
  }

  const handleSave = async (section: string, updatedItem: any) => {
    try {
      setSaving(true)
      setNotificationStatus("Guardando cambios...")
      
      // Actualizar en el servidor
      const response = await fetch(`/api/menu/${section}/${updatedItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedItem),
      })
      
      if (!response.ok) {
        throw new Error("Error al actualizar el elemento")
      }
      
             // Actualizar el estado local
       switch (section) {
         case "parrilla":
           setParrilla(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
           break
         case "guarniciones":
           setGuarniciones(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
           break
         case "tapeo":
           setTapeo(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
           break
         case "milanesas":
           setMilanesas(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
           break
         case "hamburguesas":
           setHamburguesas(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
           break
         case "ensaladas":
           setEnsaladas(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
           break
         case "otros":
           setOtros(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
           break
         case "postres":
           setPostres(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
           break
         case "sandwicheria":
           setSandwicheria(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
           break
         case "cafeteria":
           setCafeteria(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
           break
         case "pasteleria":
           setPasteleria(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
           break
         case "bebidasSinAlcohol":
           setBebidasSinAlcohol(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
           break
         case "cervezas":
           setCervezas(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
           break
         case "tragosClasicos":
           setTragosClasicos(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
           break
         case "tragosEspeciales":
           setTragosEspeciales(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
           break
         case "tragosRedBull":
           setTragosRedBull(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
           break
         case "botellas":
           setBotellas(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
           break
         default:
           if (section.startsWith("vinos-")) {
             const category = section.split("-")[1]
             setVinos(prev => ({
               ...prev,
               [category]: prev[category as keyof typeof prev].map((item: any) => 
                 item.id === updatedItem.id ? updatedItem : item
               )
             }))
           } else if (section.startsWith("promociones-")) {
             const category = section.split("-")[1]
             setPromociones(prev => ({
               ...prev,
               [category]: prev[category as keyof typeof prev].map((item: any) => 
                 item.id === updatedItem.id ? updatedItem : item
               )
             }))
           } else {
             // Para categorías personalizadas dinámicas
             setMenuSections(prev => ({
               ...prev,
               [section]: prev[section]?.map((item: any) => 
                 item.id === updatedItem.id ? updatedItem : item
               ) || []
             }))
           }
       }
      
      setIsEditing(null)
      setEditingItem(null)
      
      // Enviar notificación por email
      setNotificationStatus("Enviando notificación...")
      const emailSent = await sendProductNotification('EDITAR', {
        name: updatedItem.name,
        description: updatedItem.description,
        price: updatedItem.price,
        section: section,
        tags: updatedItem.tags,
        ingredients: updatedItem.ingredients,
        glass: updatedItem.glass,
        technique: updatedItem.technique,
        garnish: updatedItem.garnish
      }, getUserInfo())
      
      if (emailSent) {
        setNotificationStatus("✅ Notificación enviada")
        alert("Elemento actualizado exitosamente - Notificación enviada por email")
      } else {
        setNotificationStatus("⚠️ Error en notificación")
        alert("Elemento actualizado exitosamente - Error al enviar notificación")
      }
      
      setTimeout(() => setNotificationStatus(""), 3000)
    } catch (error) {
      console.error("Error saving item:", error)
      alert("Error al guardar el elemento")
    } finally {
      setSaving(false)
    }
  }

  const handleAdd = async (section: string, newItem: any) => {
    try {
      setSaving(true)
      setNotificationStatus("Agregando producto...")
      
      // Agregar en el servidor
      const response = await fetch(`/api/menu/${section}/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      })
      
      if (!response.ok) {
        throw new Error("Error al agregar el elemento")
      }
      
      const result = await response.json()
      const addedItem = result.item
      
             // Actualizar el estado local
       switch (section) {
         case "parrilla":
           setParrilla(prev => [...prev, addedItem])
           break
         case "guarniciones":
           setGuarniciones(prev => [...prev, addedItem])
           break
         case "tapeo":
           setTapeo(prev => [...prev, addedItem])
           break
         case "milanesas":
           setMilanesas(prev => [...prev, addedItem])
           break
         case "hamburguesas":
           setHamburguesas(prev => [...prev, addedItem])
           break
         case "ensaladas":
           setEnsaladas(prev => [...prev, addedItem])
           break
         case "otros":
           setOtros(prev => [...prev, addedItem])
           break
         case "postres":
           setPostres(prev => [...prev, addedItem])
           break
         case "sandwicheria":
           setSandwicheria(prev => [...prev, addedItem])
           break
         case "cafeteria":
           setCafeteria(prev => [...prev, addedItem])
           break
         case "pasteleria":
           setPasteleria(prev => [...prev, addedItem])
           break
         case "bebidasSinAlcohol":
           setBebidasSinAlcohol(prev => [...prev, addedItem])
           break
         case "cervezas":
           setCervezas(prev => [...prev, addedItem])
           break
         case "tragosClasicos":
           setTragosClasicos(prev => [...prev, addedItem])
           break
         case "tragosEspeciales":
           setTragosEspeciales(prev => [...prev, addedItem])
           break
         case "tragosRedBull":
           setTragosRedBull(prev => [...prev, addedItem])
           break
         case "botellas":
           setBotellas(prev => [...prev, addedItem])
           break
         default:
           if (section.startsWith("vinos-")) {
             const category = section.split("-")[1]
             setVinos(prev => ({
               ...prev,
               [category]: [...prev[category as keyof typeof prev], addedItem]
             }))
           } else if (section.startsWith("promociones-")) {
             const category = section.split("-")[1]
             setPromociones(prev => ({
               ...prev,
               [category]: [...prev[category as keyof typeof prev], addedItem]
             }))
           } else {
             // Para categorías personalizadas dinámicas
             setMenuSections(prev => ({
               ...prev,
               [section]: [...(prev[section] || []), addedItem]
             }))
           }
       }
      
      setIsAdding(null)
      
      // Enviar notificación por email
      setNotificationStatus("Enviando notificación...")
      const emailSent = await sendProductNotification('AGREGAR', {
        name: addedItem.name,
        description: addedItem.description,
        price: addedItem.price,
        section: section,
        tags: addedItem.tags,
        ingredients: addedItem.ingredients,
        glass: addedItem.glass,
        technique: addedItem.technique,
        garnish: addedItem.garnish
      }, getUserInfo())
      
      if (emailSent) {
        setNotificationStatus("✅ Notificación enviada")
        alert("Elemento agregado exitosamente - Notificación enviada por email")
      } else {
        setNotificationStatus("⚠️ Error en notificación")
        alert("Elemento agregado exitosamente - Error al enviar notificación")
      }
      
      setTimeout(() => setNotificationStatus(""), 3000)
    } catch (error) {
      console.error("Error adding item:", error)
      alert("Error al agregar el elemento")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(null)
    setIsAdding(null)
    setEditingItem(null)
  }

  // Función para abrir el modal de ocultar/mostrar
  const handleToggleVisibility = (item: any, section: string) => {
    setSelectedItem(item)
    setSelectedSection(section)
    setHideModalOpen(true)
  }

  // Función para confirmar la ocultación/mostrar
  const handleConfirmVisibilityToggle = async (reason: string, hiddenBy: string, action: 'hide' | 'show') => {
    try {
      setHideModalLoading(true)
      setNotificationStatus(`${action === 'hide' ? 'Ocultando' : 'Mostrando'} producto...`)
      
      // Actualizar en el servidor
      const response = await fetch(`/api/menu/${selectedSection}/${selectedItem.id}/visibility`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hidden: action === 'hide',
          reason,
          hiddenBy,
          timestamp: new Date().toISOString()
        }),
      })
      
      if (!response.ok) {
        throw new Error("Error al actualizar la visibilidad del producto")
      }
      
      // Actualizar el estado local
      const updatedItem = { ...selectedItem, hidden: action === 'hide' }
      
      switch (selectedSection) {
        case "parrilla":
          setParrilla(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item))
          break
        case "guarniciones":
          setGuarniciones(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item))
          break
        case "tapeo":
          setTapeo(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item))
          break
        case "milanesas":
          setMilanesas(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item))
          break
        case "hamburguesas":
          setHamburguesas(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item))
          break
        case "ensaladas":
          setEnsaladas(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item))
          break
        case "otros":
          setOtros(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item))
          break
        case "postres":
          setPostres(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item))
          break
        case "sandwicheria":
          setSandwicheria(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item))
          break
        case "cafeteria":
          setCafeteria(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item))
          break
        case "pasteleria":
          setPasteleria(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item))
          break
        case "bebidasSinAlcohol":
          setBebidasSinAlcohol(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item))
          break
        case "cervezas":
          setCervezas(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item))
          break
        case "tragosClasicos":
          setTragosClasicos(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item))
          break
        case "tragosEspeciales":
          setTragosEspeciales(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item))
          break
        case "tragosRedBull":
          setTragosRedBull(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item))
          break
        case "botellas":
          setBotellas(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item))
          break
        default:
          if (selectedSection.startsWith("vinos-")) {
            const category = selectedSection.split("-")[1]
            setVinos(prev => ({
              ...prev,
              [category]: prev[category as keyof typeof prev].map((item: any) => 
                item.id === selectedItem.id ? updatedItem : item
              )
            }))
          } else if (selectedSection.startsWith("promociones-")) {
            const category = selectedSection.split("-")[1]
            setPromociones(prev => ({
              ...prev,
              [category]: prev[category as keyof typeof prev].map((item: any) => 
                item.id === selectedItem.id ? updatedItem : item
              )
            }))
          } else {
            // Para categorías personalizadas dinámicas
            setMenuSections(prev => ({
              ...prev,
              [selectedSection]: prev[selectedSection]?.map((item: any) => 
                item.id === selectedItem.id ? updatedItem : item
              ) || []
            }))
          }
      }
      
      // Enviar notificación por email
      setNotificationStatus("Enviando notificación...")
      const emailSent = await sendProductNotification(
        action === 'hide' ? 'OCULTAR' : 'MOSTRAR', 
        {
          name: selectedItem.name,
          description: selectedItem.description,
          price: selectedItem.price,
          section: selectedSection,
          tags: selectedItem.tags,
          ingredients: selectedItem.ingredients,
          glass: selectedItem.glass,
          technique: selectedItem.technique,
          garnish: selectedItem.garnish,
          reason,
          hiddenBy
        }, 
        getUserInfo()
      )
      
      if (emailSent) {
        setNotificationStatus("✅ Notificación enviada")
        alert(`Producto ${action === 'hide' ? 'ocultado' : 'mostrado'} exitosamente - Notificación enviada por email`)
      } else {
        setNotificationStatus("⚠️ Error en notificación")
        alert(`Producto ${action === 'hide' ? 'ocultado' : 'mostrado'} exitosamente - Error al enviar notificación`)
      }
      
      setHideModalOpen(false)
      setSelectedItem(null)
      setSelectedSection("")
      setTimeout(() => setNotificationStatus(""), 3000)
      
    } catch (error) {
      console.error("Error updating visibility:", error)
      alert("Error al actualizar la visibilidad del producto")
    } finally {
      setHideModalLoading(false)
    }
  }

  // Función para abrir el modal de configuración de horarios
  const handleOpenTimeRangeModal = (categoryId: string) => {
    const category = categories[categoryId]
    if (category) {
      setSelectedCategoryForTime(categoryId)
      setSelectedCategoryTimeData({
        timeRestricted: category.timeRestricted || false,
        startTime: category.startTime,
        endTime: category.endTime,
      })
      setTimeRangeModalOpen(true)
    }
  }

  // Función para guardar la configuración de horarios
  const handleSaveTimeRange = async (data: TimeRangeData) => {
    try {
      setSaving(true)
      setNotificationStatus("Guardando configuración de horarios...")
      
      const categoryName = categories[selectedCategoryForTime]?.name || ""
      
      // Actualizar la categoría con los datos de horario
      await updateCategory(selectedCategoryForTime, {
        timeRestricted: data.timeRestricted,
        startTime: data.startTime,
        endTime: data.endTime,
      })
      
      setNotificationStatus("✅ Configuración de horarios guardada")
      
      let message = `Configuración de horarios actualizada para "${categoryName}": `
      if (data.timeRestricted && data.startTime && data.endTime) {
        message += `Se mostrará de ${data.startTime} a ${data.endTime}`
      } else {
        message += "Sin restricción horaria"
      }
      
      alert(message)
      
      setTimeout(() => setNotificationStatus(""), 3000)
      
    } catch (error) {
      console.error("Error updating time range:", error)
      alert("Error al actualizar la configuración de horarios")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, section: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este elemento?")) {
      try {
        setSaving(true)
        setNotificationStatus("Eliminando producto...")
        
        // Encontrar el item que se va a eliminar para la notificación
        let itemToDelete: any = null
        
        // Buscar el item en la sección correspondiente
        switch (section) {
          case "parrilla":
            itemToDelete = parrilla.find(item => item.id === id)
            break
          case "guarniciones":
            itemToDelete = guarniciones.find(item => item.id === id)
            break
          case "tapeo":
            itemToDelete = tapeo.find(item => item.id === id)
            break
          case "milanesas":
            itemToDelete = milanesas.find(item => item.id === id)
            break
          case "hamburguesas":
            itemToDelete = hamburguesas.find(item => item.id === id)
            break
          case "ensaladas":
            itemToDelete = ensaladas.find(item => item.id === id)
            break
          case "otros":
            itemToDelete = otros.find(item => item.id === id)
            break
          case "postres":
            itemToDelete = postres.find(item => item.id === id)
            break
          case "sandwicheria":
            itemToDelete = sandwicheria.find(item => item.id === id)
            break
          case "cafeteria":
            itemToDelete = cafeteria.find(item => item.id === id)
            break
          case "pasteleria":
            itemToDelete = pasteleria.find(item => item.id === id)
            break
          case "bebidasSinAlcohol":
            itemToDelete = bebidasSinAlcohol.find(item => item.id === id)
            break
          case "cervezas":
            itemToDelete = cervezas.find(item => item.id === id)
            break
          case "tragosClasicos":
            itemToDelete = tragosClasicos.find(item => item.id === id)
            break
          case "tragosEspeciales":
            itemToDelete = tragosEspeciales.find(item => item.id === id)
            break
          case "tragosRedBull":
            itemToDelete = tragosRedBull.find(item => item.id === id)
            break
          case "botellas":
            itemToDelete = botellas.find(item => item.id === id)
            break
          default:
            if (section.startsWith("vinos-")) {
              const category = section.split("-")[1]
              itemToDelete = (vinos as any)[category]?.find((item: any) => item.id === id)
            } else if (section.startsWith("promociones-")) {
              const category = section.split("-")[1]
              itemToDelete = (promociones as any)[category]?.find((item: any) => item.id === id)
            }
        }
        
        // Eliminar en el servidor
        const response = await fetch(`/api/menu/${section}/${id}`, {
          method: "DELETE",
        })
        
        if (!response.ok) {
          throw new Error("Error al eliminar el elemento")
        }
        
                 // Actualizar el estado local
         switch (section) {
           case "parrilla":
             setParrilla(prev => prev.filter(item => item.id !== id))
             break
           case "guarniciones":
             setGuarniciones(prev => prev.filter(item => item.id !== id))
             break
           case "tapeo":
             setTapeo(prev => prev.filter(item => item.id !== id))
             break
           case "milanesas":
             setMilanesas(prev => prev.filter(item => item.id !== id))
             break
           case "hamburguesas":
             setHamburguesas(prev => prev.filter(item => item.id !== id))
             break
           case "ensaladas":
             setEnsaladas(prev => prev.filter(item => item.id !== id))
             break
           case "otros":
             setOtros(prev => prev.filter(item => item.id !== id))
             break
           case "postres":
             setPostres(prev => prev.filter(item => item.id !== id))
             break
           case "sandwicheria":
             setSandwicheria(prev => prev.filter(item => item.id !== id))
             break
           case "cafeteria":
             setCafeteria(prev => prev.filter(item => item.id !== id))
             break
           case "pasteleria":
             setPasteleria(prev => prev.filter(item => item.id !== id))
             break
           case "bebidasSinAlcohol":
             setBebidasSinAlcohol(prev => prev.filter(item => item.id !== id))
             break
           case "cervezas":
             setCervezas(prev => prev.filter(item => item.id !== id))
             break
           case "tragosClasicos":
             setTragosClasicos(prev => prev.filter(item => item.id !== id))
             break
           case "tragosEspeciales":
             setTragosEspeciales(prev => prev.filter(item => item.id !== id))
             break
           case "tragosRedBull":
             setTragosRedBull(prev => prev.filter(item => item.id !== id))
             break
           case "botellas":
             setBotellas(prev => prev.filter(item => item.id !== id))
             break
           default:
             if (section.startsWith("vinos-")) {
               const category = section.split("-")[1]
               setVinos(prev => ({
                 ...prev,
                 [category]: prev[category as keyof typeof prev].filter((item: any) => item.id !== id)
               }))
             } else if (section.startsWith("promociones-")) {
               const category = section.split("-")[1]
               setPromociones(prev => ({
                 ...prev,
                 [category]: prev[category as keyof typeof prev].filter((item: any) => item.id !== id)
               }))
             } else {
               // Para categorías personalizadas dinámicas
               setMenuSections(prev => ({
                 ...prev,
                 [section]: prev[section]?.filter((item: any) => item.id !== id) || []
               }))
             }
         }
        
        // Enviar notificación por email si se encontró el item
        if (itemToDelete) {
          setNotificationStatus("Enviando notificación...")
          const emailSent = await sendProductNotification('ELIMINAR', {
            name: itemToDelete.name,
            description: itemToDelete.description,
            price: itemToDelete.price,
            section: section,
            tags: itemToDelete.tags,
            ingredients: itemToDelete.ingredients,
            glass: itemToDelete.glass,
            technique: itemToDelete.technique,
            garnish: itemToDelete.garnish
          }, getUserInfo())
          
          if (emailSent) {
            setNotificationStatus("✅ Notificación enviada")
            alert("Elemento eliminado exitosamente - Notificación enviada por email")
          } else {
            setNotificationStatus("⚠️ Error en notificación")
            alert("Elemento eliminado exitosamente - Error al enviar notificación")
          }
          
          setTimeout(() => setNotificationStatus(""), 3000)
        } else {
          alert("Elemento eliminado exitosamente")
        }
      } catch (error) {
        console.error("Error deleting item:", error)
        alert("Error al eliminar el elemento")
      } finally {
        setSaving(false)
      }
    }
  }

  // Función para formatear descripciones
  const formatDescription = (description: string) => {
    if (!description) return ""
    // Convertir a minúsculas, capitalizar primera letra y agregar punto final
    const formatted = description.toLowerCase().trim()
    const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1)
    return capitalized.endsWith('.') ? capitalized : capitalized + '.'
  }

  

  // Función para agregar nueva categoría
  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) return
    
    try {
      const categoryId = newCategoryName.toLowerCase().replace(/\s+/g, '-')
      const categoryName = newCategoryName.toUpperCase().trim()
      
      // Verificar que la categoría no exista ya
      if (allCategories.find(cat => cat.id === categoryId)) {
        alert("Esta categoría ya existe")
        return
      }
      
      // Agregar a todas las categorías
      setAllCategories(prev => [...prev, { 
        id: categoryId, 
        name: categoryName, 
        isStandard: false 
      }])
      
      // Inicializar menuSections con un array vacío para la nueva categoría
      setMenuSections(prev => ({
        ...prev,
        [categoryId]: []
      }))
      
      // Cambiar a la nueva categoría
      setActiveTab(categoryId)
      
      // Hacer scroll a la nueva categoría después de un pequeño delay
      setTimeout(() => {
        const newTab = document.querySelector(`[data-state="active"][value="${categoryId}"]`)
        if (newTab) {
          newTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        }
      }, 100)
      
      // Crear la categoría en el archivo JSON del menú
      const menuResponse = await fetch(`/api/menu/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([]),
      })
      
      if (menuResponse.ok) {
        // También crear la categoría en categories.json
        const categoryData = {
          name: categoryName,
          description: "",
          order: allCategories.length + 1
        }
        
        // Obtener las categorías actuales
        const categoriesResponse = await fetch("/api/categories")
        if (categoriesResponse.ok) {
          const currentCategories = await categoriesResponse.json()
          
          // Agregar la nueva categoría
          const updatedCategories = {
            ...currentCategories,
            [categoryId]: categoryData
          }
          
          // Actualizar categories.json
          await fetch("/api/categories", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedCategories),
          })
        }
        
        // Limpiar y cerrar modal
        setNewCategoryName("")
        setIsAddingCategory(false)
        
        // Recargar datos del menú
        await refetchAdminMenu()
      }
    } catch (error) {
      console.error("Error adding category:", error)
      alert("Error al agregar la categoría")
    }
  }

  // Función para agregar nuevo producto
  const handleAddNewProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.price.trim() || !selectedSectionForProduct) return
    
    try {
      const productId = `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const newProductItem: MenuItem = {
        id: productId,
        name: newProduct.name.trim(),
        description: newProduct.description.trim(),
        price: newProduct.price.trim(),
        tags: newProduct.tags as ("vegan" | "sin-tacc" | "picante")[],
        hidden: false
      }
      
      // PERSISTIR EL PRODUCTO EN EL ARCHIVO JSON
      try {
        // Obtener la sección actual del menú
        let currentSectionData: any[] = []
        
        if (selectedSectionForProduct.startsWith("promociones-")) {
          const subcat = selectedSectionForProduct.split("-")[1] as keyof typeof promociones
          currentSectionData = [...(promociones[subcat] || [])]
        } else if (selectedSectionForProduct.startsWith("vinos-")) {
          const subcat = selectedSectionForProduct.split("-")[1] as keyof typeof vinos
          currentSectionData = [...(vinos[subcat] || [])]
        } else {
          // Para otras secciones estándar o subcategorías dinámicas
          switch (selectedSectionForProduct) {
            case "parrilla":
              currentSectionData = [...parrilla]
              break
            case "tapeo":
              currentSectionData = [...tapeo]
              break
            case "cafeteria":
              currentSectionData = [...cafeteria]
              break
            case "pasteleria":
              currentSectionData = [...pasteleria]
              break
            case "bebidasSinAlcohol":
              currentSectionData = [...bebidasSinAlcohol]
              break
            case "cervezas":
              currentSectionData = [...cervezas]
              break
            case "tragosClasicos":
              currentSectionData = [...tragosClasicos]
              break
            case "tragosEspeciales":
              currentSectionData = [...tragosEspeciales]
              break
            case "tragosRedBull":
              currentSectionData = [...tragosRedBull]
              break
            case "botellas":
              currentSectionData = [...botellas]
              break
            default:
              // Para subcategorías dinámicas
              currentSectionData = [...(menuSections[selectedSectionForProduct] || [])]
          }
        }
        
        // Agregar el nuevo producto a la sección
        const updatedSectionData = [...currentSectionData, newProductItem]
        
        // Guardar en el servidor
        const response = await fetch(`/api/menu/${selectedSectionForProduct}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedSectionData),
        })
        
        if (!response.ok) {
          throw new Error("Error al guardar el producto en el servidor")
        }
        
        console.log("Producto guardado exitosamente en el servidor")
      } catch (error) {
        console.error("Error guardando producto en servidor:", error)
        alert("Advertencia: El producto se agregó localmente pero no se pudo guardar en el servidor")
      }
      
      // Actualizar el estado local
      if (selectedSectionForProduct.startsWith("promociones-")) {
        // Para subcategorías de promociones
        const subcat = selectedSectionForProduct.split("-")[1] as keyof typeof promociones
        setPromociones(prev => ({
          ...prev,
          [subcat]: [...(prev[subcat] || []), newProductItem]
        }))
      } else if (selectedSectionForProduct.startsWith("vinos-")) {
        // Para subcategorías de vinos
        const subcat = selectedSectionForProduct.split("-")[1] as keyof typeof vinos
        setVinos(prev => ({
          ...prev,
          [subcat]: [...(prev[subcat] || []), newProductItem]
        }))
      } else {
        // Para otras secciones estándar o subcategorías dinámicas
        switch (selectedSectionForProduct) {
          case "parrilla":
            setParrilla(prev => [...prev, newProductItem])
            break
          case "tapeo":
            setTapeo(prev => [...prev, newProductItem])
            break
          case "cafeteria":
            setCafeteria(prev => [...prev, newProductItem])
            break
          case "pasteleria":
            setPasteleria(prev => [...prev, newProductItem])
            break
          case "bebidasSinAlcohol":
            setBebidasSinAlcohol(prev => [...prev, newProductItem])
            break
          case "cervezas":
            setCervezas(prev => [...prev, newProductItem])
            break
          case "tragosClasicos":
            setTragosClasicos(prev => [...prev, newProductItem])
            break
          case "tragosEspeciales":
            setTragosEspeciales(prev => [...prev, newProductItem])
            break
          case "tragosRedBull":
            setTragosRedBull(prev => [...prev, newProductItem])
            break
          case "botellas":
            setBotellas(prev => [...prev, newProductItem])
            break
          default:
            // Para subcategorías dinámicas
            setMenuSections(prev => ({
              ...prev,
              [selectedSectionForProduct]: [...(prev[selectedSectionForProduct] || []), newProductItem]
            }))
        }
      }
      
      // Limpiar formulario y cerrar modal
      setNewProduct({
        name: "",
        description: "",
        price: "",
        tags: []
      })
      setSelectedSectionForProduct("")
      setIsAddingProduct(false)
      
      // Mostrar mensaje de éxito
      setNotificationStatus("✅ Producto agregado exitosamente")
      setTimeout(() => setNotificationStatus(""), 3000)
    } catch (error) {
      console.error("Error adding product:", error)
      alert("Error al agregar el producto")
    }
  }

  // Función para agregar nueva subcategoría
  const handleAddNewSubcategory = async () => {
    if (!newSubcategoryName.trim() || !selectedCategoryForSubcategory) return
    
    try {
      const subcategoryId = newSubcategoryName.toLowerCase().replace(/\s+/g, '-')
      
      // Verificar que la subcategoría no exista ya
      if (subcategoryMapping[subcategoryId]) {
        alert("Ya existe una subcategoría con ese nombre")
        return
      }
      
      // Agregar la nueva subcategoría al mapeo
      const newMapping = {
        ...subcategoryMapping,
        [subcategoryId]: selectedCategoryForSubcategory
      }
      
      console.log("Nuevo mapeo de subcategorías:", newMapping)
      setSubcategoryMapping(newMapping)
      
      // Inicializar la subcategoría en menuSections con un array vacío
      setMenuSections(prev => ({
        ...prev,
        [subcategoryId]: []
      }))
      
      // PERSISTIR LA SUBCATEGORÍA EN EL ARCHIVO JSON DEL MENÚ
      try {
        // Crear la subcategoría en el archivo menu.json
        const menuResponse = await fetch("/api/menu")
        if (menuResponse.ok) {
          const menuData = await menuResponse.json()
          
          // Agregar la nueva subcategoría al menú
          const updatedMenuData = {
            ...menuData,
            [subcategoryId]: [] // Array vacío para la nueva subcategoría
          }
          
          // Guardar el menú actualizado
          const saveMenuResponse = await fetch("/api/menu", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedMenuData),
          })
          
          if (!saveMenuResponse.ok) {
            throw new Error("Error al guardar la subcategoría en el menú")
          }
          
          console.log("Subcategoría creada en el archivo menu.json:", subcategoryId)
        } else {
          throw new Error("Error al cargar los datos del menú")
        }
      } catch (error) {
        console.error("Error configurando subcategoría en menu.json:", error)
        alert("Advertencia: La subcategoría se creó localmente pero no se pudo guardar en el menú")
      }
      
      // PERSISTIR EL MAPEO DE SUBCATEGORÍAS EN EL ARCHIVO JSON
      try {
        const mappingResponse = await fetch("/api/admin/subcategory-mapping", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newMapping),
        })
        
        if (!mappingResponse.ok) {
          throw new Error("Error al guardar el mapeo de subcategorías")
        }
        
        console.log("Mapeo de subcategorías guardado exitosamente")
      } catch (error) {
        console.error("Error guardando mapeo de subcategorías:", error)
        alert("Advertencia: La subcategoría se creó pero no se pudo guardar el mapeo")
      }
      
      // Limpiar y cerrar modal
      setNewSubcategoryName("")
      setSelectedCategoryForSubcategory("")
      setIsAddingSubcategory(false)
      
      // Recargar el mapeo de subcategorías para asegurar sincronización
      try {
        const mappingResponse = await fetch("/api/admin/subcategory-mapping")
        if (mappingResponse.ok) {
          const mappingData = await mappingResponse.json()
          setSubcategoryMapping(mappingData)
          console.log("Mapeo de subcategorías recargado:", mappingData)
        }
      } catch (error) {
        console.warn("Error recargando mapeo de subcategorías:", error)
      }
      
      // Mostrar mensaje de éxito
      setNotificationStatus("✅ Subcategoría creada exitosamente")
      setTimeout(() => setNotificationStatus(""), 3000)
    } catch (error) {
      console.error("Error adding subcategory:", error)
      alert("Error al agregar la subcategoría")
    }
  }

  // Función para editar categoría
  const handleEditCategory = (category: any) => {
    setEditingCategory(category)
    // Cargar la descripción actual de la categoría desde el hook useCategories
    const categoryData = categories[category.id]
    setEditingCategoryDescription(categoryData?.description || "")
  }

  // Función para guardar cambios de categoría
  const handleSaveCategory = async (updatedCategory: any) => {
    try {
      setSaving(true)
      setNotificationStatus("Guardando cambios de categoría...")
      
      // Actualizar la descripción de la categoría usando el hook useCategories
      if (updatedCategory.description !== undefined) {
        await updateCategory(updatedCategory.id, {
          name: updatedCategory.name,
          description: updatedCategory.description || "",
          order: updatedCategory.order || 1
        })
      }
      
      // Actualizar el estado local
      setAllCategories(prev => 
        prev.map(cat => 
          cat.id === updatedCategory.id ? updatedCategory : cat
        )
      )
      
      // Si se cambió el nombre de la categoría, actualizar también el mapeo de subcategorías
      if (updatedCategory.name !== editingCategory?.name) {
        setSubcategoryMapping(prev => {
          const newMapping = { ...prev }
          Object.keys(newMapping).forEach(key => {
            if (newMapping[key] === updatedCategory.id) {
              // Aquí podrías implementar la lógica para renombrar la subcategoría
              // Por ahora solo actualizamos el mapeo
            }
          })
          return newMapping
        })
      }
      
      // Si se ocultó la categoría, ocultar también todos los productos
      if (updatedCategory.hidden && !editingCategory?.hidden) {
        // Ocultar todos los productos de la categoría
        const categoryItems = getCategoryItems(updatedCategory.id)
        if (categoryItems.length > 0) {
          for (const item of categoryItems) {
            try {
              await fetch(`/api/menu/${updatedCategory.id}/${item.id}/visibility`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  hidden: true,
                  reason: "Categoría oculta",
                  hiddenBy: "admin",
                  timestamp: new Date().toISOString()
                }),
              })
            } catch (error) {
              console.warn("No se pudo ocultar el producto:", item.id)
            }
          }
        }
      }
      
      setEditingCategory(null)
      setEditingCategoryDescription("")
      setNotificationStatus("✅ Categoría actualizada")
      setTimeout(() => setNotificationStatus(""), 3000)
    } catch (error) {
      console.error("Error saving category:", error)
      alert("Error al guardar la categoría")
    } finally {
      setSaving(false)
    }
  }

  // Función para eliminar categoría
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      // Verificar si la categoría tiene productos
      let hasProducts = false
      let productCount = 0
      
      switch (categoryId) {
        case "parrilla":
          hasProducts = parrilla.length > 0
          productCount = parrilla.length
          break
        case "guarniciones":
          hasProducts = guarniciones.length > 0
          productCount = guarniciones.length
          break
        case "tapeo":
          hasProducts = tapeo.length > 0
          productCount = tapeo.length
          break
        case "milanesas":
          hasProducts = milanesas.length > 0
          productCount = milanesas.length
          break
        case "hamburguesas":
          hasProducts = hamburguesas.length > 0
          productCount = hamburguesas.length
          break
        case "ensaladas":
          hasProducts = ensaladas.length > 0
          productCount = ensaladas.length
          break
        case "otros":
          hasProducts = otros.length > 0
          productCount = otros.length
          break
        case "postres":
          hasProducts = postres.length > 0
          productCount = postres.length
          break
        case "sandwicheria":
          hasProducts = sandwicheria.length > 0
          productCount = sandwicheria.length
          break
        case "cafeteria":
          hasProducts = cafeteria.length > 0
          productCount = cafeteria.length
          break
        case "pasteleria":
          hasProducts = pasteleria.length > 0
          productCount = pasteleria.length
          break
        case "bebidasSinAlcohol":
          hasProducts = bebidasSinAlcohol.length > 0
          productCount = bebidasSinAlcohol.length
          break
        case "cervezas":
          hasProducts = cervezas.length > 0
          productCount = cervezas.length
          break
        case "tragosClasicos":
          hasProducts = tragosClasicos.length > 0
          productCount = tragosClasicos.length
          break
        case "tragosEspeciales":
          hasProducts = tragosEspeciales.length > 0
          productCount = tragosEspeciales.length
          break
        case "tragosRedBull":
          hasProducts = tragosRedBull.length > 0
          productCount = tragosRedBull.length
          break
        case "botellas":
          hasProducts = botellas.length > 0
          productCount = botellas.length
          break
        default:
          hasProducts = (menuSections[categoryId] || []).length > 0
          productCount = (menuSections[categoryId] || []).length
      }

      let confirmMessage = `¿Estás seguro de que quieres eliminar la categoría "${categoryId}"?`
      if (hasProducts) {
        confirmMessage += `\n\n⚠️ ADVERTENCIA: Esta categoría contiene ${productCount} producto(s). Al eliminar la categoría, todos los productos se perderán permanentemente.`
      }
      confirmMessage += "\n\nEsta acción no se puede deshacer."
      
      if (!confirm(confirmMessage)) {
        return
      }

      setSaving(true)
      setNotificationStatus("Eliminando categoría...")

      // Guardar la categoría eliminada para posible restauración
      const deletedCategory = allCategories.find(cat => cat.id === categoryId)
      if (deletedCategory) {
        setDeletedCategories(prev => [...prev, { ...deletedCategory, deletedAt: new Date().toISOString() }])
      }

      // Eliminar la categoría del estado local
      setAllCategories(prev => prev.filter(cat => cat.id !== categoryId))

      // Eliminar del mapeo de subcategorías
      setSubcategoryMapping(prev => {
        const newMapping = { ...prev }
        Object.keys(newMapping).forEach(key => {
          if (newMapping[key] === categoryId) {
            delete newMapping[key]
          }
        })
        return newMapping
      })

      // Limpiar los estados locales de las categorías eliminadas
      switch (categoryId) {
        case "parrilla":
          setParrilla([])
          break
        case "guarniciones":
          setGuarniciones([])
          break
        case "tapeo":
          setTapeo([])
          break
        case "milanesas":
          setMilanesas([])
          break
        case "hamburguesas":
          setHamburguesas([])
          break
        case "ensaladas":
          setEnsaladas([])
          break
        case "otros":
          setOtros([])
          break
        case "postres":
          setPostres([])
          break
        case "sandwicheria":
          setSandwicheria([])
          break
        case "cafeteria":
          setCafeteria([])
          break
        case "pasteleria":
          setPasteleria([])
          break
        case "bebidasSinAlcohol":
          setBebidasSinAlcohol([])
          break
        case "cervezas":
          setCervezas([])
          break
        case "tragosClasicos":
          setTragosClasicos([])
          break
        case "tragosEspeciales":
          setTragosEspeciales([])
          break
        case "tragosRedBull":
          setTragosRedBull([])
          break
        case "botellas":
          setBotellas([])
          break
        default:
          // Para categorías personalizadas
          setMenuSections(prev => {
            const newSections = { ...prev }
            delete newSections[categoryId]
            return newSections
          })
      }

      // Eliminar del servidor solo si la categoría existe en el archivo JSON
      try {
        const response = await fetch(`/api/menu/${categoryId}`, {
          method: "DELETE",
        })
        
        if (!response.ok && response.status !== 404) {
          console.warn("Error al eliminar del servidor:", response.statusText)
        }
      } catch (error) {
        console.warn("No se pudo eliminar del servidor:", error)
      }

      // Actualizar el archivo de categorías para eliminar la categoría
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const categoriesData = await response.json()
          const updatedCategories = { ...categoriesData }
          delete updatedCategories[categoryId]
          
          console.log("Eliminando categoría del archivo categories.json:", categoryId)
          console.log("Categorías actualizadas:", updatedCategories)
          
          const updateResponse = await fetch('/api/categories', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedCategories),
          })
          
          if (updateResponse.ok) {
            console.log("Categoría eliminada exitosamente del archivo categories.json")
            // Recargar los datos del admin para sincronizar
            await refetchAdminMenu()
          } else {
            console.error("Error al actualizar categories.json:", updateResponse.statusText)
          }
        }
      } catch (error) {
        console.warn("No se pudo actualizar el archivo de categorías:", error)
      }

      setNotificationStatus("✅ Categoría eliminada")
      setTimeout(() => setNotificationStatus(""), 3000)
    } catch (error) {
      console.error("Error deleting category:", error)
      alert("Error al eliminar la categoría")
    } finally {
      setSaving(false)
    }
  }

  // Función para restaurar categoría eliminada
  const handleRestoreCategory = async (deletedCategory: any) => {
    try {
      setSaving(true)
      setNotificationStatus("Restaurando categoría...")

      // Restaurar la categoría al estado principal
      setAllCategories(prev => [...prev, { ...deletedCategory, deletedAt: undefined }])

      // Remover de la lista de categorías eliminadas
      setDeletedCategories(prev => prev.filter(cat => cat.id !== deletedCategory.id))

      setNotificationStatus("✅ Categoría restaurada")
      setTimeout(() => setNotificationStatus(""), 3000)
    } catch (error) {
      console.error("Error restoring category:", error)
      alert("Error al restaurar la categoría")
    } finally {
      setSaving(false)
    }
  }

  // Función auxiliar para obtener productos de una categoría
  const getCategoryItems = (categoryId: string) => {
    switch (categoryId) {
      case "parrilla":
        return parrilla
      case "guarniciones":
        return guarniciones
      case "tapeo":
        return tapeo
      case "milanesas":
        return milanesas
      case "hamburguesas":
        return hamburguesas
      case "ensaladas":
        return ensaladas
      case "otros":
        return otros
      case "postres":
        return postres
      case "sandwicheria":
        return sandwicheria
      case "cafeteria":
        return cafeteria
      case "pasteleria":
        return pasteleria
      case "bebidasSinAlcohol":
        return bebidasSinAlcohol
      case "cervezas":
        return cervezas
      case "tragosClasicos":
        return tragosClasicos
      case "tragosEspeciales":
        return tragosEspeciales
      case "tragosRedBull":
        return tragosRedBull
      case "botellas":
        return botellas
      default:
        return menuSections[categoryId] || []
    }
  }

  // Función para eliminar subcategoría
  const handleDeleteSubcategory = async (subcategoryId: string) => {
    // Verificar que la subcategoría existe en el mapeo
    if (!subcategoryMapping[subcategoryId]) {
      alert(`La subcategoría "${subcategoryId}" no existe en el mapeo`)
      return
    }
    try {
      // Verificar si la subcategoría tiene productos
      const products = menuSections[subcategoryId] || []
      const hasProducts = products.length > 0
      const productCount = products.length

      let confirmMessage = `¿Estás seguro de que quieres eliminar la subcategoría "${subcategoryId}"?`
      if (hasProducts) {
        confirmMessage += `\n\n⚠️ ADVERTENCIA: Esta subcategoría contiene ${productCount} producto(s). Al eliminar la subcategoría, todos los productos se perderán permanentemente.`
      }
      confirmMessage += "\n\nEsta acción no se puede deshacer."
      
      if (!confirm(confirmMessage)) {
        return
      }

      setSaving(true)
      setNotificationStatus("Eliminando subcategoría...")

      // Eliminar del mapeo de subcategorías
      const newMapping = { ...subcategoryMapping }
      delete newMapping[subcategoryId]
      setSubcategoryMapping(newMapping)

      // Eliminar del estado local de secciones del menú
      setMenuSections(prev => {
        const newSections = { ...prev }
        delete newSections[subcategoryId]
        return newSections
      })

      // PERSISTIR EL MAPEO DE SUBCATEGORÍAS EN EL ARCHIVO JSON
      try {
        const mappingResponse = await fetch("/api/admin/subcategory-mapping", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newMapping),
        })
        
        if (!mappingResponse.ok) {
          throw new Error("Error al guardar el mapeo de subcategorías")
        }
        
        console.log("Mapeo de subcategorías actualizado exitosamente")
      } catch (error) {
        console.error("Error guardando mapeo de subcategorías:", error)
        alert("Advertencia: La subcategoría se eliminó localmente pero no se pudo guardar el mapeo")
      }

      // Eliminar del servidor (si existe la API)
      try {
        const deleteResponse = await fetch(`/api/menu/${subcategoryId}`, {
          method: "DELETE",
        })
        
        if (deleteResponse.ok) {
          console.log(`Subcategoría ${subcategoryId} eliminada del archivo de menú`)
        } else {
          console.warn(`No se pudo eliminar ${subcategoryId} del archivo de menú:`, deleteResponse.status)
        }
      } catch (error) {
        console.warn("Error eliminando del servidor:", error)
      }

      setNotificationStatus(`✅ Subcategoría "${subcategoryId}" eliminada completamente`)
      setTimeout(() => setNotificationStatus(""), 4000)
      
      // Recargar el mapeo de subcategorías para asegurar sincronización
      try {
        const mappingResponse = await fetch("/api/admin/subcategory-mapping")
        if (mappingResponse.ok) {
          const mappingData = await mappingResponse.json()
          setSubcategoryMapping(mappingData)
          console.log("Mapeo de subcategorías recargado después de eliminar:", mappingData)
        }
      } catch (error) {
        console.warn("Error recargando mapeo de subcategorías:", error)
      }
      
      // Recargar datos del menú para asegurar sincronización completa
      await refetchAdminMenu()
      
      // Limpiar mapeos inválidos (subcategorías que apuntan a categorías inexistentes)
      const validCategories = allCategories.map(cat => cat.id)
      const invalidMappings = Object.entries(subcategoryMapping).filter(
        ([subcatId, parentId]) => !validCategories.includes(parentId)
      )
      
      if (invalidMappings.length > 0) {
        console.warn("Mapeos inválidos encontrados:", invalidMappings)
        const cleanedMapping = { ...subcategoryMapping }
        invalidMappings.forEach(([subcatId]) => {
          delete cleanedMapping[subcatId]
        })
        
        if (Object.keys(cleanedMapping).length !== Object.keys(subcategoryMapping).length) {
          setSubcategoryMapping(cleanedMapping)
          
          // Guardar el mapeo limpio
          try {
            const mappingResponse = await fetch("/api/admin/subcategory-mapping", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(cleanedMapping),
            })
            if (mappingResponse.ok) {
              console.log("Mapeo de subcategorías limpiado y guardado")
            }
          } catch (error) {
            console.warn("Error guardando mapeo limpio:", error)
          }
        }
      }
    } catch (error) {
      console.error("Error deleting subcategory:", error)
      alert("Error al eliminar la subcategoría")
    } finally {
      setSaving(false)
    }
  }

  // Función para aumentar precios masivamente por categoría
  const handleBulkPriceIncrease = async (categoryId: string, percentage: number) => {
    try {
      setSaving(true)
      setNotificationStatus(`Aumentando precios en ${percentage}%...`)
      
      // Obtener todos los productos de la categoría
      let categoryItems: any[] = []
      
      switch (categoryId) {
        case "parrilla":
          categoryItems = parrilla
          break
        case "guarniciones":
          categoryItems = guarniciones
          break
        case "tapeo":
          categoryItems = tapeo
          break
        case "milanesas":
          categoryItems = milanesas
          break
        case "hamburguesas":
          categoryItems = hamburguesas
          break
        case "ensaladas":
          categoryItems = ensaladas
          break
        case "otros":
          categoryItems = otros
          break
        case "postres":
          categoryItems = postres
          break
        case "sandwicheria":
          categoryItems = sandwicheria
          break
        case "cafeteria":
          categoryItems = cafeteria
          break
        case "pasteleria":
          categoryItems = pasteleria
          break
        case "bebidasSinAlcohol":
          categoryItems = bebidasSinAlcohol
          break
        case "cervezas":
          categoryItems = cervezas
          break
        case "tragosClasicos":
          categoryItems = tragosClasicos
          break
        case "tragosEspeciales":
          categoryItems = tragosEspeciales
          break
        case "tragosRedBull":
          categoryItems = tragosRedBull
          break
        case "botellas":
          categoryItems = botellas
          break
        default:
          // Para categorías personalizadas
          categoryItems = menuSections[categoryId] || []
      }
      
      if (categoryItems.length === 0) {
        alert("No hay productos en esta categoría para actualizar")
        return
      }
      
      // Actualizar precios de todos los productos
      const updatedItems = categoryItems.map(item => ({
        ...item,
        price: (parseFloat(item.price) * (1 + percentage / 100)).toFixed(2)
      }))
      
      // Guardar cambios en el servidor
      for (const item of updatedItems) {
        await fetch(`/api/menu/${categoryId}/${item.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(item),
        })
      }
      
      // Actualizar estado local según la categoría
      switch (categoryId) {
        case "parrilla":
          setParrilla(updatedItems)
          break
        case "guarniciones":
          setGuarniciones(updatedItems)
          break
        case "tapeo":
          setTapeo(updatedItems)
          break
        case "milanesas":
          setMilanesas(updatedItems)
          break
        case "hamburguesas":
          setHamburguesas(updatedItems)
          break
        case "ensaladas":
          setEnsaladas(updatedItems)
          break
        case "otros":
          setOtros(updatedItems)
          break
        case "postres":
          setPostres(updatedItems)
          break
        case "sandwicheria":
          setSandwicheria(updatedItems)
          break
        case "cafeteria":
          setCafeteria(updatedItems)
          break
        case "pasteleria":
          setPasteleria(updatedItems)
          break
        case "bebidasSinAlcohol":
          setBebidasSinAlcohol(updatedItems)
          break
        case "cervezas":
          setCervezas(updatedItems)
          break
        case "tragosClasicos":
          setTragosClasicos(updatedItems)
          break
        case "tragosEspeciales":
          setTragosEspeciales(updatedItems)
          break
        case "tragosRedBull":
          setTragosRedBull(updatedItems)
          break
        case "botellas":
          setBotellas(updatedItems)
          break
        case "vinos":
          // Los vinos tienen subcategorías, actualizar cada una
          if (categoryId.startsWith("vinos-")) {
            const subCategory = categoryId.split("-")[1]
            setVinos(prev => ({
              ...prev,
              [subCategory]: updatedItems
            }))
          }
          break
        default:
          // Para categorías personalizadas
          setMenuSections(prev => ({
            ...prev,
            [categoryId]: updatedItems
          }))
      }
      
      setNotificationStatus(`✅ Precios aumentados en ${percentage}%`)
      setTimeout(() => setNotificationStatus(""), 3000)
      
    } catch (error) {
      console.error("Error updating prices:", error)
      alert("Error al actualizar los precios")
    } finally {
      setSaving(false)
    }
  }

  // Función para aumentar precios porcentualmente en toda la carta
  const handleIncreaseAllPrices = async () => {
    if (!priceIncreasePercentage || isNaN(parseFloat(priceIncreasePercentage)) || parseFloat(priceIncreasePercentage) <= 0) {
      alert("Por favor ingresa un porcentaje válido mayor a 0")
      return
    }

    const percentage = parseFloat(priceIncreasePercentage)
    const confirmMessage = `¿Estás seguro de que quieres aumentar TODOS los precios de la carta en un ${percentage}%?\n\nEsta acción afectará TODOS los productos y NO se puede deshacer.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setIsIncreasingPrices(true)
      setNotificationStatus(`Aumentando todos los precios en ${percentage}%...`)

      const response = await fetch("/api/admin/increase-prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ percentage }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al aumentar precios")
      }

      const result = await response.json()
      
      // Recargar todos los datos del menú
      await refetchAdminMenu()
      
      setNotificationStatus(`✅ ${result.message}`)
      setShowPriceIncreaseModal(false)
      setPriceIncreasePercentage("")
      
      setTimeout(() => setNotificationStatus(""), 5000)

    } catch (error) {
      console.error("Error increasing prices:", error)
      alert(`Error al aumentar precios: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setIsIncreasingPrices(false)
    }
  }

  // Función para renderizar subcategorías dentro de una categoría
  const renderSubcategories = (categoryId: string) => {
    const subcategories = Object.entries(subcategoryMapping)
      .filter(([subcatId, parentId]) => parentId === categoryId)
      .map(([subcatId]) => subcatId)
    
    // Debug: mostrar información de subcategorías (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Renderizando subcategorías para ${categoryId}:`, subcategories)
    }
    
    if (subcategories.length === 0) {
      // Debug: mostrar cuando no hay subcategorías
      if (process.env.NODE_ENV === 'development') {
        console.log(`No hay subcategorías para ${categoryId}`)
      }
      return null
    }
    
    return (
      <div className="space-y-6 mt-8">
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="text-[#f4b942]">📁</span>
            Subcategorías Dinámicas
          </h3>
        </div>
        
        {subcategories.map(subcatId => {
          const subcatData = menuSections[subcatId] || []
          const subcatName = subcatId.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
          
          // Debug: mostrar información de cada subcategoría
          if (process.env.NODE_ENV === 'development') {
            console.log(`Subcategoría ${subcatId}:`, { subcatName, productCount: subcatData.length })
          }
          
          return (
            <div key={subcatId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-[#8bc34a]">🔹</span>
                  {subcatName}
                  <span className="text-sm text-gray-500 font-normal">
                    ({subcatData.length} producto{subcatData.length !== 1 ? 's' : ''})
                  </span>
                </h4>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold"
                    onClick={() => {
                      setSelectedSectionForProduct(subcatId)
                      setIsAddingProduct(true)
                    }}
                  >
                    <Plus className="w-4 h-4 text-white" />
                    <span className="text-white">Agregar Producto</span>
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white border-red-600 font-semibold admin-delete-button"
                    onClick={() => handleDeleteSubcategory(subcatId)}
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                    Eliminar
                  </Button>
                </div>
              </div>
              
              {subcatData.length > 0 ? (
                <div className="space-y-3">
                  {subcatData.map((item) => renderMenuItem(item, subcatId))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 bg-white rounded border-2 border-dashed border-gray-300">
                  <p className="text-sm">No hay productos en esta subcategoría aún.</p>
                  <p className="text-xs mt-1">Haz clic en "Agregar Producto" para comenzar.</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderMenuItem = (item: MenuItem, section: string) => (
    <Card key={item.id} className={`mb-4 ${item.hidden ? 'admin-hidden-item bg-gray-100' : 'admin-visible-item'}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`font-semibold text-lg ${item.hidden ? 'item-name text-gray-600' : 'item-name'}`}>{item.name}</h3>
              <span className={`font-bold ${item.hidden ? 'text-gray-500' : 'text-gold'}`}>${item.price}</span>
              {item.hidden && (
                <Badge variant="secondary" className="admin-hidden-badge text-xs bg-gray-300">
                  <EyeOff className="w-3 h-3 mr-1" />
                  OCULTO
                </Badge>
              )}
            </div>
            <p className={`text-sm mb-2 ${item.hidden ? 'item-description text-gray-500' : 'item-description'}`}>
              {formatDescription(item.description)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 ml-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleEdit(item, section)}
                className="bg-black hover:bg-gray-800 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
              >
                <Edit className="w-4 h-4 text-white" />
              </Button>
              <Button
                size="sm"
                onClick={() => handleToggleVisibility(item, section)}
                className={`group relative ${
                  item.hidden 
                    ? "bg-orange-600 hover:bg-green-600 text-white" 
                    : "bg-green-600 hover:bg-orange-600 text-white"
                } border-0 shadow-md hover:shadow-lg transition-all duration-200 font-semibold`}
              >
                {/* Visible: muestra Eye verde, hover muestra EyeOff naranja */}
                {/* Oculto: muestra EyeOff naranja, hover muestra Eye verde */}
                <span className="group-hover:hidden">
                  {item.hidden ? <EyeOff className="w-4 h-4 text-white" /> : <Eye className="w-4 h-4 text-white" />}
                </span>
                <span className="hidden group-hover:block">
                  {item.hidden ? <Eye className="w-4 h-4 text-white" /> : <EyeOff className="w-4 h-4 text-white" />}
                </span>
              </Button>
              <Button 
                size="sm"
                onClick={() => handleDelete(item.id, section)}
                className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 font-semibold admin-delete-button"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </Button>
            </div>
            {item.tags && (
              <div className="flex gap-1 mt-2">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag === "vegan" && "🌱"}
                    {tag === "sin-tacc" && "🌾"}
                    {tag === "picante" && "🔥"}
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderDrinkItem = (item: DrinkItem, section: string) => (
    <Card key={item.id} className={`mb-4 ${item.hidden ? 'admin-hidden-item bg-gray-100' : 'admin-visible-item'}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`font-semibold text-lg ${item.hidden ? 'item-name text-gray-600' : 'item-name'}`}>{item.name}</h3>
              <span className={`font-bold ${item.hidden ? 'text-gray-500' : 'text-gold'}`}>${item.price}</span>
              {item.hidden && (
                <Badge variant="secondary" className="admin-hidden-badge text-xs bg-gray-300">
                  <EyeOff className="w-3 h-3 mr-1" />
                  OCULTO
                </Badge>
              )}
            </div>
            {item.description && (
              <p className={`text-sm mb-2 italic ${item.hidden ? 'item-description text-gray-500' : 'item-description'}`}>
                {formatDescription(item.description)}
              </p>
            )}
            <div className={`grid grid-cols-2 gap-2 text-xs ${item.hidden ? 'item-details text-gray-500' : 'item-details'}`}>
              {item.ingredients && (
                <div><strong>Ingredientes:</strong> {item.ingredients}</div>
              )}
              {item.glass && (
                <div><strong>Vaso:</strong> {item.glass}</div>
              )}
              {item.technique && (
                <div><strong>Técnica:</strong> {item.technique}</div>
              )}
              {item.garnish && (
                <div><strong>Garnish:</strong> {item.garnish}</div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 ml-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleEdit(item, section)}
                className="bg-black hover:bg-gray-800 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
              >
                <Edit className="w-4 h-4 text-white" />
              </Button>
              <Button
                size="sm"
                onClick={() => handleToggleVisibility(item, section)}
                className={`group relative ${
                  item.hidden 
                    ? "bg-orange-600 hover:bg-green-600 text-white" 
                    : "bg-green-600 hover:bg-orange-600 text-white"
                } border-0 shadow-md hover:shadow-lg transition-all duration-200 font-semibold`}
              >
                {/* Visible: muestra Eye verde, hover muestra EyeOff naranja */}
                {/* Oculto: muestra EyeOff naranja, hover muestra Eye verde */}
                <span className="group-hover:hidden">
                  {item.hidden ? <EyeOff className="w-4 h-4 text-white" /> : <Eye className="w-4 h-4 text-white" />}
                </span>
                <span className="hidden group-hover:block">
                  {item.hidden ? <Eye className="w-4 h-4 text-white" /> : <EyeOff className="w-4 h-4 text-white" />}
                </span>
              </Button>
              <Button 
                size="sm"
                onClick={() => handleDelete(item.id, section)}
                className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 font-semibold admin-delete-button"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </Button>
            </div>
        </div>
      </div>
    </CardContent>
  </Card>
)

  const renderWineItem = (item: WineItem, section: string) => (
    <Card key={item.id} className={`mb-4 ${item.hidden ? 'admin-hidden-item bg-gray-100' : 'admin-visible-item'}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold ${item.hidden ? 'item-name text-gray-600' : 'item-name'}`}>{item.name}</h3>
            {item.hidden && (
              <Badge variant="secondary" className="admin-hidden-badge text-xs bg-gray-300">
                <EyeOff className="w-3 h-3 mr-1" />
                OCULTO
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-bold ${item.hidden ? 'text-gray-500' : 'text-gold'}`}>${item.price}</span>
            <Button
              size="sm"
              onClick={() => handleEdit(item, section)}
              className="bg-black hover:bg-gray-800 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
            >
              <Edit className="w-4 h-4 text-white" />
            </Button>
            <Button
              size="sm"
              onClick={() => handleToggleVisibility(item, section)}
              className={`group relative ${
                item.hidden 
                  ? "bg-orange-600 hover:bg-green-600 text-white" 
                  : "bg-green-600 hover:bg-orange-600 text-white"
              } border-0 shadow-md hover:shadow-lg transition-all duration-200 font-semibold`}
            >
              {/* Visible: muestra Eye verde, hover muestra EyeOff naranja */}
              {/* Oculto: muestra EyeOff naranja, hover muestra Eye verde */}
              <span className="group-hover:hidden">
                {item.hidden ? <EyeOff className="w-4 h-4 text-white" /> : <Eye className="w-4 h-4 text-white" />}
              </span>
              <span className="hidden group-hover:block">
                {item.hidden ? <Eye className="w-4 h-4 text-white" /> : <EyeOff className="w-4 h-4 text-white" />}
              </span>
            </Button>
              <Button 
                size="sm"
                onClick={() => handleDelete(item.id, section)}
                className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 font-semibold admin-delete-button"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Mostrar pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  // Mostrar pantalla de login si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Degradado de fondo igual al de la carátula del menú */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-black/50"></div>
        
        {/* Contenido centrado */}
        <div className="relative z-10">
          <Card className="w-full max-w-md bg-black/80 backdrop-blur-sm border-gray-700">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-amber-900/20 rounded-full border border-amber-600/30">
                  <Lock className="w-8 h-8 text-amber-400" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Panel de Administración
              </CardTitle>
              <p className="text-gray-300">COBRA - Acceso Restringido</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa la contraseña"
                    className="w-full bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-amber-500 focus:ring-amber-500"
                    required
                  />
                </div>
                {loginError && (
                  <div className="text-red-400 text-sm text-center">
                    {loginError}
                  </div>
                )}
                <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white border-0">
                  Acceder
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Si estamos editando o agregando, mostrar el formulario correspondiente
  if (isEditing && editingItem) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={handleCancel}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al panel
          </Button>
          <EditForm
            item={editingItem}
            section={isEditing}
            onSave={(item) => handleSave(isEditing, item)}
            onCancel={handleCancel}
          />
        </div>
      </div>
    )
  }

  if (isAdding) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={handleCancel}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al panel
          </Button>
          <AddForm
            section={isAdding}
            onAdd={(item) => handleAdd(isAdding, item)}
            onCancel={handleCancel}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 admin-panel">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Panel de Administración - COBRA
            </h1>
            <p className="text-gray-600">
              Gestiona el contenido del menú de tu restaurante
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={() => setShowPriceIncreaseModal(true)}
              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
            >
              <span className="text-lg">📈</span>
              Aumentar Precios
            </Button>
            <Button 
              onClick={() => setIsReorderingCategories(true)}
              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
            >
              <GripVertical className="w-4 h-4" />
              <span style={{ color: "white" }}>Reordenar Categorías</span>
            </Button>
            <Button 
              onClick={() => setIsEditingCategories(true)}
              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
            >
              <Edit className="w-4 h-4" />
              <span style={{ color: "white" }}>Editar Categorías</span>
            </Button>
            <Button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
            >
              <Lock className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </header>

        {/* Indicador de estado de notificaciones */}
        {notificationStatus && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm font-medium">{notificationStatus}</p>
          </div>
        )}

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Todas las categorías en una sola lista */}
          <div className="relative">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {allCategories.length} categoría{allCategories.length !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {allCategories.filter(cat => !cat.isStandard).length} personalizada{allCategories.filter(cat => !cat.isStandard).length !== 1 ? 's' : ''}
                </span>
                {(() => {
                  const outOfTimeCount = allCategories.filter(cat => 
                    categories[cat.id]?.timeRestricted && !isCategoryVisible(cat.id, categories)
                  ).length
                  
                  return outOfTimeCount > 0 ? (
                    <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {outOfTimeCount} fuera de horario
                    </span>
                  ) : null
                })()}
              </div>
            </div>
            <TabsList className="grid w-full gap-2 grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
            {allCategories.map((category) => {
              // Contar subcategorías para esta categoría
              const subcategoryCount = Object.entries(subcategoryMapping)
                .filter(([subcatId, parentId]) => parentId === category.id)
                .length
              
              // Verificar si la categoría está visible según su horario
              const isVisible = isCategoryVisible(category.id, categories)
              
              return (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id} 
                  className={`relative transition-all duration-300 text-xs sm:text-sm ${
                    category.id === activeTab ? 'scale-105' : ''
                  } ${
                    !isVisible ? 'opacity-50 text-gray-400' : ''
                  }`}
                  title={!isVisible ? 'Categoría fuera de horario' : ''}
                >
                  {category.name}
                  {!isVisible && (
                    <span className="ml-1 text-[10px]">🕐</span>
                  )}
                  {subcategoryCount > 0 && (
                    <span className={`absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold ${
                      !isVisible ? 'bg-gray-400' : 'bg-black'
                    }`}>
                      {subcategoryCount}
                    </span>
                  )}
                </TabsTrigger>
              )
            })}
            </TabsList>
          </div>



            {/* Tabs dinámicos generados desde allCategories */}
            {allCategories.map((category) => {
              // Verificar si la categoría está visible según su horario
              const isCategoryVisibleNow = isCategoryVisible(category.id, categories)
              
              return (
              <TabsContent key={category.id} value={category.id} className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <h2 className={`text-2xl font-semibold ${isCategoryVisibleNow ? 'text-gray-900' : 'text-gray-400'}`}>
                      {category.name}
                    </h2>
                    {categories[category.id]?.timeRestricted && (
                      <Badge variant="outline" className={`flex items-center gap-1 ${
                        isCategoryVisibleNow 
                          ? 'bg-blue-50 text-blue-700 border-blue-300' 
                          : 'bg-gray-50 text-gray-500 border-gray-300'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {categories[category.id]?.startTime} - {categories[category.id]?.endTime}
                      </Badge>
                    )}
                    {!isCategoryVisibleNow && categories[category.id]?.timeRestricted && (
                      <Badge variant="outline" className="flex items-center gap-1 bg-orange-50 text-orange-700 border-orange-300">
                        Fuera de horario
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => handleOpenTimeRangeModal(category.id)}
                    >
                      <Clock className="w-4 h-4" />
                      <span>Horario</span>
                    </Button>
                    <Button 
                      size="sm"
                      className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                      onClick={() => {
                        setSelectedCategoryForSubcategory(category.id)
                        setIsAddingSubcategory(true)
                      }}
                    >
                      <Plus className="w-4 h-4 text-white" />
                      <span className="text-white">Agregar Subcategoría</span>
                    </Button>
                    <Button 
                      size="sm"
                      className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                      onClick={() => setIsAdding(category.id)}
                    >
                      <Plus className="w-4 h-4 text-white" />
                      <span className="text-white">Agregar Producto</span>
                    </Button>
                  </div>
                </div>
                
                {/* Mostrar productos de esta categoría si existen */}
                {menuSections[category.id] && menuSections[category.id].length > 0 ? (
                  menuSections[category.id].map((item) => renderMenuItem(item, category.id))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay productos en esta categoría aún.</p>
                    <p className="text-sm">Haz clic en "Agregar Producto" para comenzar.</p>
                  </div>
                )}
                
                {/* Renderizar subcategorías dinámicas */}
                {renderSubcategories(category.id)}
              </TabsContent>
            )
            })}

                     {/* Tapeo */}
           <TabsContent value="tapeo" className="space-y-4">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-semibold text-gray-900">Tapeo</h2>
               <div className="flex gap-2">
                 <Button 
                   size="sm"
                   className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                   onClick={() => {
                     setSelectedCategoryForSubcategory("tapeo")
                     setIsAddingSubcategory(true)
                   }}
                 >
                   <Plus className="w-4 h-4 text-white" />
                   <span className="text-white">Agregar Subcategoría</span>
                 </Button>
                 <Button 
                   size="sm"
                   className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                   onClick={() => setIsAdding("tapeo")}
                 >
                   <Plus className="w-4 h-4 text-white" />
                   <span className="text-white">Agregar Tapeo</span>
                 </Button>
               </div>
             </div>
             {tapeo.map((item) => renderMenuItem(item, "tapeo"))}
             
             {/* Renderizar subcategorías dinámicamente */}
             {renderSubcategories("tapeo")}
           </TabsContent>

                     {/* Principales */}
           <TabsContent value="principales" className="space-y-4">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-semibold text-gray-900">Platos Principales</h2>
               <Button 
                 size="sm"
                 className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                 onClick={() => {
                   setSelectedCategoryForSubcategory("principales")
                   setIsAddingSubcategory(true)
                 }}
               >
                 <Plus className="w-4 h-4 text-white" />
                 <span className="text-white">Agregar Subcategoría</span>
               </Button>
             </div>
             
             {/* Renderizar subcategorías dinámicamente */}
             {renderSubcategories("principales")}
           </TabsContent>

                     {/* Cafetería */}
           <TabsContent value="cafeteria" className="space-y-4">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-semibold text-gray-900">Cafetería y Pastelería</h2>
               <Button 
                 size="sm"
                 className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                 onClick={() => {
                   setSelectedCategoryForSubcategory("cafeteria")
                   setIsAddingSubcategory(true)
                 }}
               >
                 <Plus className="w-4 h-4 text-white" />
                 <span className="text-white">Agregar Subcategoría</span>
               </Button>
             </div>
             
             <div className="space-y-8">
               <div>
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-xl font-semibold text-gray-900">Cafetería</h3>
                   <Button 
                     size="sm"
                     className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                     onClick={() => setIsAdding("cafeteria")}
                   >
                     <Plus className="w-4 h-4" />
                     Agregar
                   </Button>
                 </div>
                 {cafeteria.map((item) => renderWineItem(item, "cafeteria"))}
               </div>
               
               <div>
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-xl font-semibold text-gray-900">Pastelería</h3>
                   <Button 
                     size="sm"
                     className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                     onClick={() => setIsAdding("pasteleria")}
                   >
                     <Plus className="w-4 h-4" />
                     Agregar
                   </Button>
                 </div>
                 {pasteleria.map((item) => renderWineItem(item, "pasteleria"))}
               </div>
             </div>
             
             {/* Renderizar subcategorías dinámicamente */}
             {renderSubcategories("cafeteria")}
           </TabsContent>

                     {/* Bebidas */}
           <TabsContent value="bebidas" className="space-y-4">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-semibold text-gray-900">Bebidas</h2>
               <Button 
                 size="sm"
                 className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                 onClick={() => {
                   setSelectedCategoryForSubcategory("bebidas")
                   setIsAddingSubcategory(true)
                 }}
               >
                 <Plus className="w-4 h-4 text-white" />
                 <span className="text-white">Agregar Subcategoría</span>
               </Button>
             </div>
             
             <div className="space-y-8">
               <div>
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-xl font-semibold text-gray-900">Bebidas Sin Alcohol</h3>
                   <Button 
                     size="sm"
                     className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                     onClick={() => setIsAdding("bebidasSinAlcohol")}
                   >
                     <Plus className="w-4 h-4" />
                     Agregar
                   </Button>
                 </div>
                 {bebidasSinAlcohol.map((item) => renderWineItem(item, "bebidasSinAlcohol"))}
               </div>
               
               <div>
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-xl font-semibold text-gray-900">Cervezas</h3>
                   <Button 
                     size="sm"
                     className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                     onClick={() => setIsAdding("cervezas")}
                   >
                     <Plus className="w-4 h-4" />
                     Agregar
                   </Button>
                 </div>
                 {cervezas.map((item) => renderWineItem(item, "cervezas"))}
               </div>
               
               <div>
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-xl font-semibold text-gray-900">Vinos</h3>
                 </div>
                 
                 <div className="space-y-4 ml-4">
                   <div>
                     <div className="flex justify-between items-center mb-2">
                       <h4 className="text-lg font-medium text-gray-900">Tintos</h4>
                       <Button 
                         size="sm"
                         className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                         onClick={() => setIsAdding("vinos-tintos")}
                       >
                         <Plus className="w-3 h-3" />
                         Agregar
                       </Button>
                     </div>
                     {vinos.tintos.map((item) => renderWineItem(item, "vinos-tintos"))}
                   </div>
                   
                   <div>
                     <div className="flex justify-between items-center mb-2">
                       <h4 className="text-lg font-medium text-gray-900">Blancos</h4>
                       <Button 
                         size="sm"
                         className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                         onClick={() => setIsAdding("vinos-blancos")}
                       >
                         <Plus className="w-3 h-3" />
                         Agregar
                       </Button>
                     </div>
                     {vinos.blancos.map((item) => renderWineItem(item, "vinos-blancos"))}
                   </div>
                   
                   <div>
                     <div className="flex justify-between items-center mb-2">
                       <h4 className="text-lg font-medium text-gray-900">Rosados</h4>
                       <Button 
                         size="sm"
                         className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                         onClick={() => setIsAdding("vinos-rosados")}
                       >
                         <Plus className="w-3 h-3" />
                         Agregar
                       </Button>
                     </div>
                     {vinos.rosados.map((item) => renderWineItem(item, "vinos-rosados"))}
                   </div>
                   
                   <div>
                     <div className="flex justify-between items-center mb-2">
                       <h4 className="text-lg font-medium text-gray-900">Copas</h4>
                       <Button 
                         size="sm"
                         className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                         onClick={() => setIsAdding("vinos-copas")}
                       >
                         <Plus className="w-3 h-3" />
                         Agregar
                       </Button>
                     </div>
                     {vinos.copas.map((item) => renderWineItem(item, "vinos-copas"))}
                   </div>
                 </div>
               </div>
               
               <div>
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-xl font-semibold text-gray-900">Botellas</h3>
                   <Button 
                     size="sm"
                     className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                     onClick={() => setIsAdding("botellas")}
                   >
                     <Plus className="w-4 h-4" />
                     Agregar
                   </Button>
                 </div>
                 {botellas.map((item) => renderWineItem(item, "botellas"))}
               </div>
             </div>
             
             {/* Renderizar subcategorías dinámicamente */}
             {renderSubcategories("bebidas")}
           </TabsContent>

                     {/* Tragos */}
           <TabsContent value="tragos" className="space-y-4">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-semibold text-gray-900">Tragos</h2>
               <Button 
                 size="sm"
                 className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                 onClick={() => {
                   setSelectedCategoryForSubcategory("tragos")
                   setIsAddingSubcategory(true)
                 }}
               >
                 <Plus className="w-4 h-4 text-white" />
                 <span className="text-white">Agregar Subcategoría</span>
               </Button>
             </div>
             
             <div className="space-y-8">
               <div>
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-xl font-semibold text-gray-900">Tragos Clásicos</h3>
                   <Button 
                     size="sm"
                     className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                     onClick={() => setIsAdding("tragosClasicos")}
                   >
                     <Plus className="w-4 h-4" />
                     Agregar
                   </Button>
                 </div>
                 {tragosClasicos.map((item) => renderWineItem(item, "tragosClasicos"))}
               </div>
               
               <div>
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-xl font-semibold text-gray-900">Tragos Especiales</h3>
                   <Button 
                     size="sm"
                     className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                     onClick={() => setIsAdding("tragosEspeciales")}
                   >
                     <Plus className="w-4 h-4" />
                     Agregar
                   </Button>
                 </div>
                 {tragosEspeciales.map((item) => renderWineItem(item, "tragosEspeciales"))}
               </div>
               
               <div>
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-xl font-semibold text-gray-900">Tragos con Red Bull</h3>
                   <Button 
                     size="sm"
                     className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                     onClick={() => setIsAdding("tragosRedBull")}
                   >
                     <Plus className="w-4 h-4" />
                     Agregar
                   </Button>
                 </div>
                 {tragosRedBull.map((item) => renderWineItem(item, "tragosRedBull"))}
               </div>
             </div>
             
             {/* Renderizar subcategorías dinámicamente */}
             {renderSubcategories("tragos")}
                       </TabsContent>

            {/* Promociones */}
            <TabsContent value="promociones" className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Promociones</h2>
                <Button 
                  size="sm"
                  className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                  onClick={() => {
                    setSelectedCategoryForSubcategory("promociones")
                    setIsAddingSubcategory(true)
                  }}
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span className="text-white">Agregar Subcategoría</span>
                </Button>
              </div>
              
              {/* Subcategorías estándar de promociones */}
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Café</h3>
                    <Button 
                      size="sm"
                      className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                      onClick={() => setIsAdding("promociones-cafe")}
                    >
                      <Plus className="w-4 h-4" />
                      Agregar
                    </Button>
                  </div>
                  {promociones.cafe.map((item) => renderMenuItem(item, "promociones-cafe"))}
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Tapeos</h3>
                    <Button 
                      size="sm"
                      className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                      onClick={() => setIsAdding("promociones-tapeos")}
                    >
                      <Plus className="w-4 h-4" />
                      Agregar
                    </Button>
                  </div>
                  {promociones.tapeos.map((item) => renderMenuItem(item, "promociones-tapeos"))}
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Bebidas</h3>
                    <Button 
                      size="sm"
                      className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                      onClick={() => setIsAdding("promociones-bebidas")}
                    >
                      <Plus className="w-4 h-4" />
                      Agregar
                    </Button>
                  </div>
                  {promociones.bebidas.map((item) => renderMenuItem(item, "promociones-bebidas"))}
                </div>
              </div>
              
              {/* Renderizar subcategorías dinámicas creadas por el usuario */}
              {renderSubcategories("promociones")}
            </TabsContent>

         </Tabs>
      </div>

      {/* Modal para editar categorías */}
      {isEditingCategories && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-11/12 max-w-6xl max-h-[90vh] overflow-y-auto admin-edit-categories">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-black">Editar Categorías</h3>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsAddingCategory(true)}
                  className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-0 font-semibold admin-action-button"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Categoría
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditingCategories(false)}
                  className="flex items-center gap-2 bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800 font-semibold admin-close-button"
                >
                  <X className="w-4 h-4 text-white" />
                  <span className="text-white">Cerrar</span>
                </Button>
              </div>
            </div>
            
            <div className="space-y-6">
              {allCategories.map((category) => (
                <div key={category.id} className="border-2 border-gray-300 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-black mb-2">
                        {category.name}
                      </h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700 font-medium">
                          ID: {category.id} • Tipo: {category.isStandard ? 'Estándar' : 'Personalizada'}
                        </p>
                        {/* Descripción removida temporalmente */}

                        {/* Mostrar cantidad de productos */}
                        <div className="mt-2">
                          <span className="text-xs text-gray-700 bg-gray-200 px-3 py-1 rounded-full font-medium">
                            📦 {(() => {
                              let items: any[] = []
                              switch (category.id) {
                                case "parrilla": items = parrilla; break
                                case "guarniciones": items = guarniciones; break
                                case "tapeo": items = tapeo; break
                                case "milanesas": items = milanesas; break
                                case "hamburguesas": items = hamburguesas; break
                                case "ensaladas": items = ensaladas; break
                                case "otros": items = otros; break
                                case "postres": items = postres; break
                                case "sandwicheria": items = sandwicheria; break
                                case "cafeteria": items = cafeteria; break
                                case "pasteleria": items = pasteleria; break
                                case "bebidasSinAlcohol": items = bebidasSinAlcohol; break
                                case "cervezas": items = cervezas; break
                                case "tragosClasicos": items = tragosClasicos; break
                                case "tragosEspeciales": items = tragosEspeciales; break
                                case "tragosRedBull": items = tragosRedBull; break
                                case "botellas": items = botellas; break
                                default: items = (menuSections[category.id] || [])
                              }
                              
                              const stats = getCategoryStats(items)
                              if (stats.total === 0) return 'Sin productos'
                              if (stats.hidden === 0) return `${stats.visible} visible${stats.visible !== 1 ? 's' : ''}`
                              return `${stats.visible} visible${stats.visible !== 1 ? 's' : ''} • ${stats.hidden} oculto${stats.hidden !== 1 ? 's' : ''}`
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                        className="flex items-center gap-2 bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800 font-semibold admin-edit-button"
                      >
                        <Edit className="w-4 h-4 text-white" />
                        <span className="text-white">Editar</span>
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const percentage = prompt(`Ingresa el porcentaje de aumento para ${category.name} (ej: 15 para 15%):`)
                          if (percentage && !isNaN(parseFloat(percentage))) {
                            handleBulkPriceIncrease(category.id, parseFloat(percentage))
                          }
                        }}
                        className="flex items-center gap-2 bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800 font-semibold"
                      >
                        <Plus className="w-4 h-4 text-white" />
                        <span className="text-white">Aumentar Precios</span>
                      </Button>
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="flex items-center gap-2 bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 font-semibold admin-delete-button"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                        <span className="text-white">Eliminar</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Mostrar subcategorías si existen */}
                  {Object.entries(subcategoryMapping)
                    .filter(([subcatId, parentId]) => parentId === category.id)
                    .map(([subcatId]) => {
                      const subcatName = subcatId.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')
                      
                      return (
                        <div key={subcatId} className="ml-6 mt-3 p-4 bg-gray-100 rounded-lg border-l-4 border-black shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-black">{subcatName}</span>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const percentage = prompt(`Ingresa el porcentaje de aumento para ${subcatName} (ej: 15 para 15%):`)
                                if (percentage && !isNaN(parseFloat(percentage))) {
                                  handleBulkPriceIncrease(subcatId, parseFloat(percentage))
                                }
                              }}
                              className="flex items-center gap-2 bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800 font-semibold admin-increase-prices-button"
                            >
                              <Plus className="w-3 h-3 text-white" />
                              <span className="text-white">Aumentar Precios</span>
                            </Button>
                            <Button 
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteSubcategory(subcatId)}
                              className="flex items-center gap-2 bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 font-semibold admin-delete-button"
                            >
                              <Trash2 className="w-3 h-3 text-white" />
                              <span className="text-white">Eliminar</span>
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
              ))}

              {/* Sección de categorías eliminadas */}
              {deletedCategories.length > 0 && (
                <div className="mt-8 pt-6 border-t-2 border-gray-300">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-bold text-red-700">🗑️ Categorías Eliminadas</h4>
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("¿Estás seguro de que quieres eliminar permanentemente todas las categorías eliminadas? Esta acción no se puede deshacer.")) {
                          setDeletedCategories([])
                        }
                      }}
                      className="flex items-center gap-2 bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 font-semibold admin-delete-button"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                      <span className="text-white">Limpiar Todo</span>
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {deletedCategories.map((deletedCategory) => (
                      <div key={deletedCategory.id} className="flex justify-between items-center p-4 bg-red-50 border-2 border-red-300 rounded-lg shadow-sm">
                        <div>
                          <span className="font-semibold text-black">{deletedCategory.name}</span>
                          <span className="text-sm text-red-700 ml-2 font-medium">
                            (Eliminada el {new Date(deletedCategory.deletedAt).toLocaleDateString()})
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreCategory(deletedCategory)}
                            className="flex items-center gap-2 bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800 font-semibold admin-restore-button"
                          >
                            <Plus className="w-4 h-4 text-white" />
                            <span className="text-white">Restaurar</span>
                          </Button>
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm(`¿Estás seguro de que quieres eliminar permanentemente la categoría "${deletedCategory.name}"? Esta acción no se puede deshacer.`)) {
                                setDeletedCategories(prev => prev.filter(cat => cat.id !== deletedCategory.id))
                              }
                            }}
                            className="flex items-center gap-2 bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 font-semibold admin-delete-button"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                            <span className="text-white">Eliminar Permanentemente</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar categoría */}
      {isAddingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Agregar Nueva Categoría</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="categoryName">Nombre de la Categoría</Label>
                <Input
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ej: TORTAS"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingCategory(false)}
                  className="bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800 font-semibold"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddNewCategory}
                  className="bg-black text-white hover:bg-gray-800 border-0 font-semibold"
                >
                  Agregar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar categoría individual */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">Editar Categoría: {editingCategory.name}</h3>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingCategory(null)
                  setEditingCategoryDescription("")
                }}
                className="flex items-center gap-2 bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800 font-semibold"
              >
                <X className="w-4 h-4" />
                Cerrar
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Información básica de la categoría */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Información Básica</h4>
                <div>
                  <Label htmlFor="editCategoryName">Nombre de la Categoría</Label>
                  <Input
                    id="editCategoryName"
                    defaultValue={editingCategory.name}
                    placeholder="Nombre de la categoría"
                  />
                </div>
                <div>
                  <Label htmlFor="editCategoryDescription">Descripción/Horario</Label>
                  <Textarea
                    id="editCategoryDescription"
                    value={editingCategoryDescription}
                    onChange={(e) => setEditingCategoryDescription(e.target.value)}
                    placeholder="Ej: 12 a 16 hs, Horario de atención, etc."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Esta descripción se mostrará debajo del título de la categoría en el menú público.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editCategoryHidden"
                    defaultChecked={editingCategory.hidden || false}
                    className="rounded"
                  />
                  <Label htmlFor="editCategoryHidden">Ocultar categoría</Label>
                </div>
              </div>
              
              {/* Gestión de subcategorías */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Subcategorías</h4>
                <div className="space-y-2">
                  {Object.entries(subcategoryMapping)
                    .filter(([subcatId, parentId]) => parentId === editingCategory.id)
                    .map(([subcatId]) => {
                      const subcatName = subcatId.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')
                      
                      return (
                        <div key={subcatId} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                          <span className="font-medium text-gray-700">{subcatName}</span>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const percentage = prompt(`Ingresa el porcentaje de aumento para ${subcatName} (ej: 15 para 15%):`)
                                if (percentage && !isNaN(parseFloat(percentage))) {
                                  handleBulkPriceIncrease(subcatId, parseFloat(percentage))
                                }
                              }}
                              className="flex items-center gap-2 bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800 font-semibold"
                            >
                              <Plus className="w-3 h-3" />
                              Aumentar Precios
                            </Button>
                            <Button 
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteSubcategory(subcatId)}
                              className="flex items-center gap-2 bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 font-semibold admin-delete-button"
                            >
                              <Trash2 className="w-3 h-3 text-white" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  
                  {Object.entries(subcategoryMapping)
                    .filter(([subcatId, parentId]) => parentId === editingCategory.id)
                    .length === 0 && (
                    <p className="text-gray-500 text-sm">No hay subcategorías en esta categoría</p>
                  )}
                </div>
                
                {/* Agregar nueva subcategoría */}
                <div className="pt-4 border-t">
                  <h5 className="text-md font-medium text-gray-900 mb-2">Agregar Nueva Subcategoría</h5>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nombre de la subcategoría"
                      value={newSubcategoryName}
                      onChange={(e) => setNewSubcategoryName(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      size="sm"
                      onClick={() => {
                        if (newSubcategoryName.trim()) {
                          setSelectedCategoryForSubcategory(editingCategory.id)
                          handleAddNewSubcategory()
                        }
                      }}
                      className="bg-black text-white hover:bg-gray-800 border-0 font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex gap-2 justify-end mt-8 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingCategory(null)
                  setEditingCategoryDescription("")
                }}
                className="bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800 font-semibold"
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  const name = (document.getElementById('editCategoryName') as HTMLInputElement)?.value
                  const hidden = (document.getElementById('editCategoryHidden') as HTMLInputElement)?.checked
                  
                  if (name) {
                    handleSaveCategory({
                      ...editingCategory,
                      name,
                      description: editingCategoryDescription,
                      hidden
                    })
                  }
                }}
                className="bg-black text-white hover:bg-gray-800 border-0 font-semibold"
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar subcategoría */}
      {isAddingSubcategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Agregar Nueva Subcategoría</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subcategoryName">Nombre de la Subcategoría</Label>
                <Input
                  id="subcategoryName"
                  value={newSubcategoryName}
                  onChange={(e) => setNewSubcategoryName(e.target.value)}
                  placeholder="Ej: CAFÉ"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingSubcategory(false)}
                  className="bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800 font-semibold"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddNewSubcategory}
                  className="bg-black text-white hover:bg-gray-800 border-0 font-semibold"
                >
                  Agregar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ocultar/mostrar productos */}
      <HideItemModal
        isOpen={hideModalOpen}
        onClose={() => setHideModalOpen(false)}
        onConfirm={handleConfirmVisibilityToggle}
        itemName={selectedItem?.name || ""}
        currentStatus={selectedItem?.hidden ? 'hidden' : 'visible'}
        loading={hideModalLoading}
      />

      {/* Modal para configurar horarios de categorías */}
      <TimeRangeModal
        isOpen={timeRangeModalOpen}
        onClose={() => setTimeRangeModalOpen(false)}
        onSave={handleSaveTimeRange}
        categoryName={categories[selectedCategoryForTime]?.name || ""}
        currentData={selectedCategoryTimeData}
      />

      {/* Modal para aumento porcentual de precios */}
      {showPriceIncreaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-black flex items-center gap-2">
              <span className="text-2xl">📈</span>
              Aumentar Precios de Toda la Carta
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="priceIncreasePercentage" className="text-black">
                  Porcentaje de Aumento (%)
                </Label>
                <Input
                  id="priceIncreasePercentage"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={priceIncreasePercentage}
                  onChange={(e) => setPriceIncreasePercentage(e.target.value)}
                  placeholder="Ej: 10 para aumentar 10%"
                  className="mt-1"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Ingresa el porcentaje que deseas aumentar en todos los precios
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600 text-lg">⚠️</span>
                  <div>
                    <p className="text-yellow-800 font-medium text-sm">Advertencia Importante:</p>
                    <ul className="text-yellow-700 text-xs mt-1 space-y-1">
                      <li>• Esta acción afectará TODOS los productos de la carta</li>
                      <li>• Los cambios NO se pueden deshacer</li>
                      <li>• Se recomienda hacer una copia de seguridad antes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowPriceIncreaseModal(false)
                  setPriceIncreasePercentage("")
                }}
                variant="outline"
                className="flex-1 bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800"
                disabled={isIncreasingPrices}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleIncreaseAllPrices}
                className="flex-1 bg-black hover:bg-gray-800 text-white"
                disabled={isIncreasingPrices || !priceIncreasePercentage}
              >
                {isIncreasingPrices ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <span className="text-lg mr-1">📈</span>
                    Aumentar Precios
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar productos */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-black">Agregar Nuevo Producto</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="productName" className="text-black">Nombre del Producto</Label>
                <Input
                  id="productName"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Hamburguesa Clásica"
                  className="text-black border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <Label htmlFor="productDescription" className="text-black">Descripción</Label>
                <textarea
                  id="productDescription"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del producto"
                  className="w-full p-2 border border-gray-300 rounded-md text-black focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="productPrice" className="text-black">Precio</Label>
                <Input
                  id="productPrice"
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  className="text-black border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <Label className="text-black">Etiquetas</Label>
                <div className="flex gap-2 mt-2">
                  {(["vegan", "sin-tacc", "picante"] as const).map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant={newProduct.tags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setNewProduct(prev => ({
                          ...prev,
                          tags: prev.tags.includes(tag) 
                            ? prev.tags.filter(t => t !== tag)
                            : [...prev.tags, tag]
                        }))
                      }}
                      className={`text-xs transition-all duration-200 ${
                        newProduct.tags.includes(tag) 
                          ? "bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800" 
                          : "bg-white text-black border-gray-300 hover:border-black hover:bg-gray-50"
                      }`}
                    >
                      {tag === "vegan" && "🌱"}
                      {tag === "sin-tacc" && "🌾"}
                      {tag === "picante" && "🔥"}
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 justify-end pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingProduct(false)
                    setNewProduct({ name: "", description: "", price: "", tags: [] })
                    setSelectedSectionForProduct("")
                  }}
                  className="bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800 font-semibold"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddNewProduct}
                  className="bg-black hover:bg-gray-800 text-white border-0 font-semibold"
                  disabled={!newProduct.name.trim() || !newProduct.price.trim()}
                >
                  Agregar Producto
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos CSS personalizados para los botones */}
      {/* Modal para reordenar categorías */}
      {isReorderingCategories && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-black">Reordenar Categorías</h3>
              <Button 
                variant="outline" 
                onClick={() => setIsReorderingCategories(false)}
                className="flex items-center gap-2 bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800 font-semibold"
              >
                <X className="w-4 h-4" />
                Cerrar
              </Button>
            </div>
            
            <CategoryDragDrop
              categories={allCategories}
              onCategoriesReorder={handleCategoriesReorder}
            />
          </div>
        </div>
      )}

      <style jsx>{`

        
                  /* Estilos para las pestañas */
          .tabs-trigger {
            transition: all 0.2s ease-in-out;
            min-height: 40px;
            padding: 8px 12px;
          }
          
          .tabs-trigger:hover {
            transform: translateY(-1px);
          }
          
          /* Asegurar que el texto se ajuste bien */
          .tabs-trigger span {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        .admin-action-button {
          min-width: 40px;
          height: 40px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          letter-spacing: 0.025em;
          border-radius: 8px;
          transition: all 0.2s ease-in-out;
        }
        
        .admin-action-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        
        .admin-action-button:active {
          transform: translateY(0);
        }
        
        /* Estilos específicos para cada tipo de botón */
        .admin-edit-button {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border: 2px solid #1d4ed8;
        }
        
        .admin-edit-button:hover {
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          border-color: #1e40af;
        }
        
        .admin-visibility-button.hidden {
          background: linear-gradient(135deg, #10b981, #059669);
          border: 2px solid #059669;
        }
        
        .admin-visibility-button.hidden:hover {
          background: linear-gradient(135deg, #059669, #047857);
          border-color: #047857;
        }
        
        .admin-visibility-button.visible {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border: 2px solid #d97706;
        }
        
        .admin-visibility-button.visible:hover {
          background: linear-gradient(135deg, #d97706, #b45309);
          border-color: #b45309;
        }
        
        .admin-delete-button {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border: 2px solid #dc2626;
        }
        
        .admin-delete-button:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          border-color: #b91c1c;
        }
      `}</style>
    </div>
  )
}

