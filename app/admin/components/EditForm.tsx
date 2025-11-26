"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Save } from "lucide-react"

interface MenuItem {
  id: string
  name: string
  description: string
  price: string
  tags?: ("vegan" | "sin-tacc" | "picante")[]
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
}

interface WineItem {
  id: string
  name: string
  price: string
}

interface EditFormProps {
  item: MenuItem | DrinkItem | WineItem
  section: string
  onSave: (item: any) => void
  onCancel: () => void
}

export default function EditForm({ item, section, onSave, onCancel }: EditFormProps) {
  const [formData, setFormData] = useState<any>({ ...item })
  const [tags, setTags] = useState<("vegan" | "sin-tacc" | "picante")[]>(
    (item as MenuItem).tags || []
  )

  useEffect(() => {
    setFormData({ ...item })
    if ((item as MenuItem).tags) {
      setTags((item as MenuItem).tags || [])
    }
  }, [item])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTagChange = (tag: "vegan" | "sin-tacc" | "picante", checked: boolean) => {
    if (checked) {
      setTags((prev) => [...prev, tag])
    } else {
      setTags((prev) => prev.filter((t) => t !== tag))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const dataToSave = { ...formData }
    
    // Verificar si es una categoría principal que debe incluir tags
    const mainCategoriesWithTags = ["tapas", "panes", "postres", "parrilla", "guarniciones", "tapeo", 
                                   "milanesas", "hamburguesas", "ensaladas", "otros", "sandwicheria", "empanadas"]
    
    // Verificar si es una subcategoría (no está en las categorías principales estándar)
    const isSubcategory = !mainCategoriesWithTags.includes(section) && 
                         !section.startsWith("vinos-") && 
                         !section.startsWith("promociones-") &&
                         !["tragos", "tragosClasicos", "tragosEspeciales", "tragosRedBull"].includes(section)
    
    // Solo incluir tags si es un MenuItem (categoría principal o subcategoría)
    if (mainCategoriesWithTags.includes(section) || isSubcategory) {
      dataToSave.tags = tags
    }
    
    onSave(dataToSave)
  }

  const renderMenuItemForm = () => (
    <>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Nombre del plato"
          />
        </div>
        
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Descripción del plato"
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            placeholder="0.000"
          />
        </div>
        
        <div>
          <Label>Etiquetas</Label>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="vegan"
                checked={tags.includes("vegan")}
                onCheckedChange={(checked) => handleTagChange("vegan", checked as boolean)}
              />
              <Label htmlFor="vegan" className="text-sm">🌱 Vegano</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sin-tacc"
                checked={tags.includes("sin-tacc")}
                onCheckedChange={(checked) => handleTagChange("sin-tacc", checked as boolean)}
              />
              <Label htmlFor="sin-tacc" className="text-sm">🌾 Sin TACC</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="picante"
                checked={tags.includes("picante")}
                onCheckedChange={(checked) => handleTagChange("picante", checked as boolean)}
              />
              <Label htmlFor="picante" className="text-sm">🔥 Picante</Label>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  const renderDrinkItemForm = () => (
    <>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Nombre del trago"
          />
        </div>
        
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Descripción del trago (opcional)"
            rows={2}
          />
        </div>
        
        <div>
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            placeholder="0.000"
          />
        </div>
        
        <div>
          <Label htmlFor="ingredients">Ingredientes</Label>
          <Input
            id="ingredients"
            value={formData.ingredients || ""}
            onChange={(e) => handleInputChange("ingredients", e.target.value)}
            placeholder="Ingredientes del trago"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="glass">Vaso</Label>
            <Input
              id="glass"
              value={formData.glass || ""}
              onChange={(e) => handleInputChange("glass", e.target.value)}
              placeholder="Tipo de vaso"
            />
          </div>
          <div>
            <Label htmlFor="technique">Técnica</Label>
            <Input
              id="technique"
              value={formData.technique || ""}
              onChange={(e) => handleInputChange("technique", e.target.value)}
              placeholder="Técnica de preparación"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="garnish">Garnish</Label>
          <Input
            id="garnish"
            value={formData.garnish || ""}
            onChange={(e) => handleInputChange("garnish", e.target.value)}
            placeholder="Decoración del trago"
          />
        </div>
      </div>
    </>
  )

  const renderWineItemForm = () => (
    <>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Nombre del vino/bebida"
          />
        </div>
        
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Descripción del vino/bebida"
            rows={2}
          />
        </div>
        
        <div>
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            placeholder="0.000"
          />
        </div>
      </div>
    </>
  )

  const getSectionTitle = () => {
    switch (section) {
      case "tapas":
        return "Editar Tapa"
      case "panes":
        return "Editar Pan"
      case "postres":
        return "Editar Postre"
      case "empanadas":
        return "Editar Empanada"
      case "tragos":
        return "Editar Trago de Autor"
      case "clasicos":
        return "Editar Trago Clásico"
      case "sinAlcohol":
        return "Editar Bebida Sin Alcohol"
      default:
        if (section.startsWith("vinos-")) {
          return "Editar Vino"
        }
        return "Editar Elemento"
    }
  }

  const renderForm = () => {
    // Verificar si es una categoría principal que debe mostrar tags
    const mainCategoriesWithTags = ["tapas", "panes", "postres", "parrilla", "guarniciones", "tapeo", 
                                   "milanesas", "hamburguesas", "ensaladas", "otros", "sandwicheria", "empanadas"]
    
    // Verificar si es una subcategoría (no está en las categorías principales estándar)
    const isSubcategory = !mainCategoriesWithTags.includes(section) && 
                         !section.startsWith("vinos-") && 
                         !section.startsWith("promociones-") &&
                         !["tragos", "tragosClasicos", "tragosEspeciales", "tragosRedBull"].includes(section)
    
    if (mainCategoriesWithTags.includes(section) || isSubcategory) {
      return renderMenuItemForm()
    } else if (section === "tragos" || section === "tragosClasicos" || section === "tragosEspeciales" || section === "tragosRedBull") {
      return renderDrinkItemForm()
    } else {
      return renderWineItemForm()
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{getSectionTitle()}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel} className="bg-black hover:bg-gray-800 text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderForm()}
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="bg-black hover:bg-gray-800 text-white border-black">
              Cancelar
            </Button>
            <Button type="submit" className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white">
              <Save className="w-4 h-4" />
              Guardar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
