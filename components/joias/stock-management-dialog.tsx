"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Package } from "lucide-react"
import { createInventoryMovement } from "@/lib/inventory-api"
import { useToast } from "@/hooks/use-toast"
import type { ProductWithDetails } from "@/lib/supabase"

interface StockManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  joia: ProductWithDetails
  onSuccess?: () => void
}

export function StockManagementDialog({ 
  open, 
  onOpenChange, 
  joia, 
  onSuccess 
}: StockManagementDialogProps) {
  const [movementType, setMovementType] = useState<"entrada" | "saida">("entrada")
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const resetForm = () => {
    setMovementType("entrada")
    setQuantity("")
    setReason("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const quantityNumber = parseInt(quantity)
      
      // Validações
      if (quantityNumber <= 0) {
        throw new Error("La cantidad debe ser mayor que cero")
      }

      // Determinar quantidade final baseada no tipo
      const finalQuantity = movementType === "entrada" ? quantityNumber : -quantityNumber

      await createInventoryMovement({
        product_id: Number(joia.id),
        quantity: finalQuantity,
        reason: reason
      })

      toast({
        title: "¡Éxito!",
        description: `${movementType === "entrada" ? "Entrada" : "Salida"} registrada con éxito.`,
      })

      onOpenChange(false)
      resetForm()
      
      if (onSuccess) {
        onSuccess()
      }
      
    } catch (error: any) {
      console.error('Erro ao registrar movimentação:', error)
      toast({
        title: "Error",
        description: error.message || "Error al registrar movimiento. Intente nuevamente.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Package className="w-5 h-5" />
            Gestionar Inventario
          </DialogTitle>
          <DialogDescription className="font-body">
            Registre una entrada o salida de inventario para este producto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações do Produto */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h4 className="font-heading text-sm text-foreground">{joia.name}</h4>
                <p className="text-xs text-muted-foreground font-body">
                  Código: {joia.code}
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  Categoría: {joia.category?.name || 'Sin categoría'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tipo de Movimentação */}
          <div className="space-y-3">
            <Label className="font-body font-medium">Tipo de Movimiento *</Label>
            <RadioGroup
              value={movementType}
              onValueChange={(value: "entrada" | "saida") => setMovementType(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="entrada" id="entrada" />
                <Label htmlFor="entrada" className="font-body flex items-center gap-2 cursor-pointer">
                  <ArrowUp className="w-4 h-4 text-green-600" />
                  Entrada de Inventario
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="saida" id="saida" />
                <Label htmlFor="saida" className="font-body flex items-center gap-2 cursor-pointer">
                  <ArrowDown className="w-4 h-4 text-red-600" />
                  Salida de Inventario
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Quantidade */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="font-body font-medium">
              Cantidad *
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="Ingrese la cantidad"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="font-body"
            />
            <p className="text-xs text-muted-foreground font-body">
              Informe la cantidad de piezas para {movementType === "entrada" ? "entrada" : "salida"}
            </p>
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="font-body font-medium">
              Motivo del Movimiento *
            </Label>
            <Textarea
              id="reason"
              placeholder={`Describa el motivo de la ${movementType}...`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              className="font-body"
            />
            <p className="text-xs text-muted-foreground font-body">
              Ex: Compra de fornecedor, Venda, Perda, Devolução, etc.
            </p>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="font-body"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="font-body"
            >
              {isLoading ? "Registrando..." : `Registrar ${movementType === "entrada" ? "Entrada" : "Salida"}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
