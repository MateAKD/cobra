"use client"

import React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Category {
  id: string
  name: string
  isStandard: boolean
}

interface SortableCategoryItemProps {
  category: Category
}

function SortableCategoryItem({ category }: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 p-3 rounded-lg border transition-all duration-200
        bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800
        ${isDragging ? 'shadow-lg bg-gray-100 border-gray-400' : ''}
      `}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
      >
        <GripVertical size={16} />
      </div>
      <span className="flex-1 text-sm font-medium text-gray-800">
        {category.name}
      </span>
      {!category.isStandard && (
        <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded font-medium">
          Personalizada
        </span>
      )}
    </div>
  )
}

interface CategoryDragDropProps {
  categories: Category[]
  onCategoriesReorder: (categories: Category[]) => void
}

export default function CategoryDragDrop({
  categories,
  onCategoriesReorder,
}: CategoryDragDropProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((category) => category.id === active.id)
      const newIndex = categories.findIndex((category) => category.id === over.id)

      const reorderedCategories = arrayMove(categories, oldIndex, newIndex)
      onCategoriesReorder(reorderedCategories)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-black mb-2">Reordenar Categorías</h3>
        <p className="text-sm text-gray-600">
          Arrastra las categorías usando el icono ⋮⋮ para cambiar su orden
        </p>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map(cat => cat.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {categories.map((category) => (
              <SortableCategoryItem
                key={category.id}
                category={category}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
