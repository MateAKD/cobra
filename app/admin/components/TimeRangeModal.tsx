"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Clock } from "lucide-react"

interface TimeRangeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: TimeRangeData) => void
  categoryName: string
  currentData?: TimeRangeData
}

export interface TimeRangeData {
  timeRestricted: boolean
  startTime?: string
  endTime?: string
}

export default function TimeRangeModal({ 
  isOpen, 
  onClose, 
  onSave, 
  categoryName,
  currentData 
}: TimeRangeModalProps) {
  const [timeRestricted, setTimeRestricted] = useState(currentData?.timeRestricted || false)
  const [startTime, setStartTime] = useState(currentData?.startTime || "")
  const [endTime, setEndTime] = useState(currentData?.endTime || "")
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      setTimeRestricted(currentData?.timeRestricted || false)
      setStartTime(currentData?.startTime || "")
      setEndTime(currentData?.endTime || "")
      setError("")
    }
  }, [isOpen, currentData])

  const handleSave = () => {
    setError("")

    // Si está restringido por tiempo, validar que ambos campos estén completos
    if (timeRestricted) {
      if (!startTime || !endTime) {
        setError("Debes completar ambos horarios")
        return
      }

      // Validar formato de hora (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        setError("Formato de hora inválido. Usa HH:MM (ej: 19:00)")
        return
      }
    }

    onSave({
      timeRestricted,
      startTime: timeRestricted ? startTime : undefined,
      endTime: timeRestricted ? endTime : undefined,
    })

    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Configurar Horario - {categoryName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Switch para activar/desactivar restricción horaria */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="time-restricted" className="text-base">
                Restringir por horario
              </Label>
              <p className="text-sm text-gray-500">
                La categoría solo se mostrará en el horario especificado
              </p>
            </div>
            <Switch
              id="time-restricted"
              checked={timeRestricted}
              onCheckedChange={setTimeRestricted}
            />
          </div>

          {/* Campos de horario (solo si está activada la restricción) */}
          {timeRestricted && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid gap-2">
                <Label htmlFor="start-time">
                  Hora de inicio
                </Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="19:00"
                  className="font-mono"
                />
                <p className="text-xs text-gray-500">
                  La categoría se mostrará a partir de esta hora
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="end-time">
                  Hora de fin
                </Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="23:59"
                  className="font-mono"
                />
                <p className="text-xs text-gray-500">
                  La categoría se ocultará después de esta hora
                </p>
              </div>

              {/* Ejemplo visual del horario */}
              {startTime && endTime && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm font-medium text-blue-900">
                    📅 Esta categoría se mostrará:
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    De {startTime} a {endTime}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Información adicional */}
          {!timeRestricted && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-sm text-gray-600">
                ℹ️ Sin restricción horaria, la categoría se mostrará siempre
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

