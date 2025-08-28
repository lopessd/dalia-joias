"use client"

import type React from "react"

import { useState } from "react"
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
import { Plus, Minus, Send } from "lucide-react"
import { createInventoryMovement } from "@/lib/inventory-api"
import { useToast } from "@/hooks/use-toast"
import type { ProductWithDetails } from '@/lib/supabase'

interface StockMovementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  joia: ProductWithDetails
  type: "entrada" | "saida" | "envio"
  onSuccess?: () => void // Callback para recarregar dados
}

export function StockMovementDialog({ open, onOpenChange, joia, type, onSuccess }: StockMovementDialogProps) {
  const [quantidade, setQuantidade] = useState("")
  const [motivo, setMotivo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const getTitle = () => {
    switch (type) {
      case "entrada":
        return "Entrada de Estoque"
      case "saida":
        return "Saída de Estoque"
      case "envio":
        return "Envio para Revendedor"
      default:
        return "Movimentação de Estoque"
    }
  }

  const getIcon = () => {
    switch (type) {
      case "entrada":
        return <Plus className="w-4 h-4" />
      case "saida":
        return <Minus className="w-4 h-4" />
      case "envio":
        return <Send className="w-4 h-4" />
      default:
        return null
    }
  }

  const getDescription = () => {
    switch (type) {
      case "entrada":
        return "Adicionar peças ao estoque"
      case "saida":
        return "Remover peças do estoque"
      case "envio":
        return "Enviar peças para revendedor"
      default:
        return "Movimentar estoque"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const quantidadeNum = Number.parseInt(quantidade)
      
      // Determinar quantidade final baseada no tipo
      let quantidadeFinal = quantidadeNum
      if (type === "saida" || type === "envio") {
        quantidadeFinal = -quantidadeNum // Negativo para saídas
      }

      await createInventoryMovement({
        product_id: Number(joia.id),
        quantity: quantidadeFinal,
        reason: motivo
      })

      toast({
        title: "Sucesso",
        description: `${type === 'entrada' ? 'Entrada' : type === 'saida' ? 'Saída' : 'Envio'} registrada com sucesso!`,
      })

      onOpenChange(false)
      setQuantidade("")
      setMotivo("")
      
      // Chamar callback para recarregar dados
      if (onSuccess) {
        onSuccess()
      }
      
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error)
      toast({
        title: "Erro",
        description: "Erro ao registrar movimentação. Tente novamente.",
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
            {getIcon()}
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="font-body">{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-heading text-sm text-foreground mb-2">{joia.name}</h4>
            <p className="text-xs text-muted-foreground font-body">Código: {joia.code}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade" className="font-body">
                Quantidade *
              </Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                placeholder="Digite a quantidade"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                required
                className="font-body"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo" className="font-body">
                Motivo *
              </Label>
              <Textarea
                id="motivo"
                placeholder={`Descreva o motivo da ${type}...`}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                required
                rows={3}
                className="font-body"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="font-body">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="font-body">
                {isLoading ? "Processando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
