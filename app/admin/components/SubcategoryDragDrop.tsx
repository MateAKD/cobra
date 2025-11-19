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

interface Subcategory {
  id: string
  name: string
  itemCount: number
}

interface SortableSubcategoryItemProps {
  subcategory: Subcategory
}

function SortableSubcategoryItem({ subcategory }: SortableSubcategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subcategory.id })

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
        {subcategory.name}
      </span>
      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
        {subcategory.itemCount} {subcategory.itemCount === 1 ? 'producto' : 'productos'}
      </span>
    </div>
  )
}

interface SubcategoryDragDropProps {
  subcategories: Subcategory[]
  onSubcategoriesReorder: (subcategories: Subcategory[]) => void
  categoryName: string
}

export default function SubcategoryDragDrop({
  subcategories,
  onSubcategoriesReorder,
  categoryName,
}: SubcategoryDragDropProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = subcategories.findIndex((subcategory) => subcategory.id === active.id)
      const newIndex = subcategories.findIndex((subcategory) => subcategory.id === over.id)

      const reorderedSubcategories = arrayMove(subcategories, oldIndex, newIndex)
      onSubcategoriesReorder(reorderedSubcategories)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-black mb-2">
          Reordenar Subcategorías: {categoryName}
        </h3>
        <p className="text-sm text-gray-600">
          Arrastra las subcategorías usando el icono ⋮⋮ para cambiar su orden
        </p>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={subcategories.map(sub => sub.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {subcategories.map((subcategory) => (
              <SortableSubcategoryItem
                key={subcategory.id}
                subcategory={subcategory}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

