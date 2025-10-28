"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package, AlertCircle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { finishShowcase, type ShowcaseReturn, type ShowcaseWithDetails } from "@/lib/showcase-api"
import { formatCurrency } from "@/lib/currency"

interface FinishShowcaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mostruario: ShowcaseWithDetails
  onFinished?: () => void
  onOpenSaleDialog?: () => void
}

interface ProductReturn {
  product_id: number
  product_name: string
  product_code: string
  sent_quantity: number
  returned_quantity: number
  max_return: number
}

export function FinishShowcaseDialog({ open, onOpenChange, mostruario, onFinished, onOpenSaleDialog }: FinishShowcaseDialogProps) {
  const [productReturns, setProductReturns] = useState<ProductReturn[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Inicializar produtos quando o modal abrir
  useEffect(() => {
    if (open && mostruario.movements) {
      const returns: ProductReturn[] = mostruario.movements.map(movement => ({
        product_id: movement.jewelry?.id ? Number(movement.jewelry.id) : 0,
        product_name: movement.jewelry?.name || 'Produto desconhecido',
        product_code: movement.jewelry?.code || 'N/A',
        sent_quantity: Math.abs(movement.quantity),
        returned_quantity: Math.abs(movement.quantity), // Por padrão, tudo retorna
        max_return: Math.abs(movement.quantity)
      }))
      setProductReturns(returns)
    }
  }, [open, mostruario])

  const handleReturnQuantityChange = (productId: number, value: string) => {
    const numValue = parseInt(value) || 0
    setProductReturns(prev =>
      prev.map(p =>
        p.product_id === productId
          ? { ...p, returned_quantity: Math.min(Math.max(0, numValue), p.max_return) }
          : p
      )
    )
  }

  const handleFinish = async () => {
    try {
      setIsLoading(true)

      // Preparar dados dos retornos
      const returns: ShowcaseReturn[] = productReturns.map(p => ({
        product_id: p.product_id,
        returned_quantity: p.returned_quantity
      }))

      // Chamar API para finalizar mostruário
      await finishShowcase(mostruario.id, returns)

      toast({
        title: "Mostruário finalizado",
        description: `O mostruário ${mostruario.code} foi finalizado com sucesso.`,
        variant: "default",
      })

      // Verificar se há produtos não retornados (vendidos)
      const totalNotReturned = productReturns.reduce((sum, p) => sum + (p.sent_quantity - p.returned_quantity), 0)
      
      onOpenChange(false)
      
      // Chamar callback para atualizar lista
      if (onFinished) {
        await onFinished()
      }

      // Abrir modal de registro de venda se houver produtos vendidos
      if (totalNotReturned > 0 && onOpenSaleDialog) {
        // Delay maior para garantir que a lista foi atualizada
        setTimeout(() => {
          onOpenSaleDialog()
        }, 500)
      } else if (totalNotReturned === 0) {
        toast({
          title: "Todos os produtos retornados",
          description: "Todos os produtos foram devolvidos. Não há vendas para registrar.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error('Erro ao finalizar mostruário:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível finalizar o mostruário.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const totalReturned = productReturns.reduce((sum, p) => sum + p.returned_quantity, 0)
  const totalSent = productReturns.reduce((sum, p) => sum + p.sent_quantity, 0)
  const totalNotReturned = totalSent - totalReturned

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Package className="w-5 h-5" />
            Finalizar Mostruário
          </DialogTitle>
          <DialogDescription className="font-body">
            Registre as quantidades de cada produto que retornaram do mostruário <strong>{mostruario.code}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações do Mostruário */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-body text-muted-foreground">Distribuidor:</span>
              <span className="text-sm font-heading text-foreground">{mostruario.distributor_profile?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-body text-muted-foreground">Data de Envio:</span>
              <span className="text-sm font-heading text-foreground">
                {new Date(mostruario.created_at).toLocaleDateString('es-PY')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-body text-muted-foreground">Total Enviado:</span>
              <span className="text-sm font-heading text-foreground">{totalSent} piezas</span>
            </div>
          </div>

          {/* Alerta */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-body text-blue-800">
                Informe a quantidade de cada produto que retornou. Produtos não retornados permanecem com o distribuidor.
              </p>
            </div>
          </div>

          {/* Lista de Produtos */}
          <div className="space-y-3">
            <h4 className="font-heading text-foreground">Produtos do Mostruário:</h4>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {productReturns.map((product) => (
                <div key={product.product_id} className="p-4 border border-border rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-heading text-foreground">{product.product_name}</h5>
                      <p className="text-sm text-muted-foreground font-body">Código: {product.product_code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground font-body">Enviado</p>
                      <p className="text-lg font-heading text-foreground">{product.sent_quantity}x</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`return-${product.product_id}`} className="font-body">
                      Cantidad Retornada
                    </Label>
                    <Input
                      id={`return-${product.product_id}`}
                      type="number"
                      min="0"
                      max={product.max_return}
                      value={product.returned_quantity}
                      onChange={(e) => handleReturnQuantityChange(product.product_id, e.target.value)}
                      className="font-body"
                    />
                    {product.returned_quantity < product.sent_quantity && (
                      <p className="text-xs text-amber-600 font-body">
                        {product.sent_quantity - product.returned_quantity} pieza(s) quedará(n) con el distribuidor
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-body text-foreground">Total Retornado:</span>
              <span className="text-lg font-heading text-primary">{totalReturned} piezas</span>
            </div>
            {totalNotReturned > 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-primary/20">
                <span className="font-body text-muted-foreground">Permanece con distribuidor:</span>
                <span className="font-heading text-amber-600">{totalNotReturned} piezas</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="font-body"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleFinish}
            disabled={isLoading}
            className="gap-2 font-body"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Finalizando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Finalizar Mostruário
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
