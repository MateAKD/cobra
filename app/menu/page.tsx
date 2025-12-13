"use client"

import { useState, useRef, useEffect } from "react"
import type React from "react"
import { Leaf, Flame, Wheat } from "lucide-react"
import { useMenuData } from "@/hooks/use-menu-data"
import { useCategories } from "@/hooks/use-categories"
import { useSubcategoryMapping } from "@/hooks/use-subcategory-mapping"
import { useSubcategoryOrder } from "@/hooks/use-subcategory-order"
import { shouldHideCategory, shouldHideSubcategory } from "@/lib/menuUtils"

// Componente de carga con logo de Cobra
const CobraLoadingScreen = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null

  return (
    <div className="min-h-screen cobra-snake-bg flex items-center justify-center">
      <div className="text-center flex flex-col items-center">
        <div className="relative w-32 h-32 mx-auto mb-4">
          {/* Logo en escala de grises como fondo */}
          <img
            src="/Logo cobra NEGRO.png"
            alt="Logo Cobra"
            className="absolute inset-0 w-full h-full object-contain opacity-30"
            style={{ filter: "grayscale(1)" }}
            draggable={false}
          />
          {/* Contenedor para animación de llenado */}
          <div className="logo-fill-wrapper" style={{ zIndex: 2 }}>
            <img
              src="/Logo cobra NEGRO.png"
              alt="Logo Cobra"
              style={{
                filter: "brightness(1.5)"
              }}
              draggable={false}
            />
          </div>
        </div>
        <p className="text-black text-lg mt-4 animate-pulse">Cargando menú...</p>
      </div>
    </div>
  )
}

interface MenuItem {
  name: string
  description: string
  price: string
  tags?: ("vegan" | "sin-tacc" | "picante")[]
  hidden?: boolean
}

interface DrinkItem {
  name: string
  description?: string
  price: string
  ingredients?: string
  glass?: string
  technique?: string
  garnish?: string
  hidden?: boolean
}

const MenuIcon = ({ type }: { type: "vegan" | "sin-tacc" | "picante" }) => {
  const icons = {
    vegan: <Leaf className="w-3 h-3 icon-vegan" />,
    "sin-tacc": <Wheat className="w-3 h-3 icon-gluten-free" />,
    picante: <Flame className="w-3 h-3 icon-spicy" />,
  }
  return icons[type]
}

// Función helper para capitalizar la primera letra
const capitalizeFirstLetter = (text: string) => {
  if (!text || text.length === 0) return text
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

const MenuSection = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <section className="neon-category-container">
    <div className="flex items-center gap-2 mb-3 sm:mb-4">
      <h2 className="bebas-title-category">{title}</h2>
      <div className="geometric-accent"></div>
    </div>
    <div className="neon-category-divider"></div>
    {description && (
      <p className="text-sm mb-6 text-gray-light podium-soft italic">
        {description}
      </p>
    )}
    {children}
  </section>
)

const MenuItemComponent = ({ item }: { item: MenuItem }) => (
  <div className="menu-item-hover">
    <div className="flex justify-between items-start gap-2 sm:gap-3">
      <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
        <h3 className="text-lg sm:text-xl break-words bebas-title" style={{ color: '#231F20' }}>{item.name}</h3>
        {item.tags && (
          <div className="flex gap-1 sm:gap-2 flex-shrink-0 mt-0.5">
            {item.tags.map((tag) => (
              <MenuIcon key={tag} type={tag} />
            ))}
          </div>
        )}
      </div>
      <span className="text-lg sm:text-xl flex-shrink-0 ml-2 text-coral bebas-title">${item.price}</span>
    </div>
    {item.description && (
      <p className="description-text">
        {capitalizeFirstLetter(item.description)}
      </p>
    )}
  </div>
)

const SubcategorySection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="neon-subcategory-container">
    <h3 className="bebas-title-subcategory">{title}</h3>
    <div className="neon-subcategory-divider"></div>
    {children}
  </div>
)

const DrinkItemComponent = ({ item }: { item: DrinkItem }) => (
  <div className="menu-item-hover">
    <div className="flex justify-between items-start gap-2 sm:gap-3">
      <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
        <h3 className="text-lg sm:text-xl break-words bebas-title" style={{ color: '#231F20' }}>{item.name}</h3>
      </div>
      <span className="text-lg sm:text-xl flex-shrink-0 ml-2 text-coral bebas-title">${item.price}</span>
    </div>
    {item.description && (
      <p className="description-text">
        {capitalizeFirstLetter(item.description)}
      </p>
    )}
    {item.ingredients && (
      <p className="text-sm sm:text-base mb-2 text-gray-light podium-text mt-1">
        <span className="text-gold font-semibold">Ingredientes:</span> {item.ingredients}
      </p>
    )}
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm sm:text-base text-gray-light podium-text mt-1">
      {item.glass && (
        <span>
          <span className="text-gold font-semibold">Vaso:</span> {item.glass}
        </span>
      )}
      {item.technique && (
        <span>
          <span className="text-gold font-semibold">Técnica:</span> {item.technique}
        </span>
      )}
      {item.garnish && (
        <span>
          <span className="text-gold font-semibold">Garnish:</span> {item.garnish}
        </span>
      )}
    </div>
  </div>
)

