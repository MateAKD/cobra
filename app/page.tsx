"use client"

import { useRef, useEffect } from "react"

import { useState } from "react"
import type React from "react"
import { Leaf, Flame, Wheat } from "lucide-react"
import { useMenuData } from "@/hooks/use-menu-data"
import { useCategories } from "@/hooks/use-categories"
import { useSubcategoryMapping } from "@/hooks/use-subcategory-mapping"

// Componente de carga con logo de Cobra
const CobraLoadingScreen = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null

  return (
    <div className={`cobra-loading-container ${!isLoading ? 'fade-out' : ''}`}>
      <div className="relative">
        <div className="cobra-logo-fill"></div>
        <div className="cobra-loading-text">
          COBRA
          <span className="cobra-loading-dots"></span>
        </div>
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

export default function MauerMenu() {
  const [activeTab, setActiveTab] = useState("parrilla")
  const { menuData, loading, error } = useMenuData()
  const { categories, loading: categoriesLoading } = useCategories()
  const { subcategoryMapping, loading: subcategoryLoading } = useSubcategoryMapping()
  
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

    const detectActiveCategory = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = setTimeout(() => {
        const scrollTop = window.scrollY
        const windowHeight = window.innerHeight
        const centerOfViewport = scrollTop + windowHeight / 2
        
        // Crear lista de todas las secciones con sus posiciones
        const sections: Array<{key: string, top: number, bottom: number}> = []
        
        // Agregar secciones estándar
        Object.entries(sectionRefs).forEach(([key, ref]) => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect()
            const top = rect.top + scrollTop
            const bottom = top + rect.height
            sections.push({ key, top, bottom })
          }
        })
        
        // Agregar categorías personalizadas
        const customSections = document.querySelectorAll('[data-category]')
        customSections.forEach(section => {
          const rect = section.getBoundingClientRect()
          const top = rect.top + scrollTop
          const bottom = top + rect.height
          const key = section.getAttribute('data-category') || ''
          if (key) {
            sections.push({ key, top, bottom })
          }
        })
        
        // Ordenar por posición vertical
        sections.sort((a, b) => a.top - b.top)
        
        // Encontrar la sección activa
        let activeSection = ''
        
        // Buscar la sección que contiene el centro del viewport
        for (const section of sections) {
          if (centerOfViewport >= section.top && centerOfViewport <= section.bottom) {
            activeSection = section.key
            break
          }
        }
        
        // Si no encontramos ninguna, buscar la que está más cerca del centro
        if (!activeSection) {
          let minDistance = Infinity
          for (const section of sections) {
            const sectionCenter = (section.top + section.bottom) / 2
            const distance = Math.abs(centerOfViewport - sectionCenter)
            if (distance < minDistance) {
              minDistance = distance
              activeSection = section.key
            }
          }
        }
        
        // Debug: mostrar todas las secciones
        console.log('=== DEBUG DETECCIÓN ===')
        console.log(`Centro del viewport: ${centerOfViewport}`)
        console.log('Secciones encontradas:')
        sections.forEach(section => {
          console.log(`  ${section.key}: ${section.top} - ${section.bottom} (centro: ${(section.top + section.bottom) / 2})`)
        })
        
        // Actualizar si es diferente
        if (activeSection && activeSection !== activeTab) {
          console.log(`✅ Cambiando a: ${activeSection} (centro: ${centerOfViewport})`)
          setActiveTab(activeSection)
          
          // Scroll automático de la barra de categorías
          setTimeout(() => {
            const activeButton = document.querySelector(`[data-tab="${activeSection}"]`)
            if (activeButton) {
              const categoryContainer = document.querySelector('.category-scroll-container')
              if (categoryContainer) {
                const containerRect = categoryContainer.getBoundingClientRect()
                const buttonRect = activeButton.getBoundingClientRect()
                
                // Calcular si el botón está fuera de la vista
                const isButtonVisible = buttonRect.left >= containerRect.left && 
                                       buttonRect.right <= containerRect.right
                
                if (!isButtonVisible) {
                  // Calcular la posición de scroll para centrar el botón
                  const containerScrollLeft = categoryContainer.scrollLeft
                  const buttonOffsetLeft = (activeButton as HTMLElement).offsetLeft
                  const containerWidth = containerRect.width
                  const buttonWidth = buttonRect.width
                  
                  const targetScrollLeft = buttonOffsetLeft - (containerWidth / 2) + (buttonWidth / 2)
                  
                  // Scroll suave hacia el botón activo
                  categoryContainer.scrollTo({
                    left: targetScrollLeft,
                    behavior: 'smooth'
                  })
                  
                  console.log(`📱 Scrolleando barra hacia: ${activeSection}`)
                }
              }
            }
          }, 150) // Pequeño delay para asegurar que el DOM se actualice
        } else if (activeSection) {
          console.log(`✅ Ya activa: ${activeSection}`)
        } else {
          console.log('❌ No se encontró sección activa')
        }
      }, 100)
    }

    // Ejecutar al cargar
    detectActiveCategory()

    // Listener de scroll
    window.addEventListener('scroll', detectActiveCategory, { passive: true })

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      window.removeEventListener('scroll', detectActiveCategory)
    }
  }, [activeTab])
  
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
            {/* Logo blanco encima, con animación de "llenado" vertical */}
            <img
              src="/Logo cobra NEGRO.png"
              alt="Logo Cobra"
              className="absolute inset-0 w-full h-full object-contain animate-logo-fill"
              style={{
                zIndex: 2,
                filter: "brightness(1.5)",
                WebkitMaskImage: "linear-gradient(to top, white 0%, white 100%)",
                maskImage: "linear-gradient(to top, white 0%, white 100%)"
              }}
              draggable={false}
            />
            <style jsx global>{`
              @keyframes logo-fill {
                0% {
                  clip-path: inset(100% 0 0 0);
                  opacity: 1;
                }
                20% {
                  clip-path: inset(80% 0 0 0);
                  opacity: 1;
                }
                40% {
                  clip-path: inset(60% 0 0 0);
                  opacity: 1;
                }
                60% {
                  clip-path: inset(40% 0 0 0);
                  opacity: 1;
                }
                80% {
                  clip-path: inset(20% 0 0 0);
                  opacity: 1;
                }
                100% {
                  clip-path: inset(0 0 0 0);
                  opacity: 1;
                }
              }
              .animate-logo-fill {
                animation: logo-fill 3s ease-in-out forwards;
                will-change: clip-path;
              }
            `}</style>
          </div>
          <p className="text-white text-lg mt-4 animate-pulse">Cargando menú...</p>
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
           !['guarniciones', 'milanesas', 'hamburguesas', 'ensaladas', 'otros', 'cafe', 'tapeos', 'bebidas', 'parrilla_empanadas'].includes(key) &&
           !Object.keys(subcategoryMapping).includes(key) // Excluir subcategorías
  )

  // Función para renderizar subcategorías dentro de una categoría
  const renderSubcategoriesInCategory = (categoryName: string) => {
    if (categoryName === 'parrilla') {
      return (
        <>
                    {/* Subcategorías dinámicas */}
          {Object.entries(subcategoryMapping)
            .filter(([subcatId, parentId]) => parentId === 'parrilla')
            .map(([subcatId]) => {
              // Debug: mostrar información de subcategorías
              console.log(`Renderizando subcategoría de parrilla: ${subcatId}`)
              const subcatData = (customCategories as any)[subcatId] || []
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
              const subcatData = (customCategories as any)[subcatId] || []
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
              const subcatData = (customCategories as any)[subcatId] || []
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
        const subcatData = (customCategories as any)[subcatId] || []
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
    
    return dynamicSubcategories.length > 0 ? <>{dynamicSubcategories}</> : null;
  };

      const scrollToSection = (sectionKey: string) => {
      setActiveTab(sectionKey)
      
      // Pequeño delay para asegurar que el estado se actualice
      setTimeout(() => {
        // Para categorías estándar, usar las referencias existentes
        if (sectionKey in sectionRefs) {
          const element = sectionRefs[sectionKey as keyof typeof sectionRefs]?.current
          if (element) {
            element.scrollIntoView({ 
              behavior: "smooth", 
              block: "start",
              inline: "nearest"
            })
          }
        } else {
          // Para categorías personalizadas, hacer scroll a la sección
          const customSection = document.querySelector(`[data-category="${sectionKey}"]`)
          if (customSection) {
            customSection.scrollIntoView({ 
              behavior: "smooth", 
              block: "start",
              inline: "nearest"
            })
          }
        }
        
        // Scroll automático de la barra de categorías al botón activo
        setTimeout(() => {
          const activeButton = document.querySelector(`[data-tab="${sectionKey}"]`)
          if (activeButton) {
            const categoryContainer = document.querySelector('.category-scroll-container')
            if (categoryContainer) {
              const containerRect = categoryContainer.getBoundingClientRect()
              const buttonRect = activeButton.getBoundingClientRect()
              
              // Calcular si el botón está fuera de la vista
              const isButtonVisible = buttonRect.left >= containerRect.left && 
                                     buttonRect.right <= containerRect.right
              
              if (!isButtonVisible) {
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
                
                console.log(`📱 Scroll manual hacia: ${sectionKey}`)
              }
            }
          }
        }, 300)
      }, 100)
    }

  return (
    <>
      <CobraLoadingScreen isLoading={loading} />
      <div className="min-h-screen cobra-snake-bg">
      {/* Carátula full-screen minimalista */}
      <header className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
        
        {/* Contenido centrado */}
        <div className="relative z-10 text-center px-4 sm:px-6">
          {/* Logo */}
          <div className="mb-1 sm:mb-5">
            <img
              src="/Logo cobra NEGRO.png"
              alt="Logo Cobra Negro"
              className="h-60 sm:h-40 lg:h-48 w-auto object-contain mx-auto opacity-90"
            />
          </div>

          {/* Año */}
          <p
            className="text-sm sm:text-base tracking-tighter text-gray-300 mb-22 sm:mb-8 podium-text"
            style={{ letterSpacing: "-1px" }}
          >
            Since 2020
          </p>

          {/* Sección de chefs */}
          <div className="mb-6 sm:mb-8">
            <h2
              className="bebas-title font-bold"
              style={{ color: "#231F20", letterSpacing: "-1px", fontSize: "20px" }}
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
        </div>

        {/* Indicador de scroll estilo grafiti */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="graffiti-arrow-container">
            <span className="text-sm tracking-wide podium-text text-amber-400/80 font-bold">VER MENÚ</span>
            <div className="graffiti-arrow-down"></div>
          </div>
        </div>
        </header>

      {/* Contenido del menú */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">

        <div className="sticky top-0 z-50 mobile-tabs mb-6 lg:hidden">
          <div className="flex overflow-x-auto category-scroll-container">
            {[
              { key: "parrilla", label: "PARRILLA" },
              { key: "tapeo", label: "TAPEO" },
              { key: "principales", label: "PRINCIPALES" },
              { key: "sandwicheria", label: "PANES" },
              { key: "cafeteria", label: "CAFÉ" },
              { key: "bebidas", label: "BEBIDAS" },
              { key: "tragos", label: "TRAGOS" },
              { key: "vinos", label: "VINOS" },
              { key: "promociones", label: "PROMOS" },
              ...customCategoryNames.map(cat => ({ key: cat, label: cat.toUpperCase() }))
            ].map((tab) => (
              <button
                key={tab.key}
                data-tab={tab.key}
                onClick={() => scrollToSection(tab.key)}
                className={`flex-shrink-0 bebas-title-category-bar category-button ${
                  activeTab === tab.key ? "active" : ""
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid-pattern">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
            {/* Left Column */}
            <div>
              <div ref={sectionRefs.parrilla} data-section-id="parrilla">
                <MenuSection 
                  title={categories.parrilla?.name || "PARRILLA"}
                  description={categories.parrilla?.description}
                >
                  {parrilla?.map((item, index) => (
                    <MenuItemComponent key={item.id || index} item={item} />
                  ))}
                  
                  {/* Renderizar subcategorías dinámicamente */}
                  {renderSubcategoriesInCategory("parrilla")}
                </MenuSection>
              </div>

              <div ref={sectionRefs.tapeo} data-section-id="tapeo">
                <MenuSection 
                  title={categories.tapeo?.name || "TAPEO"}
                  description={categories.tapeo?.description}
                >
                  {tapeo?.map((item, index) => (
                    <MenuItemComponent key={item.id || index} item={item} />
                  ))}
                </MenuSection>
              </div>

              <div ref={sectionRefs.principales} data-section-id="principales">
                <MenuSection 
                  title={categories.principales?.name || "PRINCIPALES"}
                  description={categories.principales?.description}
                >
                  {/* Renderizar subcategorías dinámicamente */}
                  {renderSubcategoriesInCategory("principales")}
                </MenuSection>
              </div>
            </div>

            {/* Center Column */}
            <div>
              <div ref={sectionRefs.sandwicheria} data-section-id="sandwicheria">
                <MenuSection 
                  title={categories.sandwicheria?.name || "SANDWICHERIA Y PANES"}
                  description={categories.sandwicheria?.description}
                >
                  {sandwicheria?.map((item, index) => (
                    <MenuItemComponent key={item.id || index} item={item} />
                  ))}
                </MenuSection>
              </div>

              <div ref={sectionRefs.cafeteria} data-section-id="cafeteria">
                <MenuSection 
                  title={categories.cafeteria?.name || "CAFETERIA"}
                  description={categories.cafeteria?.description}
                >
                  {cafeteria?.map((item, index) => (
                    <MenuItemComponent key={item.id || index} item={item} />
                  ))}
                  
                  <h3 className="bebas-title text-xl sm:text-2xl mb-3 sm:mb-4 text-gray-light mt-8">PASTELERIA</h3>
                  {pasteleria?.map((item, index) => (
                    <MenuItemComponent key={item.id || index} item={item} />
                  ))}
                </MenuSection>
              </div>

              <div ref={sectionRefs.postres} data-section-id="postres">
                <MenuSection 
                  title={categories.postres?.name || "POSTRES"}
                  description={categories.postres?.description}
                >
                  {postres?.map((item, index) => (
                    <MenuItemComponent key={item.id || index} item={item} />
                  ))}
                </MenuSection>
              </div>

              <div ref={sectionRefs.bebidas} data-section-id="bebidas">
                <MenuSection 
                  title={categories.bebidas?.name || "BEBIDAS SIN ALCOHOL"}
                  description={categories.bebidas?.description}
                >
                  {bebidasSinAlcohol?.map((item, index) => (
                    <MenuItemComponent key={item.id || index} item={item} />
                  ))}
                  
                  <h3 className="bebas-title text-xl sm:text-2xl mb-3 sm:mb-4 text-gray-light mt-8">CERVEZAS</h3>
                  {cervezas?.map((item, index) => (
                    <MenuItemComponent key={item.id || index} item={item} />
                  ))}
                </MenuSection>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div ref={sectionRefs.tragos} data-section-id="tragos">
                <MenuSection 
                  title={categories.tragos?.name || "TRAGOS"}
                  description={categories.tragos?.description}
                >
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
                  
                  <SubcategorySection title="TRAGOS CON RED BULL">
                    <div className="space-y-2 sm:space-y-3">
                      {tragosRedBull?.map((drink, index) => (
                        <DrinkItemComponent key={drink.id || index} item={drink} />
                      ))}
                    </div>
                  </SubcategorySection>
                </MenuSection>
              </div>

              <div ref={sectionRefs.vinos} data-section-id="vinos">
                <MenuSection 
                  title={categories.vinos?.name || "VINOS"}
                  description={categories.vinos?.description}
                >
                  <div className="space-y-6 sm:space-y-8">
                    <div>
                      <h3 className="bebas-title text-xl sm:text-2xl mb-3 sm:mb-4 text-gray-light">TINTOS</h3>
                      {vinos?.tintos?.map((vino, index) => (
                        <MenuItemComponent key={vino.id || index} item={{...vino, description: ''}} />
                      ))}
                    </div>
                    <div>
                      <h3 className="bebas-title text-xl sm:text-2xl mb-3 sm:mb-4 text-gray-light">BLANCOS</h3>
                      {vinos?.blancos?.map((vino, index) => (
                        <MenuItemComponent key={vino.id || index} item={{...vino, description: ''}} />
                      ))}
                    </div>
                    <div>
                      <h3 className="bebas-title text-xl sm:text-2xl mb-3 sm:mb-4 text-gray-light">ROSADOS</h3>
                      {vinos?.rosados?.map((vino, index) => (
                        <MenuItemComponent key={vino.id || index} item={{...vino, description: ''}} />
                      ))}
                    </div>
                    <div>
                      <h3 className="bebas-title text-xl sm:text-2xl mb-3 sm:mb-4 text-gray-light">COPAS DE VINO</h3>
                      {vinos?.copas?.map((vino, index) => (
                        <MenuItemComponent key={vino.id || index} item={{...vino, description: ''}} />
                      ))}
                    </div>
                  </div>
                </MenuSection>
              </div>

              <MenuSection title="BOTELLAS" description="10% de descuento de 20 a 23hs">
                <div className="space-y-2 sm:space-y-3">
                  {botellas?.map((drink, index) => (
                    <MenuItemComponent key={drink.id || index} item={{...drink, description: ''}} />
                  ))}
                </div>
              </MenuSection>

              <div ref={sectionRefs.promociones} data-section-id="promociones">
                <MenuSection 
                  title={categories.promociones?.name || "PROMOCIONES ESPECIALES"}
                  description={categories.promociones?.description}
                >
                  {/* Renderizar subcategorías dinámicamente */}
                  {renderSubcategoriesInCategory("promociones")}
                </MenuSection>
              </div>

              {/* Categorías personalizadas dinámicas */}
              {customCategoryNames.map((categoryName) => (
                <div key={categoryName} className="mt-8 sm:mt-10 lg:mt-12" data-category={categoryName}>
                  <MenuSection title={categoryName.toUpperCase()}>
                    {renderSubcategoriesInCategory(categoryName)}
                  </MenuSection>
                </div>
              ))}

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

        <footer className="text-center mt-16 sm:mt-20 lg:mt-24 pt-8 sm:pt-10 lg:pt-12 border-t border-gray-800">
          <div className="mb-6">
            <p className="text-sm sm:text-base text-gray-light podium-text">
              <span className="bebas-title text-gold text-lg">COBRA BAR</span> - COPYRIGHT © 2025 TODOS LOS DERECHOS RESERVADOS
            </p>
            </div>
          
          {/* Crédito del desarrollador */}
          <div className="flex justify-center">
            <a 
              href="https://akdmiastudio.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-gray-600 hover:text-amber-400 transition-colors duration-300 podium-text border-b border-gray-700 hover:border-amber-400 pb-1"
            >
              Hecho por AKDMIA Studio y Livv Studio
            </a>
          </div>
        </footer>
      </div>
    </div>
    </>
  )
}
