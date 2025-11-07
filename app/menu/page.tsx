"use client"

import { useState, useRef, useEffect } from "react"
import type React from "react"
import { Leaf, Flame, Wheat } from "lucide-react"
import { useMenuData } from "@/hooks/use-menu-data"
import { useCategories } from "@/hooks/use-categories"
import { useSubcategoryMapping } from "@/hooks/use-subcategory-mapping"

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
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <h3 className="text-lg sm:text-xl truncate bebas-title" style={{color: '#231F20'}}>{item.name}</h3>
        {item.tags && (
          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
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
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <h3 className="text-lg sm:text-xl truncate bebas-title" style={{color: '#231F20'}}>{item.name}</h3>
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
  
  // Filtrar categorías para incluir solo las que están en menuData (visibles por horario)
  const visibleCategories = menuData 
    ? Object.fromEntries(
        Object.entries(categories).filter(([key]) => key in menuData)
      )
    : categories
  
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
  
  const [activeTab, setActiveTab] = useState(getFirstVisibleCategory())
  const [isManualSelection, setIsManualSelection] = useState(false)
  const [lastManualSelection, setLastManualSelection] = useState<string | null>(null)
  const [lastScrollPosition, setLastScrollPosition] = useState(0)
  const [manualSelectionScrollPosition, setManualSelectionScrollPosition] = useState(0)
  
  // Actualizar el activeTab cuando cambien las categorías visibles - solo si no hay selección manual
  useEffect(() => {
    // No actualizar si hay una selección manual activa o reciente
    if (isManualSelection || lastManualSelection) {
      return
    }
    
    const firstVisible = getFirstVisibleCategory()
    if (firstVisible && firstVisible !== activeTab) {
      setActiveTab(firstVisible)
    }
  }, [visibleCategories, isManualSelection, lastManualSelection])
  
  // Definir todos los hooks al principio, antes de cualquier lógica condicional
  const sectionRefs = {
    parrilla: useRef<HTMLDivElement>(null),
    tapeo: useRef<HTMLDivElement>(null),
    principales: useRef<HTMLDivElement>(null),
    sandwicheria: useRef<HTMLDivElement>(null),
    cafeteria: useRef<HTMLDivElement>(null),
    postres: useRef<HTMLDivElement>(null),
    bebidas: useRef<HTMLDivElement>(null),
    tragos: useRef<HTMLDivElement>(null),
    vinos: useRef<HTMLDivElement>(null),
    promociones: useRef<HTMLDivElement>(null)
  }

  // Hook para detectar automáticamente la categoría visible
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const scrollCategoryBarToActive = (categoryKey: string) => {
      const activeButton = document.querySelector(`[data-tab="${categoryKey}"]`)
      if (activeButton) {
        const categoryContainer = document.querySelector('.category-scroll-container')
        if (categoryContainer) {
          const containerRect = categoryContainer.getBoundingClientRect()
          const buttonRect = activeButton.getBoundingClientRect()
          
          // Calcular la posición de scroll para centrar el botón
          const buttonOffsetLeft = (activeButton as HTMLElement).offsetLeft
          const containerWidth = containerRect.width
          const buttonWidth = buttonRect.width
          
          const targetScrollLeft = buttonOffsetLeft - (containerWidth / 2) + (buttonWidth / 2)
          
          // Scroll suave hacia el botón activo
          categoryContainer.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth'
          })
        }
      }
    }

    const detectActiveCategory = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      // No ejecutar si hay una selección manual reciente - esto previene que se sobrescriba la selección manual
      if (isManualSelection) {
        return
      }
      
      // Verificar si el usuario ha hecho scroll manualmente después de la selección manual
      const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop || window.scrollY
      
      // Si hay una selección manual reciente, verificar si el usuario ha hecho scroll significativo
      // Si no ha hecho scroll significativo (>100px), mantener la selección manual
      if (lastManualSelection && manualSelectionScrollPosition > 0) {
        const scrollDifference = Math.abs(currentScrollPosition - manualSelectionScrollPosition)
        // Si el usuario no ha hecho scroll significativo, mantener la selección manual
        if (scrollDifference < 100) {
          return
        }
        // Si el usuario ha hecho scroll significativo, limpiar la selección manual para permitir detección automática
      }
      
      timeoutId = setTimeout(() => {
        // Verificar nuevamente si hay selección manual
        if (isManualSelection) {
          return
        }

        // Usar getBoundingClientRect directamente para mejor precisión en móvil
        const isMobileDevice = window.innerWidth < 1024
        const headerOffset = isMobileDevice ? 220 : 150 // Offset para la barra sticky
        
        // Crear lista de todas las secciones con sus posiciones relativas al viewport
        const sections: Array<{key: string, top: number, bottom: number, element: HTMLElement}> = []
        
        // Agregar secciones estándar desde refs
        Object.entries(sectionRefs).forEach(([key, ref]) => {
          if (ref.current && ref.current.offsetParent !== null) {
            const rect = ref.current.getBoundingClientRect()
            if (rect.height > 0) { // Solo agregar si el elemento es visible
              sections.push({ 
                key, 
                top: rect.top, 
                bottom: rect.bottom,
                element: ref.current
              })
            }
          }
        })
        
        // Agregar categorías personalizadas desde data-category
        const customSections = document.querySelectorAll('[data-category]')
        customSections.forEach(section => {
          const htmlSection = section as HTMLElement
          if (htmlSection.offsetParent !== null) {
            const rect = htmlSection.getBoundingClientRect()
            const key = section.getAttribute('data-category') || ''
            if (key && rect.height > 0) { // Solo agregar si el elemento es visible
              // Evitar duplicados
              if (!sections.find(s => s.key === key)) {
                sections.push({ 
                  key, 
                  top: rect.top, 
                  bottom: rect.bottom,
                  element: htmlSection
                })
              }
            }
          }
        })
        
        // Si no hay secciones disponibles, salir
        if (sections.length === 0) {
          return
        }
        
        // Ordenar por posición vertical (top)
        sections.sort((a, b) => a.top - b.top)
        
        // Encontrar la sección activa - la que está más visible en el viewport
        let activeSection = ''
        const detectionPoint = headerOffset
        const viewportHeight = window.innerHeight
        const viewportCenter = viewportHeight / 2
        
        // Buscar la sección que tiene más área visible en el viewport
        let maxVisibleArea = 0
        let bestSection = ''
        
        for (const section of sections) {
          // Calcular el área visible de esta sección en el viewport
          const visibleTop = Math.max(0, section.top)
          const visibleBottom = Math.min(viewportHeight, section.bottom)
          const visibleHeight = Math.max(0, visibleBottom - visibleTop)
          
          // Si la sección está visible y tiene un área significativa
          if (visibleHeight > 50) { // Mínimo 50px de altura visible
            // Priorizar secciones que están cerca del punto de detección
            const distanceFromDetection = Math.abs((section.top + section.bottom) / 2 - detectionPoint)
            const score = visibleHeight - (distanceFromDetection * 0.1) // Penalizar distancia
            
            if (score > maxVisibleArea) {
              maxVisibleArea = score
              bestSection = section.key
            }
          }
        }
        
        // Si encontramos una sección con buena visibilidad, usarla
        if (bestSection) {
          activeSection = bestSection
        } else {
          // Fallback: buscar la sección más cercana al punto de detección
          let minDistance = Infinity
          for (const section of sections) {
            const sectionCenter = (section.top + section.bottom) / 2
            const distance = Math.abs(sectionCenter - detectionPoint)
            
            if (distance < minDistance) {
              minDistance = distance
              activeSection = section.key
            }
          }
        }
        
        // Si aún no hay activa, usar la primera sección visible
        if (!activeSection && sections.length > 0) {
          activeSection = sections[0].key
        }
        
        // Actualizar solo si es diferente y no hay una selección manual reciente
        if (activeSection && activeSection !== activeTab && !isManualSelection && !lastManualSelection) {
          const currentScrollPos = window.pageYOffset || document.documentElement.scrollTop || window.scrollY
          setActiveTab(activeSection)
          setLastScrollPosition(currentScrollPos)
          
          // Scroll automático de la barra de categorías
          requestAnimationFrame(() => {
            setTimeout(() => {
              scrollCategoryBarToActive(activeSection)
            }, 50)
          })
        }
      }, window.innerWidth < 1024 ? 100 : 50) // Reducir delay para mejor respuesta en móvil
    }

    // Ejecutar al cargar y al montar el componente - delay mayor para asegurar que todo esté renderizado
    const initialDetection = setTimeout(() => {
      detectActiveCategory()
    }, 500)

    // Listener de scroll con throttling mejorado usando requestAnimationFrame para mejor rendimiento en móvil
    let scrollTimeout: NodeJS.Timeout | null = null
    let rafId: number | null = null
    let lastScrollTop = 0
    
    const handleScroll = () => {
      // Cancelar cualquier requestAnimationFrame pendiente
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      
      // Usar requestAnimationFrame para mejor rendimiento, especialmente en móvil
      rafId = requestAnimationFrame(() => {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop || window.scrollY
        
        // Actualizar la posición de scroll
        setLastScrollPosition(currentScrollTop)
        
        // Solo ejecutar si el scroll cambió significativamente (más de 10px)
        if (Math.abs(currentScrollTop - lastScrollTop) > 10) {
          lastScrollTop = currentScrollTop
          
          // Si hay una selección manual reciente, verificar si el usuario ha hecho scroll significativo
          // Si ha hecho scroll significativo (>100px), limpiar la selección manual y permitir detección
          if (lastManualSelection) {
            const scrollDiff = Math.abs(currentScrollTop - manualSelectionScrollPosition)
            if (scrollDiff > 100) {
              // El usuario ha hecho scroll significativo después del clic, limpiar selección manual
              setLastManualSelection(null)
              setManualSelectionScrollPosition(0)
            } else {
              // El usuario no ha hecho scroll significativo, mantener la selección manual
              return
            }
          }
          
          // Delay más corto para mejor respuesta cuando el usuario hace scroll manual
          const delay = 100 // Delay fijo para mejor respuesta
          
          if (scrollTimeout) {
            clearTimeout(scrollTimeout)
          }
          
          scrollTimeout = setTimeout(() => {
            // Solo detectar si no hay selección manual activa
            if (!isManualSelection) {
              detectActiveCategory()
            }
          }, delay)
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // También ejecutar cuando cambien las categorías visibles
    const categoriesChangeDetection = setTimeout(() => {
      detectActiveCategory()
    }, 600)

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      clearTimeout(initialDetection)
      clearTimeout(categoriesChangeDetection)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [activeTab, visibleCategories, isManualSelection, lastManualSelection, lastScrollPosition, manualSelectionScrollPosition])
  
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
    promociones,
    ...customCategories
  } = menuData

  // Obtener categorías personalizadas (excluyendo las estándar y subcategorías)
  const standardCategories = [
    'parrilla', 'guarniciones', 'tapeo', 'milanesas', 'hamburguesas', 
    'ensaladas', 'otros', 'postres', 'sandwicheria', 'cafeteria', 
    'pasteleria', 'bebidasSinAlcohol', 'cervezas', 'tragosClasicos', 
    'tragosEspeciales', 'tragosRedBull', 'vinos', 'botellas', 'promociones'
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
    // Primero verificar si la categoría existe en los datos del menú
    if (!menuData || !menuData[categoryId as keyof typeof menuData]) {
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
        return renderSubcategoriesInCategory("principales")
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
        return (
          <>
            {bebidasSinAlcohol?.map((item, index) => (
              <MenuItemComponent key={item.id || index} item={item} />
            ))}
            <h3 className="bebas-title text-xl sm:text-2xl mb-3 sm:mb-4 text-gray-light mt-8">CERVEZAS</h3>
            {cervezas?.map((item, index) => (
              <MenuItemComponent key={item.id || index} item={item} />
            ))}
          </>
        )
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
      case 'promociones':
        return (
          <>
            {renderSubcategoriesInCategory("promociones")}
          </>
        )
      default:
        // Para categorías personalizadas
        return renderSubcategoriesInCategory(categoryId)
    }
  }

  // Función para renderizar subcategorías dentro de una categoría
  const renderSubcategoriesInCategory = (categoryName: string) => {
    if (categoryName === 'parrilla') {
      return (
        <>
                    {/* Subcategorías dinámicas */}
          {Object.entries(subcategoryMapping)
            .filter(([subcatId, parentId]) => parentId === 'parrilla')
            .map(([subcatId]) => {
              const altId = subcatId.endsWith('s') ? subcatId.slice(0, -1) : `${subcatId}s`
              const subcatData = (customCategories as any)[subcatId]
                || (customCategories as any)[altId]
                || ((menuData as any)?.['parrilla']?.[subcatId])
                || ((menuData as any)?.['parrilla']?.[altId])
                || ((menuData as any)?.[subcatId])
                || ((menuData as any)?.[altId])
                || []
              if (!Array.isArray(subcatData) || subcatData.length === 0) return null
              const subcatName = subcatId.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')
              
              // Si es "guarniciones", usar los datos de la sección hardcodeada
              if (subcatId === 'guarniciones') {
                return (
                  <SubcategorySection key={subcatId} title={subcatName.toUpperCase()}>
                    {guarniciones?.map((item, index) => (
                      <MenuItemComponent key={item.id || index} item={item} />
                    ))}
                  </SubcategorySection>
                )
              }
              
              return (
                <SubcategorySection key={subcatId} title={subcatName.toUpperCase()}>
                  {subcatData.map((item: any, index: number) => (
                    <MenuItemComponent key={item.id || index} item={item} />
                  ))}
                </SubcategorySection>
              )
            })}
        </>
      );
    }
    
    if (categoryName === 'principales') {
      return (
        <>
          {/* Subcategorías dinámicas */}
          {Object.entries(subcategoryMapping)
            .filter(([subcatId, parentId]) => parentId === 'principales')
            .map(([subcatId]) => {
              const altId = subcatId.endsWith('s') ? subcatId.slice(0, -1) : `${subcatId}s`
              const subcatData = (customCategories as any)[subcatId]
                || (customCategories as any)[altId]
                || ((menuData as any)?.['principales']?.[subcatId])
                || ((menuData as any)?.['principales']?.[altId])
                || ((menuData as any)?.[subcatId])
                || ((menuData as any)?.[altId])
                || []
              if (!Array.isArray(subcatData) || subcatData.length === 0) return null
              const subcatName = subcatId.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')
              
              // Si es una subcategoría hardcodeada, usar los datos correspondientes
              if (subcatId === 'milanesas') {
                return (
                  <SubcategorySection key={subcatId} title={subcatName.toUpperCase()}>
                    {milanesas?.map((item, index) => (
                      <MenuItemComponent key={item.id || index} item={item} />
                    ))}
                  </SubcategorySection>
                )
              }
              
              if (subcatId === 'hamburguesas') {
                return (
                  <SubcategorySection key={subcatId} title={subcatName.toUpperCase()}>
                    {hamburguesas?.map((item, index) => (
                      <MenuItemComponent key={item.id || index} item={item} />
                    ))}
                  </SubcategorySection>
                )
              }
              
              if (subcatId === 'ensaladas') {
                return (
                  <SubcategorySection key={subcatId} title={subcatName.toUpperCase()}>
                    {ensaladas?.map((item, index) => (
                      <MenuItemComponent key={item.id || index} item={item} />
                    ))}
                  </SubcategorySection>
                )
              }
              
              if (subcatId === 'otros') {
                return (
                  <SubcategorySection key={subcatId} title={subcatName.toUpperCase()}>
                    {otros?.map((item, index) => (
                      <MenuItemComponent key={item.id || index} item={item} />
                    ))}
                  </SubcategorySection>
                )
              }
              
              return (
                <SubcategorySection key={subcatId} title={subcatName.toUpperCase()}>
                  {subcatData.map((item: any, index: number) => (
                    <MenuItemComponent key={item.id || index} item={item} />
                  ))}
                </SubcategorySection>
              )
            })}
        </>
      );
    }
    
    if (categoryName === 'promociones') {
      return (
        <div className="space-y-6 sm:space-y-8">
          {/* Subcategorías dinámicas */}
          {Object.entries(subcategoryMapping)
            .filter(([subcatId, parentId]) => parentId === 'promociones')
            .map(([subcatId]) => {
              const altId = subcatId.endsWith('s') ? subcatId.slice(0, -1) : `${subcatId}s`
              const subcatData = (customCategories as any)[subcatId]
                || (customCategories as any)[altId]
                || ((promociones as any)?.[subcatId])
                || ((promociones as any)?.[altId])
                || ((menuData as any)?.[subcatId])
                || ((menuData as any)?.[altId])
                || []
              if (!Array.isArray(subcatData) || subcatData.length === 0) return null
              const subcatName = subcatId.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')
              
              // Si es una subcategoría hardcodeada, usar los datos correspondientes
              if (subcatId === 'cafe') {
                return (
                  <SubcategorySection key={subcatId} title={subcatName.toUpperCase()}>
                    {promociones?.cafe?.map((promo, index) => (
                      <MenuItemComponent key={promo.id || index} item={promo} />
                    ))}
                  </SubcategorySection>
                )
              }
              
              if (subcatId === 'tapeos') {
                return (
                  <SubcategorySection key={subcatId} title={subcatName.toUpperCase()}>
                    {promociones?.tapeos?.map((promo, index) => (
                      <MenuItemComponent key={promo.id || index} item={promo} />
                    ))}
                  </SubcategorySection>
                )
              }
              
              if (subcatId === 'bebidas') {
                return (
                  <SubcategorySection key={subcatId} title={subcatName.toUpperCase()}>
                    {promociones?.bebidas?.map((promo, index) => (
                      <MenuItemComponent key={promo.id || index} item={promo} />
                    ))}
                  </SubcategorySection>
                )
              }
              
              return (
                <SubcategorySection key={subcatId} title={subcatName.toUpperCase()}>
                  {subcatData.map((item: any, index: number) => (
                    <MenuItemComponent key={item.id || index} item={item} />
                  ))}
                </SubcategorySection>
              )
            })}
        </div>
      );
    }
    
    // Para cualquier otra categoría, buscar subcategorías dinámicas
    const dynamicSubcategories = Object.entries(subcategoryMapping)
      .filter(([subcatId, parentId]) => parentId === categoryName)
      .map(([subcatId]) => {
        const altId = subcatId.endsWith('s') ? subcatId.slice(0, -1) : `${subcatId}s`
        const subcatData = (customCategories as any)[subcatId]
          || (customCategories as any)[altId]
          || ((menuData as any)?.[categoryName]?.[subcatId])
          || ((menuData as any)?.[categoryName]?.[altId])
          || ((menuData as any)?.[subcatId])
          || ((menuData as any)?.[altId])
          || []
        if (!Array.isArray(subcatData) || subcatData.length === 0) return null
        const subcatName = subcatId.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
        
        return (
          <SubcategorySection key={subcatId} title={subcatName.toUpperCase()}>
            {subcatData.map((item: any, index: number) => (
              <MenuItemComponent key={item.id || index} item={item} />
            ))}
          </SubcategorySection>
        )
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

  const scrollCategoryBarToButton = (sectionKey: string) => {
    const activeButton = document.querySelector(`[data-tab="${sectionKey}"]`)
    if (activeButton) {
      const categoryContainer = document.querySelector('.category-scroll-container')
      if (categoryContainer) {
        const containerRect = categoryContainer.getBoundingClientRect()
        const buttonRect = activeButton.getBoundingClientRect()
        
        // Calcular la posición de scroll para centrar el botón
        const buttonOffsetLeft = (activeButton as HTMLElement).offsetLeft
        const containerWidth = containerRect.width
        const buttonWidth = buttonRect.width
        
        const targetScrollLeft = buttonOffsetLeft - (containerWidth / 2) + (buttonWidth / 2)
        
        // Scroll suave hacia el botón activo
        categoryContainer.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth'
        })
      }
    }
  }

  const scrollToSection = (sectionKey: string) => {
    // Marcar como selección manual y guardar la selección
    const currentScrollPos = window.pageYOffset || document.documentElement.scrollTop || window.scrollY
    setIsManualSelection(true)
    setLastManualSelection(sectionKey)
    setManualSelectionScrollPosition(currentScrollPos) // Guardar posición de scroll al hacer clic
    setLastScrollPosition(currentScrollPos)
    
    // Actualizar el estado activo inmediatamente
    setActiveTab(sectionKey)
    
    // Scroll de la barra de categorías primero
    scrollCategoryBarToButton(sectionKey)
    
    // Función para encontrar y hacer scroll al elemento
    const findAndScroll = (attempts = 0) => {
      if (attempts > 20) {
        console.warn(`No se pudo encontrar la sección después de ${attempts} intentos: ${sectionKey}`)
        setIsManualSelection(false)
        return
      }

      let element: HTMLElement | null = null
      
      // Primero buscar por data-category (más confiable para todas las categorías)
      element = document.querySelector(`[data-category="${sectionKey}"]`) as HTMLElement
      
      // Si no se encuentra, intentar con las referencias existentes
      if (!element && sectionKey in sectionRefs) {
        element = sectionRefs[sectionKey as keyof typeof sectionRefs]?.current || null
      }
      
      // Si aún no se encuentra, buscar cualquier elemento con el atributo data-category que coincida
      if (!element) {
        const allSections = document.querySelectorAll('[data-category]')
        allSections.forEach(section => {
          if (section.getAttribute('data-category') === sectionKey) {
            element = section as HTMLElement
          }
        })
      }
      
      if (element) {
        // Verificar que el elemento sea visible
        const rect = element.getBoundingClientRect()
        const isVisible = rect.width > 0 && rect.height > 0
        
        if (isVisible) {
          const isMobile = window.innerWidth < 1024
          const headerOffset = isMobile ? 220 : 150
          
          // En móvil, usar scrollIntoView que funciona mejor en iOS
          if (isMobile) {
            // Usar scrollIntoView con opciones específicas para iOS
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            })
            
            // Ajustar manualmente después del scroll para compensar el header sticky
            setTimeout(() => {
              const currentScroll = window.pageYOffset || document.documentElement.scrollTop || window.scrollY
              const elementTop = element!.getBoundingClientRect().top + currentScroll
              const targetPosition = elementTop - headerOffset
              
              window.scrollTo({
                top: Math.max(0, targetPosition),
                behavior: 'smooth'
              })
            }, 100)
          } else {
            // En desktop, usar el método original
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop || window.scrollY
            const elementTop = rect.top + scrollTop
            const targetPosition = elementTop - headerOffset
            
            window.scrollTo({
              top: Math.max(0, targetPosition),
              behavior: "smooth"
            })
          }
          
          // Después de completar el scroll, NO permitir la detección automática inmediatamente
          // La selección manual se mantendrá hasta que el usuario haga scroll manualmente
          // Solo desactivar isManualSelection después de un tiempo muy largo, pero mantener lastManualSelection
          setTimeout(() => {
            setIsManualSelection(false)
            // Mantener lastManualSelection por más tiempo para evitar que se sobrescriba
            // Solo se limpiará cuando el usuario haga scroll significativo (>100px)
          }, isMobile ? 5000 : 4000) // Tiempo largo para asegurar que la selección se mantenga
        } else {
          // Si el elemento no es visible aún, reintentar
          setTimeout(() => {
            findAndScroll(attempts + 1)
          }, 100)
        }
      } else {
        // Si el elemento no está disponible aún, reintentar después de un delay
        setTimeout(() => {
          findAndScroll(attempts + 1)
        }, 100)
      }
    }
    
    // Iniciar búsqueda inmediatamente y también después de un delay para asegurar que el DOM esté listo
    findAndScroll()
    requestAnimationFrame(() => {
      setTimeout(() => {
        findAndScroll()
      }, 50)
    })
  }

    // Función para encontrar la primera categoría visible y desplazarse a ella
    const scrollToFirstVisibleCategory = () => {
      // Obtener categorías visibles ordenadas
      if (!visibleCategories || Object.keys(visibleCategories).length === 0) {
        return
      }
      
      const sortedVisibleCategories = Object.entries(visibleCategories)
        .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0))
        .map(([key]) => key)

      // Usar la primera categoría visible
      if (sortedVisibleCategories.length > 0) {
        scrollToSection(sortedVisibleCategories[0])
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
          <div 
            className="graffiti-arrow-container cursor-pointer hover:opacity-80 transition-opacity duration-300"
            onClick={scrollToFirstVisibleCategory}
          >
            <span className="text-sm tracking-wide podium-text text-amber-400/80 font-bold">VER MENÚ</span>
            <div className="graffiti-arrow-down"></div>
          </div>
        </div>
        </header>

      {/* Contenido del menú */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">

        <div className="sticky top-0 z-50 mobile-tabs mb-6 lg:hidden">
          <div className="flex overflow-x-auto category-scroll-container">
            {(() => {
              // Generar las categorías del menú deslizable basándose en las categorías visibles y su orden
              if (!visibleCategories || Object.keys(visibleCategories).length === 0) {
                return null
              }

              // Convertir categorías visibles a array y ordenar por 'order'
              const sortedCategories = Object.entries(visibleCategories)
                .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0))
                .map(([key, category]) => ({
                  key,
                  label: category.name || key.toUpperCase()
                }))

              return sortedCategories.map((tab) => {
                const handleCategoryClick = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
                  e.preventDefault()
                  e.stopPropagation()
                  
                  // En móvil, prevenir el scroll del contenedor cuando se toca un botón
                  const container = document.querySelector('.category-scroll-container') as HTMLElement
                  if (container) {
                    container.style.scrollBehavior = 'auto'
                  }
                  
                  // Ejecutar scroll inmediatamente
                  scrollToSection(tab.key)
                  
                  // Restaurar scroll suave después de un delay
                  setTimeout(() => {
                    if (container) {
                      container.style.scrollBehavior = 'smooth'
                    }
                  }, 100)
                }

                return (
                  <button
                    key={tab.key}
                    data-tab={tab.key}
                    onClick={handleCategoryClick}
                    onTouchEnd={(e) => {
                      // Manejar touch end para móvil - prevenir comportamiento por defecto
                      e.preventDefault()
                      e.stopPropagation()
                      handleCategoryClick(e)
                    }}
                    onTouchStart={(e) => {
                      // Feedback visual inmediato sin prevenir el evento
                      e.currentTarget.style.opacity = '0.7'
                    }}
                    onTouchCancel={(e) => {
                      // Restaurar opacidad si se cancela el touch
                      e.currentTarget.style.opacity = '1'
                    }}
                    className={`flex-shrink-0 bebas-title-category-bar category-button ${
                      activeTab === tab.key ? "active" : ""
                    }`}
                    type="button"
                  >
                    {tab.label}
                  </button>
                )
              })
            })()}
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
