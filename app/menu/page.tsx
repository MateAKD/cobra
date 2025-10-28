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

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState("parrilla")
  const { menuData, loading, error } = useMenuData()
  const { categories } = useCategories()
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
        
        // Actualizar si es diferente
        if (activeSection && activeSection !== activeTab) {
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
              }
            }
          }
        }, 150) // Pequeño delay para asegurar que el DOM se actualice
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

  // Función para generar el layout dinámico basado en el orden de las categorías
  const generateDynamicLayout = () => {
    if (!categories || Object.keys(categories).length === 0) {
      return null
    }

    // Convertir categorías a array y ordenar por 'order'
    const sortedCategories = Object.entries(categories)
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
          const category = categories[categoryId]
          if (!category) return null

          return (
            <div key={categoryId} ref={sectionRefs[categoryId as keyof typeof sectionRefs]} data-category={categoryId}>
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
        return (
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
              <h3 className="bebas-title text-xl sm:text-2xl mb-3 sm:mb-4 text-gray-light">BOTELLAS</h3>
              {botellas?.map((item, index) => (
                <MenuItemComponent key={item.id || index} item={{...item, description: ''}} />
              ))}
            </div>
          </div>
        )
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
    
    // Obtener productos directos de la categoría principal
    const categoryData = (customCategories as any)[categoryName]
    const directProducts = categoryData && Array.isArray(categoryData) ? categoryData : []
    
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

      const scrollToSection = (sectionKey: string) => {
      setActiveTab(sectionKey)
      
      // Pequeño delay para asegurar que el estado se actualice
      setTimeout(() => {
        // Primero intentar con las referencias existentes
        if (sectionKey in sectionRefs) {
          const element = sectionRefs[sectionKey as keyof typeof sectionRefs]?.current
          if (element) {
            element.scrollIntoView({ 
              behavior: "smooth", 
              block: "start",
              inline: "nearest"
            })
            return
          }
        }
        
        // Si no hay referencia, buscar por data-category (para todas las categorías)
        const section = document.querySelector(`[data-category="${sectionKey}"]`)
        if (section) {
          section.scrollIntoView({ 
            behavior: "smooth", 
            block: "start",
            inline: "nearest"
          })
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
              }
            }
          }
        }, 300)
      }, 100)
    }

    // Función para encontrar la primera categoría visible y desplazarse a ella
    const scrollToFirstVisibleCategory = () => {
      // Lista de todas las categorías en orden de aparición
      const allCategories = [
        "parrilla",
        "tapeo", 
        "principales",
        "sandwicheria",
        "cafeteria",
        "postres",
        "bebidas",
        "tragos",
        "vinos",
        "promociones",
        ...customCategoryNames
      ]

      // Buscar la primera categoría que tenga contenido visible
      for (const categoryKey of allCategories) {
        let element: HTMLElement | null = null
        
        // Primero intentar con las referencias existentes
        if (categoryKey in sectionRefs) {
          element = sectionRefs[categoryKey as keyof typeof sectionRefs]?.current || null
        }
        
        // Si no hay referencia, buscar por data-category
        if (!element) {
          element = document.querySelector(`[data-category="${categoryKey}"]`) as HTMLElement
        }

        if (element) {
          // Verificar si la categoría tiene contenido visible (no está vacía)
          const hasVisibleContent = element.querySelector('.menu-item-hover') || 
                                   element.querySelector('.neon-subcategory-container') ||
                                   element.querySelector('.bebas-title-subcategory')
          
          if (hasVisibleContent) {
            scrollToSection(categoryKey)
            return
          }
        }
      }
      
      // Si no se encuentra ninguna categoría visible, desplazarse a la primera por defecto
      scrollToSection("parrilla")
    }

  return (
    <>
      <CobraLoadingScreen isLoading={loading} />
      <div className="min-h-screen cobra-snake-bg">
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
              // Generar las categorías del menú deslizable basándose en las categorías reales y su orden
              if (!categories || Object.keys(categories).length === 0) {
                return null
              }

              // Convertir categorías a array y ordenar por 'order'
              const sortedCategories = Object.entries(categories)
                .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0))
                .map(([key, category]) => ({
                  key,
                  label: category.name || key.toUpperCase()
                }))

              return sortedCategories.map((tab) => (
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
              ))
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

        <footer className="mt-16 sm:mt-20 lg:mt-24 pt-8 sm:pt-10 lg:pt-12">
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
                  src="/Logo cobra sf.png" 
                  alt="Cobra Bar Logo" 
                  className="h-12 w-auto logo-no-bg"
                />
              </div>
              <h3 className="bebas-title-category text-2xl sm:text-3xl mb-2" style={{ color: '#FFFFFF' }}>
                COBRA BAR
              </h3>
              <p className="text-sm sm:text-base podium-text" style={{ color: '#FFFFFF' }}>
                Experiencia gastronómica única
              </p>
            </div>
            
            {/* Información de copyright */}
            <div className="mb-6">
              <p className="text-xs sm:text-sm podium-text" style={{ color: '#FFFFFF' }}>
                © 2025 COBRA BAR - TODOS LOS DERECHOS RESERVADOS
              </p>
            </div>
            
            {/* Divisor medio */}
            <div className="flex justify-center mb-6">
              <div className="minimal-divider w-32"></div>
            </div>
            
            {/* Créditos de desarrollo */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
              <p className="text-xs podium-text" style={{ color: '#FFFFFF' }}>
                Desarrollado con ❤️ por
              </p>
              <div className="flex gap-4">
                <a 
                  href="https://akdmiastudio.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs podium-text text-gold hover:text-coral transition-colors duration-300 border-b border-transparent hover:border-gold pb-1"
                >
                  AKDMIA Studio
                </a>
                <span className="text-xs podium-text" style={{ color: '#FFFFFF' }}>•</span>
                <a 
                  href="https://livvvv.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs podium-text text-gold hover:text-coral transition-colors duration-300 border-b border-transparent hover:border-gold pb-1"
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
