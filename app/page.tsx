"use client"

import { useRef } from "react"

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
          COBRA BAR
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

const MenuSection = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <section className="neon-category-container">
    <div className="flex items-center gap-4 mb-3 sm:mb-4">
      <div className="geometric-accent"></div>
      <h2 className="bebas-title text-2xl sm:text-3xl lg:text-4xl text-white !text-white">{title}</h2>
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
  <div className="menu-item-hover p-4 sm:p-5 lg:p-6 mb-4 sm:mb-5 lg:mb-6 relative">
    <div className="industrial-line"></div>
    <div className="flex justify-between items-start mb-2 sm:mb-3">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <h3 className="text-lg sm:text-xl truncate text-white bebas-title">{item.name}</h3>
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
      <p className="text-sm sm:text-base leading-relaxed text-gray-light podium-soft lowercase">
        {item.description.toLowerCase()}
      </p>
    )}
  </div>
)

const SubcategorySection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="neon-subcategory-container">
    <h3 className="bebas-title text-xl sm:text-2xl mb-3 sm:mb-4 text-gray-light">{title}</h3>
    <div className="neon-subcategory-divider"></div>
    {children}
  </div>
)

const DrinkItemComponent = ({ item }: { item: DrinkItem }) => (
  <div className="menu-item-hover p-4 sm:p-5 lg:p-6 mb-4 sm:mb-5 lg:mb-6 relative">
    <div className="industrial-line"></div>
    <div className="flex justify-between items-start mb-2 sm:mb-3">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <h3 className="text-lg sm:text-xl truncate text-white bebas-title">{item.name}</h3>
      </div>
      <span className="text-lg sm:text-xl flex-shrink-0 ml-2 text-coral bebas-title">${item.price}</span>
    </div>
    {item.description && (
      <p className="text-sm sm:text-base leading-relaxed text-gray-light podium-soft lowercase">
        {item.description.toLowerCase()}
      </p>
    )}
    {item.ingredients && (
      <p className="text-xs sm:text-sm mb-2 text-gray-light podium-text">
        <span className="text-gold font-semibold">Ingredientes:</span> {item.ingredients}
      </p>
    )}
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-xs sm:text-sm text-gray-light podium-text">
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
  
  if (loading || subcategoryLoading) {
    return (
      <div className="min-h-screen cobra-snake-bg flex items-center justify-center">
        <div className="text-center flex flex-col items-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            {/* Logo en escala de grises como fondo */}
            <img
              src="/Logo cobra sf.png"
              alt="Logo Cobra"
              className="absolute inset-0 w-full h-full object-contain opacity-30"
              style={{ filter: "grayscale(1)" }}
              draggable={false}
            />
            {/* Logo blanco encima, con animación de "llenado" vertical */}
            <img
              src="/Logo cobra sf.png"
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
            {/* Barra de progreso animada debajo del logo */}
            <div className="absolute left-0 right-0 bottom-[-18px] flex justify-center">
              <div className="h-2 w-24 rounded-full overflow-hidden bg-gray-700/40">
                <div className="h-full bg-gold animate-progress-bar" />
              </div>
            </div>
            <style jsx global>{`
              @keyframes logo-fill {
                0% {
                  clip-path: inset(100% 0 0 0);
                  opacity: 1;
                }
                80% {
                  opacity: 1;
                }
                100% {
                  clip-path: inset(0 0 0 0);
                  opacity: 1;
                }
              }
              .animate-logo-fill {
                animation: logo-fill 2.2s cubic-bezier(0.4,0,0.2,1) forwards;
                will-change: clip-path;
              }
              @keyframes progress-bar {
                0% { transform: translateX(-100%); }
                60% { transform: translateX(10%); }
                100% { transform: translateX(0); }
              }
              .animate-progress-bar {
                animation: progress-bar 2.2s cubic-bezier(0.4,0,0.2,1) infinite alternate;
                will-change: transform;
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
            activeButton.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "center"
            })
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
          <div className="mb-8 sm:mb-12">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cobra_NoBackground-trwzeFIXzdmEuvngiprrcuYD24nRsU.png"
              alt="Cobra Logo"
              className="h-32 sm:h-40 lg:h-48 w-auto object-contain mx-auto opacity-90"
            />
          </div>

          {/* Título principal */}
          <h1 className="bebas-title text-5xl sm:text-6xl lg:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 mb-4 sm:mb-6">
            COBRA BAR
          </h1>

          {/* Año */}
          <p className="text-2xl sm:text-3xl tracking-[0.3em] text-gray-300 mb-8 sm:mb-12 podium-text">
            2025
          </p>

          {/* Sección de chefs */}
          <div className="mb-16 sm:mb-20">
            <h2 className="bebas-title text-xl sm:text-2xl text-white/80 mb-3">
              Chefs:
            </h2>
            <div className="space-y-1 mb-6">
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

        <div className="sticky top-0 z-50 mobile-tabs mb-8 lg:hidden">
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
                className={`flex-shrink-0 text-xs bebas-title category-button ${
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
              <div ref={sectionRefs.parrilla}>
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

              <div ref={sectionRefs.tapeo}>
                <MenuSection 
                  title={categories.tapeo?.name || "TAPEO"}
                  description={categories.tapeo?.description}
                >
                  {tapeo?.map((item, index) => (
                    <MenuItemComponent key={item.id || index} item={item} />
                  ))}
                </MenuSection>
              </div>

              <div ref={sectionRefs.principales}>
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
              <div ref={sectionRefs.sandwicheria}>
                <MenuSection 
                  title={categories.sandwicheria?.name || "SANDWICHERIA Y PANES"}
                  description={categories.sandwicheria?.description}
                >
                  {sandwicheria?.map((item, index) => (
                    <MenuItemComponent key={item.id || index} item={item} />
                  ))}
                </MenuSection>
              </div>

              <div ref={sectionRefs.cafeteria}>
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

              <div ref={sectionRefs.postres}>
                <MenuSection 
                  title={categories.postres?.name || "POSTRES"}
                  description={categories.postres?.description}
                >
                  {postres?.map((item, index) => (
                    <MenuItemComponent key={item.id || index} item={item} />
                  ))}
                </MenuSection>
              </div>

              <div ref={sectionRefs.bebidas}>
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
              <div ref={sectionRefs.tragos}>
                <MenuSection 
                  title={categories.tragos?.name || "TRAGOS CLÁSICOS"}
                  description={categories.tragos?.description}
                >
                  <div className="space-y-2 sm:space-y-3">
                    {tragosClasicos?.map((drink, index) => (
                      <DrinkItemComponent key={drink.id || index} item={drink} />
                    ))}
                  </div>
                  
                  <h3 className="bebas-title text-xl sm:text-2xl mb-3 sm:mb-4 text-gray-light mt-8">TRAGOS ESPECIALES</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {tragosEspeciales?.map((drink, index) => (
                      <DrinkItemComponent key={drink.id || index} item={drink} />
                    ))}
                  </div>
                  
                  <h3 className="bebas-title text-xl sm:text-2xl mb-3 sm:mb-4 text-gray-light mt-8">TRAGOS CON RED BULL</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {tragosRedBull?.map((drink, index) => (
                      <DrinkItemComponent key={drink.id || index} item={drink} />
                    ))}
                  </div>
                </MenuSection>
              </div>

              <div ref={sectionRefs.vinos}>
                <MenuSection 
                  title={categories.vinos?.name || "VINOS"}
                  description={categories.vinos?.description}
                >
                  <div className="space-y-6 sm:space-y-8">
                    <div>
                      <h3 className="bebas-title text-xl sm:text-2xl mb-3 sm:mb-4 text-gray-light">TINTOS</h3>
                      {vinos?.tintos?.map((vino, index) => (
                        <MenuItemComponent key={vino.id || index} item={vino} />
                      ))}
                    </div>
                    <div>
                      <h3 className="bebas-title text-xl sm:text-2xl mb-3 sm:mb-4 text-gray-light">BLANCOS</h3>
                      {vinos?.blancos?.map((vino, index) => (
                        <MenuItemComponent key={vino.id || index} item={vino} />
                      ))}
                    </div>
                    <div>
                      <h3 className="bebas-title text-xl sm:text-2xl mb-3 sm:mb-4 text-gray-light">ROSADOS</h3>
                      {vinos?.rosados?.map((vino, index) => (
                        <MenuItemComponent key={vino.id || index} item={vino} />
                      ))}
                    </div>
                    <div>
                      <h3 className="bebas-title text-xl sm:text-2xl mb-3 sm:mb-4 text-gray-light">COPAS DE VINO</h3>
                      {vinos?.copas?.map((vino, index) => (
                        <MenuItemComponent key={vino.id || index} item={vino} />
                      ))}
                    </div>
                  </div>
                </MenuSection>
              </div>

              <MenuSection title="BOTELLAS" description="10% de descuento de 20 a 23hs">
                <div className="space-y-2 sm:space-y-3">
                  {botellas?.map((drink, index) => (
                    <MenuItemComponent key={drink.id || index} item={drink} />
                  ))}
                </div>
              </MenuSection>

              <div ref={sectionRefs.promociones}>
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
                <h3 className="bebas-title text-2xl sm:text-3xl mb-2 sm:mb-3 text-white !text-white">
                  COBRA BAR
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-sm sm:text-base mb-4 sm:mb-6 text-gray-light podium-text">
                    <span className="bebas-title text-gold text-lg"></span> Avisar en caja para tomar extremos cuidados en su preparación
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-light">
                    <div className="flex items-center justify-center gap-2">
                      <Leaf className="w-3 h-3 sm:w-4 sm:h-4 text-green" />
                      <span className="podium-text">Vegano</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Wheat className="w-3 h-3 sm:w-4 sm:h-4 text-gold" />
                      <span className="podium-text">Sin TACC</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-coral" />
                      <span className="podium-text">Picante</span>
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
