"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, Save } from "lucide-react"

interface AddFormProps {
  section: string
  onAdd: (item: any) => void
  onCancel: () => void
}

export default function AddForm({ section, onAdd, onCancel }: AddFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    ingredients: "",
    glass: "",
    technique: "",
    garnish: "",
  })
  const [tags, setTags] = useState<("vegan" | "sin-tacc" | "picante")[]>([])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
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
    
    const newItem: any = {
      id: Date.now().toString(), // ID temporal
      name: formData.name,
      price: formData.price,
    }

    // Agregar campos específicos según la sección
    if (section === "tapas" || section === "panes" || section === "postres" || 
        section === "parrilla" || section === "guarniciones" || section === "tapeo" ||
        section === "milanesas" || section === "hamburguesas" || section === "ensaladas" ||
        section === "otros" || section === "sandwicheria") {
      newItem.description = formData.description
      newItem.tags = tags
    } else if (section === "tragos" || section === "tragosClasicos" || section === "tragosEspeciales" || section === "tragosRedBull") {
      newItem.description = formData.description || undefined
      newItem.ingredients = formData.ingredients || undefined
      newItem.glass = formData.glass || undefined
      newItem.technique = formData.technique || undefined
      newItem.garnish = formData.garnish || undefined
    } else {
      // Para vinos, bebidas sin alcohol, cervezas, botellas, etc.
      newItem.description = formData.description || undefined
    }

    onAdd(newItem)
    
    // Resetear formulario
    setFormData({
      name: "",
      description: "",
      price: "",
      ingredients: "",
      glass: "",
      technique: "",
      garnish: "",
    })
    setTags([])
  }

  const getSectionTitle = () => {
    switch (section) {
      case "tapas":
        return "Agregar Nueva Tapa"
      case "panes":
        return "Agregar Nuevo Pan"
      case "postres":
        return "Agregar Nuevo Postre"
      case "empanadas":
        return "Agregar Nueva Empanada"
      case "tragos":
        return "Agregar Nuevo Trago de Autor"
      case "clasicos":
        return "Agregar Nuevo Trago Clásico"
      case "sinAlcohol":
        return "Agregar Nueva Bebida Sin Alcohol"
      default:
        if (section.startsWith("vinos-")) {
          return "Agregar Nuevo Vino"
        }
        return "Agregar Nuevo Elemento"
    }
  }

  const renderMenuItemForm = () => (
    <>
      <div>
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Nombre del plato"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Descripción *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Descripción del plato"
          rows={3}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="price">Precio *</Label>
        <Input
          id="price"
          value={formData.price}
          onChange={(e) => handleInputChange("price", e.target.value)}
          placeholder="0.000"
          required
        />
      </div>
      
      <div>
        <Label>Etiquetas (opcional)</Label>
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
    </>
  )

  const renderDrinkItemForm = () => (
    <>
      <div>
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Nombre del trago"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Descripción del trago"
          rows={2}
        />
      </div>
      
      <div>
        <Label htmlFor="price">Precio *</Label>
        <Input
          id="price"
          value={formData.price}
          onChange={(e) => handleInputChange("price", e.target.value)}
          placeholder="0.000"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="ingredients">Ingredientes (opcional)</Label>
        <Input
          id="ingredients"
          value={formData.ingredients}
          onChange={(e) => handleInputChange("ingredients", e.target.value)}
          placeholder="Ingredientes del trago"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="glass">Vaso (opcional)</Label>
          <Input
            id="glass"
            value={formData.glass}
            onChange={(e) => handleInputChange("glass", e.target.value)}
            placeholder="Tipo de vaso"
          />
        </div>
        <div>
          <Label htmlFor="technique">Técnica (opcional)</Label>
          <Input
            id="technique"
            value={formData.technique}
            onChange={(e) => handleInputChange("technique", e.target.value)}
            placeholder="Técnica de preparación"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="garnish">Garnish (opcional)</Label>
        <Input
          id="garnish"
          value={formData.garnish}
          onChange={(e) => handleInputChange("garnish", e.target.value)}
          placeholder="Decoración del trago"
        />
      </div>
    </>
  )

  const renderWineItemForm = () => (
    <>
      <div>
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Nombre del vino/bebida"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Descripción del vino/bebida"
          rows={2}
        />
      </div>
      
      <div>
        <Label htmlFor="price">Precio *</Label>
        <Input
          id="price"
          value={formData.price}
          onChange={(e) => handleInputChange("price", e.target.value)}
          placeholder="0.000"
          required
        />
      </div>
    </>
  )

  const renderForm = () => {
    if (section === "tapas" || section === "panes" || section === "postres" ||
        section === "parrilla" || section === "guarniciones" || section === "tapeo" ||
        section === "milanesas" || section === "hamburguesas" || section === "ensaladas" ||
        section === "otros" || section === "sandwicheria" || section === "empanadas") {
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
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {getSectionTitle()}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel} className="bg-black hover:bg-gray-800 text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderForm()}
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="bg-black hover:bg-gray-800 text-white border-black">
              Cancelar
            </Button>
            <Button type="submit" className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white">
              <Save className="w-4 h-4" />
              Agregar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
