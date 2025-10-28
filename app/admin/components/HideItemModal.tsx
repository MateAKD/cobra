"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface HideItemModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string, hiddenBy: string, action: 'hide' | 'show') => void
  itemName: string
  currentStatus: 'visible' | 'hidden'
  loading?: boolean
}

export default function HideItemModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  currentStatus,
  loading = false
}: HideItemModalProps) {
  const [reason, setReason] = useState("")
  const [hiddenBy, setHiddenBy] = useState("")
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: string[] = []

    if (!reason.trim()) {
      newErrors.push("El motivo es obligatorio")
    }
    if (!hiddenBy.trim()) {
      newErrors.push("El nombre de quién realiza la acción es obligatorio")
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    const action = currentStatus === 'visible' ? 'hide' : 'show'
    onConfirm(reason.trim(), hiddenBy.trim(), action)
  }

  const handleClose = () => {
    setReason("")
    setHiddenBy("")
    setErrors([])
    onClose()
  }

  const isHiding = currentStatus === 'visible'
  const actionText = isHiding ? 'Ocultar' : 'Mostrar'
  const icon = isHiding ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            {actionText} Producto
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Producto:</strong> {itemName}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {isHiding 
                ? "Este producto se ocultará del menú público" 
                : "Este producto se mostrará nuevamente en el menú público"
              }
            </p>
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="hiddenBy">
              {isHiding ? 'Ocultado por' : 'Mostrado por'} *
            </Label>
            <Input
              id="hiddenBy"
              value={hiddenBy}
              onChange={(e) => setHiddenBy(e.target.value)}
              placeholder="Nombre del administrador"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Motivo *
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isHiding 
                ? "¿Por qué se oculta este producto? (ej: agotado, temporada, etc.)"
                : "¿Por qué se muestra nuevamente este producto?"
              }
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-black hover:bg-gray-800 text-white border-black"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black hover:bg-gray-800 text-white"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {actionText}...
                </div>
              ) : (
                `${actionText} Producto`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