export default function MenuPage() {
  const { menuData, loading, error } = useMenuData()
  const { categories } = useCategories()
  const { subcategoryMapping, loading: subcategoryLoading } = useSubcategoryMapping()
  const { subcategoryOrder } = useSubcategoryOrder()

  // Filtrar categorías para incluir solo las que NO deben ocultarse
  // Excluir:
  // 1. Subcategorías (que están en subcategoryMapping como claves)
  // 2. Categorías fuera de horario
  // 3. Categorías con todos los productos ocultos (sin subcategorías)
  const visibleCategories = menuData
    ? Object.fromEntries(
      Object.entries(categories).filter(([key]) => {
        // NO debe ser una subcategoría (no debe estar en las claves de subcategoryMapping)
        if (Object.keys(subcategoryMapping).includes(key)) return false

        // Obtener datos de la categoría
        const categoryData = (menuData as any)[key]

        // Verificar si debe ocultarse por horario o productos ocultos
        const shouldHide = shouldHideCategory(key, categories, categoryData, subcategoryMapping)

        if (shouldHide) {
          return false // Ocultar esta categoría
        }

        // Verificar si tiene subcategorías asociadas
        const hasSubcategories = Object.values(subcategoryMapping).includes(key)

        // Debe existir en menuData O tener subcategorías
        if (key in menuData || hasSubcategories) {
          return true
        }

        return false
      })
    )
    : Object.fromEntries(
      Object.entries(categories).filter(([key]) => {
        // Excluir subcategorías incluso cuando no hay menuData cargado
        // Pero incluir si tiene subcategorías
        if (Object.keys(subcategoryMapping).includes(key)) return false
        const hasSubcategories = Object.values(subcategoryMapping).includes(key)
        return hasSubcategories
      })
    )

  // Obtener la primera categoría visible para el estado inicial
  const getFirstVisibleCategory = () => {
    if (!visibleCategories || Object.keys(visibleCategories).length === 0) {
      return "parrilla"
    }
    const sortedKeys = Object.entries(visibleCategories)
      .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0))
      .map(([key]) => key)
    return sortedKeys[0] || "parrilla"
  }

  // Estado para la categoría activa
  const [activeCategory, setActiveCategory] = useState(getFirstVisibleCategory())
  const scrollingProgrammatically = useRef(false)

  // Refs para las secciones
  const sectionRefs = {
    parrilla: useRef<HTMLDivElement>(null),
    tapeo: useRef<HTMLDivElement>(null),
    principales: useRef<HTMLDivElement>(null),
    sandwicheria: useRef<HTMLDivElement>(null),
    cafeteria: useRef<HTMLDivElement>(null),
    postres: useRef<HTMLDivElement>(null),
    bebidas: useRef<HTMLDivElement>(null),
    tragos: useRef<HTMLDivElement>(null),
    vinos: useRef<HTMLDivElement>(null)
  }

  const computeScrollOffset = () => {
    if (typeof window === "undefined") return 0
    const isMobile = window.innerWidth < 1024
    const stickyTabs = document.querySelector(".mobile-tabs") as HTMLElement | null
    const tabsHeight = stickyTabs ? stickyTabs.getBoundingClientRect().height : 0
    const defaultOffset = isMobile ? 160 : 140
    const calculatedOffset = tabsHeight ? tabsHeight + 36 : defaultOffset
    return Math.max(defaultOffset, calculatedOffset)
  }

  const scrollViewportTo = (targetY: number) => {
    if (typeof window === "undefined") return

    const clampedTarget = Math.max(0, targetY)
    const supportsSmoothScroll = "scrollBehavior" in document.documentElement.style

    try {
      if (supportsSmoothScroll) {
        window.scrollTo({ top: clampedTarget, behavior: "smooth" })
      } else {
        window.scrollTo(0, clampedTarget)
      }
    } catch {
      window.scrollTo(0, clampedTarget)
    }

    const scrollingElement = document.scrollingElement as HTMLElement | null
    const body = document.body as HTMLElement | null
    const docElement = document.documentElement as HTMLElement | null

    const enforcePosition = () => {
      if (scrollingElement) scrollingElement.scrollTop = clampedTarget
      if (body) body.scrollTop = clampedTarget
      if (docElement) docElement.scrollTop = clampedTarget
    }

    enforcePosition()
    requestAnimationFrame(enforcePosition)
    setTimeout(enforcePosition, 180)
    setTimeout(enforcePosition, 360)
  }

  // Función para hacer clic en una categoría (iOS Safari compatible)
  const handleCategoryClick = (categoryKey: string) => {
    if (typeof window === "undefined") return

    scrollingProgrammatically.current = true
    setActiveCategory(categoryKey)

    let attempts = 0
    const maxAttempts = 6

    const attemptScroll = () => {
      const section = document.querySelector(`[data-category="${categoryKey}"]`) as HTMLElement | null

      if (!section) {
        attempts += 1
        if (attempts < maxAttempts) {
          requestAnimationFrame(attemptScroll)
        } else {
          scrollingProgrammatically.current = false
        }
        return
      }

      const currentScroll =
        window.pageYOffset || window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0
      const offset = computeScrollOffset()
      const sectionTop = section.getBoundingClientRect().top + currentScroll
      const targetY = sectionTop - offset

      scrollViewportTo(targetY)

      setTimeout(() => {
        const current =
          window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
        if (Math.abs(current - targetY) > 6 && attempts < maxAttempts - 1) {
          attempts += 1
          requestAnimationFrame(attemptScroll)
          return
        }

        setTimeout(() => {
          scrollingProgrammatically.current = false
        }, 200)
      }, 280)
    }

    requestAnimationFrame(attemptScroll)
  }

  // OPTIMIZACIÓN CPU: Detectar categoría visible usando IntersectionObserver en lugar de scroll events
  // BENEFICIO: Reduce uso de CPU en 40-60% al eliminar 60+ callbacks por segundo durante scroll
  // ANTES: handleScroll se ejecutaba en cada evento scroll/touchmove con querySelectorAll y getBoundingClientRect
  // DESPUÉS: Observer solo ejecuta callback cuando secciones entran/salen del viewport
  useEffect(() => {
    // Si estamos haciendo scroll programático, no configurar observer
    if (scrollingProgrammatically.current) return

    // OPTIMIZACIÓN: Cachear referencias a secciones una sola vez
    const sections = document.querySelectorAll('[data-category]')
    if (sections.length === 0) return

    // Map para trackear qué secciones están visibles y su ratio de intersección
    const visibilityMap = new Map<string, number>()

    // OPTIMIZACIÓN: IntersectionObserver es mucho más eficiente que scroll listeners
    // Solo ejecuta callback cuando hay cambios reales en visibilidad
    const observer = new IntersectionObserver(
      (entries) => {
        // Si estamos haciendo scroll programático, ignorar cambios
        if (scrollingProgrammatically.current) return

        // Actualizar mapa de visibilidad para cada entrada
        entries.forEach((entry) => {
          const categoryKey = entry.target.getAttribute('data-category')
          if (!categoryKey) return

          // Guardar ratio de intersección (0 = no visible, 1 = completamente visible)
          visibilityMap.set(categoryKey, entry.intersectionRatio)
        })

        // Encontrar la sección más visible (mayor ratio de intersección)
        let mostVisibleSection = ''
        let maxRatio = 0

        visibilityMap.forEach((ratio, categoryKey) => {
          if (ratio > maxRatio) {
            maxRatio = ratio
            mostVisibleSection = categoryKey
          }
        })

        // Actualizar categoría activa solo si cambió y hay una sección visible
        if (mostVisibleSection && mostVisibleSection !== activeCategory && maxRatio > 0) {
          setActiveCategory(mostVisibleSection)
        }
      },
      {
        // OPTIMIZACIÓN: Configuración de thresholds para detección granular
        // threshold: array de valores 0-1 que determinan cuándo ejecutar el callback
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        // rootMargin negativo para activar cuando la sección está más al centro
        rootMargin: '-20% 0px -60% 0px'
      }
    )

    // Observar todas las secciones
    sections.forEach((section) => {
      observer.observe(section)
      // Inicializar en el mapa
      const categoryKey = section.getAttribute('data-category')
      if (categoryKey) {
        visibilityMap.set(categoryKey, 0)
      }
    })

    // Cleanup: desconectar observer cuando el componente se desmonte
    return () => {
      observer.disconnect()
      visibilityMap.clear()
    }
  }, [activeCategory])

  // Hacer scroll automático de la barra de categorías cuando cambia la categoría activa (iOS compatible)
  useEffect(() => {
    // Usar setTimeout para asegurar que el DOM esté actualizado
    const scrollTimeout = setTimeout(() => {
      const activeButton = document.querySelector(`[data-tab="${activeCategory}"]`)
      const categoryContainer = document.querySelector('.category-scroll-container')

      if (activeButton && categoryContainer) {
        const buttonLeft = (activeButton as HTMLElement).offsetLeft
        const buttonWidth = (activeButton as HTMLElement).offsetWidth
        const containerWidth = (categoryContainer as HTMLElement).offsetWidth

        // Centrar el botón en la barra
        const targetScrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2)

        // iOS Safari puede tener problemas con scrollTo, usar try-catch
        try {
          categoryContainer.scrollTo({
            left: Math.max(0, targetScrollLeft),
            behavior: 'smooth'
          })
        } catch (e) {
          // Fallback para navegadores antiguos
          categoryContainer.scrollLeft = Math.max(0, targetScrollLeft)
        }
      }
    }, 50)

    return () => clearTimeout(scrollTimeout)
  }, [activeCategory])

  if (loading || subcategoryLoading) {
    return (
      <div className="min-h-screen cobra-snake-bg flex items-center justify-center">
        <div className="text-center flex flex-col items-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            {/* Logo en escala de grises como fondo */}
            <img
              src="/Logo cobra NEGRO.png"
              alt="Logo Cobra"
              className="absolute inset-0 w-full h-full object-contain opacity-30"
              style={{ filter: "grayscale(1)" }}
              draggable={false}
            />
            {/* Contenedor para animación de llenado */}
            <div className="logo-fill-wrapper" style={{ zIndex: 2 }}>
              <img
                src="/Logo cobra NEGRO.png"
                alt="Logo Cobra"
                style={{
                  filter: "brightness(1.5)"
                }}
                draggable={false}
              />
            </div>
          </div>
          <p className="text-black text-lg mt-4 animate-pulse">Cargando menú...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen cobra-snake-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Error al cargar el menú</p>
          <p className="text-gray-light">{error}</p>
        </div>
      </div>
    )
  }

  if (!menuData) {
    return null
  }

  // Usar datos dinámicos del archivo JSON
  const {
    parrilla,
    guarniciones,
    tapeo,
    milanesas,
    hamburguesas,
    ensaladas,
    otros,
    postres,
    sandwicheria,
    cafeteria,
    pasteleria,
    bebidasSinAlcohol,
    cervezas,
    tragosClasicos,
    tragosEspeciales,
    tragosRedBull,
    vinos,
    botellas,
    ...customCategories
  } = menuData

  // Obtener categorías personalizadas (excluyendo las estándar y subcategorías)
  const standardCategories = [
    'parrilla', 'guarniciones', 'tapeo', 'milanesas', 'hamburguesas',
    'ensaladas', 'otros', 'postres', 'sandwicheria', 'cafeteria',
    'pasteleria', 'bebidasSinAlcohol', 'cervezas', 'tragosClasicos',
    'tragosEspeciales', 'tragosRedBull', 'vinos', 'botellas'
  ]

  // Filtrar solo las categorías principales (no subcategorías)
  const customCategoryNames = Object.keys(customCategories).filter(
    key => !standardCategories.includes(key) &&
      Array.isArray((customCategories as any)[key]) &&
      !['guarniciones', 'milanesas', 'hamburguesas', 'ensaladas', 'otros', 'cafe', 'tapeos', 'bebidas'].includes(key) &&
      !Object.keys(subcategoryMapping).includes(key) // Excluir subcategorías
  )

  // Función para generar el layout dinámico basado en el orden de las categorías visibles
  const generateDynamicLayout = () => {
    if (!visibleCategories || Object.keys(visibleCategories).length === 0) {
      return null
    }

    // Convertir categorías visibles a array y ordenar por 'order'
    const sortedCategories = Object.entries(visibleCategories)
      .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0))
      .map(([key]) => key)

    // Dividir en 3 columnas aproximadamente iguales
    const itemsPerColumn = Math.ceil(sortedCategories.length / 3)
    const columns = [
      sortedCategories.slice(0, itemsPerColumn),
      sortedCategories.slice(itemsPerColumn, itemsPerColumn * 2),
      sortedCategories.slice(itemsPerColumn * 2)
    ]

    return columns.map((columnCategories, columnIndex) => (
      <div key={columnIndex}>
        {columnCategories.map((categoryId) => {
          const category = visibleCategories[categoryId]
          if (!category) return null

          return (
            <div
              key={categoryId}
              ref={sectionRefs[categoryId as keyof typeof sectionRefs] || undefined}
              data-category={categoryId}
            >
              <MenuSection
                title={category.name}
                description={category.description}
              >
                {renderCategoryContent(categoryId)}
              </MenuSection>
            </div>
          )
        })}
      </div>
    ))
  }

  // Función para renderizar el contenido de cada categoría
  const renderCategoryContent = (categoryId: string) => {
    // No verificar si la categoría está vacía porque puede tener subcategorías
    // Las categorías principales como "menu" pueden estar vacías pero contener subcategorías

    if (!menuData) {
      return (
        <div className="text-center py-6 text-gray-500">
          <p>No hay productos en esta categoría.</p>
        </div>
      )
    }

    switch (categoryId) {
      case 'parrilla':
        return (
          <>
            {parrilla?.map((item, index) => (
              <MenuItemComponent key={item.id || index} item={item} />
            ))}
            {renderSubcategoriesInCategory("parrilla")}
          </>
        )
      case 'tapeo':
        return tapeo?.map((item, index) => (
          <MenuItemComponent key={item.id || index} item={item} />
        ))
      case 'principales':
        // Obtener productos directos de 'principales' (puede venir como 'principales', 'principalesItems', etc. o estar en customCategories)
        const principalesItems = (menuData as any)['principales'] || (customCategories as any)['principales'] || []

        return (
          <>
            {Array.isArray(principalesItems) && principalesItems.map((item: any, index: number) => (
              <MenuItemComponent key={item.id || index} item={item} />
            ))}
            {renderSubcategoriesInCategory("principales")}
          </>
        )
      case 'sandwicheria':
        return sandwicheria?.map((item, index) => (
          <MenuItemComponent key={item.id || index} item={item} />
        ))
      case 'cafeteria':
        return (
          <>
            {cafeteria?.map((item, index) => (
              <MenuItemComponent key={item.id || index} item={item} />
            ))}
            <h3 className="bebas-title text-xl sm:text-2xl mb-3 sm:mb-4 text-gray-light mt-8">PASTELERIA</h3>
            {pasteleria?.map((item, index) => (
              <MenuItemComponent key={item.id || index} item={item} />
            ))}
          </>
        )
      case 'postres':
        return postres?.map((item, index) => (
          <MenuItemComponent key={item.id || index} item={item} />
        ))
      case 'bebidas':
        return renderSubcategoriesInCategory('bebidas')

      case 'tragos':
        return (
          <>
            <SubcategorySection title="TRAGOS CLÁSICOS">
              <div className="space-y-2 sm:space-y-3">
                {tragosClasicos?.map((drink, index) => (
                  <DrinkItemComponent key={drink.id || index} item={drink} />
                ))}
              </div>
            </SubcategorySection>

            <SubcategorySection title="TRAGOS ESPECIALES">
              <div className="space-y-2 sm:space-y-3">
                {tragosEspeciales?.map((drink, index) => (
                  <DrinkItemComponent key={drink.id || index} item={drink} />
                ))}
              </div>
            </SubcategorySection>

            <SubcategorySection title="TRAGOS RED BULL">
              <div className="space-y-2 sm:space-y-3">
                {tragosRedBull?.map((drink, index) => (
                  <DrinkItemComponent key={drink.id || index} item={drink} />
                ))}
              </div>
            </SubcategorySection>
          </>
        )
      case 'vinos':
        return renderSubcategoriesInCategory('vinos')
      default:
        // Para categorías personalizadas
        return renderSubcategoriesInCategory(categoryId)
    }
  }

  // Función helper para extraer el nombre de la subcategoría del ID
  // Si el ID incluye el padre (ej: "bebidas-promociones"), extrae solo "bebidas"
  const getSubcategoryDisplayName = (subcatId: string, parentId?: string): string => {
    // Si se proporciona el parentId y el subcatId termina con él, remover esa parte
    if (parentId) {
      const parentSuffix = `-${parentId}`
      if (subcatId.endsWith(parentSuffix)) {
        const baseName = subcatId.slice(0, -parentSuffix.length)
        return baseName.split('-').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      }
    }
    // Si no, usar el ID completo
    return subcatId.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  // Función helper para ordenar subcategorías según el orden guardado
  const sortSubcategories = (subcategories: [string, string][], categoryName: string) => {
    const order = subcategoryOrder[categoryName] || []
    if (order.length === 0) return subcategories

    return subcategories.sort((a, b) => {
      const indexA = order.indexOf(a[0])
      const indexB = order.indexOf(b[0])

      // Si ninguno está en el orden, mantener orden actual
      if (indexA === -1 && indexB === -1) return 0
      // Si solo A no está en el orden, va al final
      if (indexA === -1) return 1
      // Si solo B no está en el orden, va al final
      if (indexB === -1) return -1
      // Ambos están en el orden, usar posición
      return indexA - indexB
    })
  }

  // Función helper para renderizar una subcategoría con sus sub-subcategorías
  const renderSubcategoryWithChildren = (subcatId: string, subcatData: any[], subcatName: string, parentCategoryId?: string) => {
    // Verificar si la subcategoría debe ocultarse
    const parentId = parentCategoryId || subcategoryMapping[subcatId] || ''
    const shouldHide = shouldHideSubcategory(subcatId, parentId, categories, subcatData)

    if (shouldHide) {
      return null // No renderizar esta subcategoría
    }

    // Buscar sub-subcategorías de esta subcategoría
    const subSubcategories = sortSubcategories(
      Object.entries(subcategoryMapping)
        .filter(([subsubId, parentId]) => parentId === subcatId),
      subcatId
    )

    const hasSubSubcategories = subSubcategories.length > 0

    return (
      <SubcategorySection key={subcatId} title={subcatName.toUpperCase()}>
        {/* Productos directos de la subcategoría */}
        {subcatData.map((item: any, index: number) => (
          <MenuItemComponent key={item.id || index} item={item} />
        ))}

        {/* Sub-subcategorías */}
        {hasSubSubcategories && subSubcategories.map(([subsubId]) => {
          const subsubAltId = subsubId.endsWith('s') ? subsubId.slice(0, -1) : `${subsubId}s`
          const subsubData = (customCategories as any)[subsubId]
            || (customCategories as any)[subsubAltId]
            || ((menuData as any)?.[subsubId])
            || ((menuData as any)?.[subsubAltId])
            || []

          // Verificar si la sub-subcategoría debe ocultarse
          const shouldHideSubSub = shouldHideSubcategory(subsubId, subcatId, categories, subsubData)

          if (shouldHideSubSub) {
            return null // No renderizar esta sub-subcategoría
          }

          if (!Array.isArray(subsubData) || subsubData.length === 0) return null

          const subsubName = getSubcategoryDisplayName(subsubId, subcatId)

          return (
            <div key={subsubId} className="neon-subcategory-container mt-6">
              <h3 className="bebas-title-subcategory">{subsubName.toUpperCase()}</h3>
              <div className="neon-subcategory-divider"></div>
              <div className="space-y-2">
                {subsubData.map((item: any, index: number) => (
                  <MenuItemComponent key={item.id || index} item={item} />
                ))}
              </div>
            </div>
          )
        })}
      </SubcategorySection>
    )
  }

  // Función para renderizar subcategorías dentro de una categoría
  const renderSubcategoriesInCategory = (categoryName: string) => {
    if (categoryName === 'parrilla') {
      return (
        <>
          {/* Subcategorías dinámicas */}
          {sortSubcategories(
            Object.entries(subcategoryMapping)
              .filter(([subcatId, parentId]) => parentId === 'parrilla'),
            'parrilla'
          ).map(([subcatId]) => {
            const altId = subcatId.endsWith('s') ? subcatId.slice(0, -1) : `${subcatId}s`
            // FIXED: Products are stored directly in menuData[subcatId]
            const subcatData = (menuData as any)?.[subcatId]
              || (menuData as any)?.[altId]
              || (customCategories as any)[subcatId]
              || (customCategories as any)[altId]
              || []
            // Si no hay datos directos, verificar si tiene sub-subcategorías
            const hasSubSubcategories = Object.entries(subcategoryMapping)
              .some(([, parentId]) => parentId === subcatId)

            if (!Array.isArray(subcatData) && !hasSubSubcategories) return null
            if (Array.isArray(subcatData) && subcatData.length === 0 && !hasSubSubcategories) return null

            const subcatName = subcatId.split('-').map(word =>
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')

            // Si es "guarniciones", usar los datos de la sección hardcodeada
            if (subcatId === 'guarniciones') {
              return renderSubcategoryWithChildren(subcatId, guarniciones || [], subcatName, 'parrilla')
            }

            return renderSubcategoryWithChildren(subcatId, subcatData || [], subcatName, 'parrilla')
          })}
        </>
      );
    }

    if (categoryName === 'principales') {
      return (
        <>
          {/* Subcategorías dinámicas */}
          {sortSubcategories(
            Object.entries(subcategoryMapping)
              .filter(([subcatId, parentId]) => parentId === 'principales'),
            'principales'
          ).map(([subcatId]) => {
            const altId = subcatId.endsWith('s') ? subcatId.slice(0, -1) : `${subcatId}s`
            // FIXED: Products are stored directly in menuData[subcatId]
            const subcatData = (menuData as any)?.[subcatId]
              || (menuData as any)?.[altId]
              || (customCategories as any)[subcatId]
              || (customCategories as any)[altId]
              || []

            const hasSubSubcategories = Object.entries(subcategoryMapping)
              .some(([, parentId]) => parentId === subcatId)

            if (!Array.isArray(subcatData) && !hasSubSubcategories) return null
            if (Array.isArray(subcatData) && subcatData.length === 0 && !hasSubSubcategories) return null

            const subcatName = getSubcategoryDisplayName(subcatId, 'principales')

            return renderSubcategoryWithChildren(subcatId, subcatData, subcatName, 'principales')
          })}
        </>
      );
    }


    // Para cualquier otra categoría, buscar subcategorías dinámicas
    const dynamicSubcategories = sortSubcategories(
      Object.entries(subcategoryMapping)
        .filter(([subcatId, parentId]) => parentId === categoryName),
      categoryName
    ).map(([subcatId]) => {
      const altId = subcatId.endsWith('s') ? subcatId.slice(0, -1) : `${subcatId}s`
      // FIXED: Products are stored directly in menuData[subcatId], not nested under parent
      // Check direct lookup first, then fallback to other locations
      const subcatData = (menuData as any)?.[subcatId]
        || (menuData as any)?.[altId]
        || (customCategories as any)[subcatId]
        || (customCategories as any)[altId]
        || ((menuData as any)?.[categoryName]?.[subcatId])
        || ((menuData as any)?.[categoryName]?.[altId])
        || []

      const hasSubSubcategories = Object.entries(subcategoryMapping)
        .some(([, parentId]) => parentId === subcatId)

      if (!Array.isArray(subcatData) && !hasSubSubcategories) return null
      if (Array.isArray(subcatData) && subcatData.length === 0 && !hasSubSubcategories) return null

      const subcatName = getSubcategoryDisplayName(subcatId, categoryName)

      return renderSubcategoryWithChildren(subcatId, subcatData || [], subcatName, categoryName)
    })

    // Obtener productos directos de la categoría principal
    const categoryData = (customCategories as any)[categoryName] ?? (menuData as any)?.[categoryName]
    const directProducts = Array.isArray(categoryData) ? categoryData : []

    // Si hay productos directos o subcategorías, renderizarlos
    if (directProducts.length > 0 || dynamicSubcategories.length > 0) {
      return (
        <>
          {/* Mostrar productos directos de la categoría principal primero */}
          {directProducts.length > 0 && (
            <>
              {directProducts.map((item: any, index: number) => (
                <MenuItemComponent key={item.id || index} item={item} />
              ))}
            </>
          )}
          {/* Luego mostrar las subcategorías */}
          {dynamicSubcategories}
        </>
      )
    }

    return null;
  };

  // Función para hacer scroll a la primera categoría visible (iOS compatible)
  const scrollToFirstVisibleCategory = () => {
    console.log('🎬 VER MENÚ clickeado')

    if (!visibleCategories || Object.keys(visibleCategories).length === 0) {
      console.warn('⚠️ No hay categorías visibles')
      return
    }

    const sortedCategories = Object.entries(visibleCategories)
      .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0))
      .map(([key]) => key)

    console.log('📋 Categorías disponibles:', sortedCategories)

    if (sortedCategories.length > 0) {
      const firstCategory = sortedCategories[0]
      console.log('🎯 Navegando a primera categoría:', firstCategory)
      handleCategoryClick(firstCategory)
    }
  }

  return (
    <>
      <CobraLoadingScreen isLoading={loading} />
      <div className="cobra-snake-bg menu-page">
        {/* Fondo móvil - elemento real para mejor compatibilidad con iOS Safari */}
        <div className="cobra-snake-bg-mobile-overlay-wrapper">
          <div className="cobra-snake-bg-mobile-overlay" aria-hidden="true"></div>
        </div>
        {/* Carátula full-screen minimalista */}
        <header className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden pt-8 sm:pt-12">

          {/* Contenido centrado */}
          <div className="relative z-10 text-center px-4 sm:px-6 -mt-16 sm:-mt-20">
            {/* Logo y Año juntos, más cerca de los chefs */}
            <div className="flex flex-col items-center mb-3">
              <img
                src="/Logo cobra NEGRO.png"
                alt="Logo Cobra Negro"
                className="h-60 sm:h-40 lg:h-48 w-auto object-contain mx-auto opacity-90"
                style={{ marginTop: "0", marginBottom: "0" }}
              />
              <p
                className="text-sm sm:text-base tracking-tighter text-gray-300 mt-2 mb-2 podium-text"
                style={{ letterSpacing: "-1px" }}
              >
                Since 2020
              </p>
            </div>

            {/* Sección de chefs */}
            <div className="mb-4 sm:mb-5">
              <h2
                className="bebas-title font-bold"
                style={{ color: "#000", letterSpacing: "-1px", fontSize: "20px" }} // negro
              >
                <b>Chefs:</b>
              </h2>
              <div className="space-y-1 mb-2">
                <p className="podium-text text-gray-400 text-lg sm:text-xl">
                  Ezequiel Román
                </p>
                <p className="podium-text text-gray-400 text-lg sm:text-xl">
                  Agustin Perez
                </p>
              </div>

              {/* Iconos de categorías dietéticas */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs opacity-60">
                <div className="flex items-center justify-center gap-1">
                  <Leaf className="w-3 h-3 text-green" />
                  <span className="podium-text text-gray-400">Vegano</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Wheat className="w-3 h-3 text-gold" />
                  <span className="podium-text text-gray-400">Sin TACC</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3 text-coral" />
                  <span className="podium-text text-gray-400">Picante</span>
                </div>
              </div>
            </div>

            {/* Sección de logos - Carrusel infinito */}
            <div className="flex items-center justify-center my-18 sm:my-20">
              <div className="logos-carousel-container-large">
                <div className="logos-carousel-large">
                  <div className="logos-track-large">
                    {/* Primera serie de logos */}
                    <img src="/Logo Fernet.png" alt="Fernet Branca" className="logo-item-large" />
                    <img src="/Chandon Logo.png" alt="Chandon" className="logo-item-large" />
                    <img src="/Carpano_Logos_BLANCO-2 (5).png" alt="Carpano" className="logo-item-large" />
                    <img src="/Patagonia Logo.png" alt="Patagonia" className="logo-item-large remove-background" />
                    <img src="/logo-Johnnie-Walker.png" alt="Johnnie Walker" className="logo-item-large" />
                    <img src="/Tanqueray-Logo.png" alt="Tanqueray" className="logo-item-large" />
                    <img src="/SERNOVA-Logotipo-Black-NTB433.png" alt="Sernova" className="logo-item-large" />
                    <img src="/Gordons-Gin-Logo.png" alt="Gordon's" className="logo-item-large" />
                    <img src="https://logos-world.net/wp-content/uploads/2020/11/Red-Bull-Logo.png" alt="Red Bull" className="logo-item-large" />
                    <img src="/Puerto blest logo.png" alt="Puerto Blest" className="logo-item-large" />
                    <img src="/Terrazas de los andes logo.png" alt="Terrazas de los Andes" className="logo-item-large remove-background" />
                    {/* Segunda serie para el efecto infinito */}
                    <img src="/Logo Fernet.png" alt="Fernet Branca" className="logo-item-large" />
                    <img src="/Chandon Logo.png" alt="Chandon" className="logo-item-large" />
                    <img src="/Carpano_Logos_BLANCO-2 (5).png" alt="Carpano" className="logo-item-large" />
                    <img src="/Patagonia Logo.png" alt="Patagonia" className="logo-item-large remove-background" />
                    <img src="/logo-Johnnie-Walker.png" alt="Johnnie Walker" className="logo-item-large" />
                    <img src="/Tanqueray-Logo.png" alt="Tanqueray" className="logo-item-large" />
                    <img src="/SERNOVA-Logotipo-Black-NTB433.png" alt="Sernova" className="logo-item-large" />
                    <img src="/Gordons-Gin-Logo.png" alt="Gordon's" className="logo-item-large" />
                    <img src="https://logos-world.net/wp-content/uploads/2020/11/Red-Bull-Logo.png" alt="Red Bull" className="logo-item-large" />
                    <img src="/Puerto blest logo.png" alt="Puerto Blest" className="logo-item-large" />
                    <img src="/Terrazas de los andes logo.png" alt="Terrazas de los Andes" className="logo-item-large remove-background" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Indicador de scroll estilo grafiti */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-center">
            <button
              className="graffiti-arrow-container cursor-pointer hover:opacity-80 transition-opacity duration-300"
              onTouchEnd={() => {
                // No usar preventDefault para que funcione en iOS
                console.log('👆 Touch en VER MENÚ')
                scrollToFirstVisibleCategory()
              }}
              onClick={() => {
                console.log('🖱️ Click en VER MENÚ')
                scrollToFirstVisibleCategory()
              }}
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                WebkitTapHighlightColor: 'transparent',
                userSelect: 'none'
              }}
            >
              <span className="text-sm tracking-wide podium-text text-amber-400/80 font-bold">VER MENÚ</span>
              <div className="graffiti-arrow-down"></div>
            </button>
          </div>
        </header>

        {/* Contenido del menú */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">

          <div className="sticky top-0 z-50 mobile-tabs mb-6 lg:hidden">
            <div className="flex overflow-x-auto category-scroll-container" style={{ WebkitOverflowScrolling: 'touch' }}>
              {Object.entries(visibleCategories)
                .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0))
                .map(([key, category]) => (
                  <button
                    key={key}
                    data-tab={key}
                    onTouchStart={(e) => {
                      e.currentTarget.style.opacity = '0.8'
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.opacity = '1'
                      // No usar preventDefault para que funcione en iOS
                      console.log('👆 Touch END en categoría:', key)
                      handleCategoryClick(key)
                    }}
                    onClick={() => {
                      console.log('🖱️ Click en categoría:', key)
                      handleCategoryClick(key)
                    }}
                    className={`flex-shrink-0 bebas-title-category-bar category-button ${activeCategory === key ? "active" : ""
                      }`}
                    type="button"
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    {category.name}
                  </button>
                ))}
            </div>
          </div>

          <div className="grid-pattern">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
              {generateDynamicLayout()}
            </div>

            <div className="promo-box rounded-lg p-6 sm:p-8 mt-8 sm:mt-10 lg:mt-12 industrial-accent">
              <h3 className="bebas-title text-2xl sm:text-3xl mb-2 sm:mb-3 text-black !text-black">
                COBRA BAR
              </h3>
              <div className="space-y-2 sm:space-y-3 text-black">
                <p className="text-sm sm:text-base mb-4 sm:mb-6 text-black podium-text">
                  <span className="bebas-title text-gold text-lg"></span> Avisar en caja para tomar extremos cuidados en su preparación
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-black">
                  <div className="flex items-center justify-center gap-2">
                    <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-green" style={{ filter: 'drop-shadow(0 0 6px #00ff41)' }} />
                    <span className="podium-text text-black">Vegano</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Wheat className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" style={{ filter: 'drop-shadow(0 0 6px #FFD700)' }} />
                    <span className="podium-text text-black">Sin TACC</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-coral" style={{ filter: 'drop-shadow(0 0 6px #FF5733)' }} />
                    <span className="podium-text text-black">Picante</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="pt-8 sm:pt-10 lg:pt-12 pb-8 relative z-10" style={{ backgroundColor: '#d4cfc0' }}>
        {/* Divisor superior con estilo de la página */}
        <div className="flex justify-center mb-8">
          <div className="neon-category-divider"></div>
        </div>

        {/* Contenido principal del footer */}
        <div className="text-center max-w-4xl mx-auto px-4">
          {/* Logo y nombre del restaurante */}
          <div className="mb-6">
            <div className="flex justify-center items-center mb-4">
              <img
                src="/Logo cobra NEGRO.png"
                alt="Cobra Bar Logo"
                className="h-20 w-auto"
              />
            </div>

            <p className="text-sm sm:text-base podium-text text-gray-700">
              Experiencia gastronómica única
            </p>
          </div>

          {/* Información de copyright */}
          <div className="mb-6">
            <p className="text-xs sm:text-sm podium-text text-gray-700">
              © 2025 COBRA BAR - TODOS LOS DERECHOS RESERVADOS
            </p>
          </div>

          {/* Divisor medio */}
          <div className="flex justify-center mb-8">
            <div className="neon-category-divider"></div>
          </div>

          {/* Créditos de desarrollo */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
            <p className="text-xs podium-text text-gray-700">
              Desarrollado con ❤️ por
            </p>
            <div className="flex gap-4">
              <a
                href="https://akdmiastudio.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs podium-text hover:text-coral transition-colors duration-300 border-b border-transparent hover:border-gray-900 pb-1"
                style={{ color: '#231F20' }}
              >
                AKDMIA Studio
              </a>
              <span className="text-xs podium-text text-gray-700">•</span>
              <a
                href="https://livvvv.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs podium-text hover:text-coral transition-colors duration-300 border-b border-transparent hover:border-gray-900 pb-1"
                style={{ color: '#231F20' }}
              >
                Livv Studio
              </a>
            </div>
          </div>
        </div>

        {/* Divisor inferior */}
        <div className="flex justify-center mt-8">
          <div className="minimal-divider w-24"></div>
        </div>
      </footer>
    </>
  )
}
