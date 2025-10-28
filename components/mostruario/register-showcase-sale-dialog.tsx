"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, Percent, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createShowcaseSale } from "@/lib/sales-api"
import { formatCurrency } from "@/lib/currency"
import type { ShowcaseWithDetails } from "@/lib/showcase-api"

interface RegisterShowcaseSaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mostruario: ShowcaseWithDetails
  onSaleRegistered?: () => void
}

interface ProductSale {
  product_id: number
  product_name: string
  product_code: string
  sold_quantity: number
  unit_price: number
  commission_percentage: number
  commission_value: number
  total_value: number
}

export function RegisterShowcaseSaleDialog({ 
  open, 
  onOpenChange, 
  mostruario, 
  onSaleRegistered 
}: RegisterShowcaseSaleDialogProps) {
  const [productSales, setProductSales] = useState<ProductSale[]>([])
  const [globalCommission, setGlobalCommission] = useState(10)
  const [useGlobalCommission, setUseGlobalCommission] = useState(true)
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Inicializar produtos vendidos quando o modal abrir
  useEffect(() => {
    if (open && mostruario.movements && mostruario.showcase_returns) {
      // Filtrar apenas movimentos de saída (envios)
      const outgoingMovements = mostruario.movements.filter(m => m.quantity < 0)
      
      const sales: ProductSale[] = outgoingMovements
        .map(movement => {
          const productId = movement.jewelry?.id ? Number(movement.jewelry.id) : 0
          const sentQty = Math.abs(movement.quantity)
          
          // Buscar quantidade retornada
          const returnData = mostruario.showcase_returns?.find(
            ret => ret.product_id === productId
          )
          const returnedQty = returnData?.returned_quantity || 0
          const soldQty = sentQty - returnedQty
          
          // Só incluir produtos que foram vendidos (não retornados totalmente)
          if (soldQty <= 0) return null
          
          const unitPrice = Number(movement.jewelry?.selling_price || movement.jewelry?.cost_price || 0)
          const totalValue = soldQty * unitPrice
          const commissionValue = (totalValue * globalCommission) / 100
          
          return {
            product_id: productId,
            product_name: movement.jewelry?.name || 'Produto desconhecido',
            product_code: movement.jewelry?.code || 'N/A',
            sold_quantity: soldQty,
            unit_price: unitPrice,
            commission_percentage: globalCommission,
            commission_value: commissionValue,
            total_value: totalValue
          }
        })
        .filter((sale): sale is ProductSale => sale !== null)
      
      setProductSales(sales)
      setDescription(`Venda do mostruário ${mostruario.code} - ${mostruario.distributor_profile?.name}`)
    }
  }, [open, mostruario, globalCommission])

  // Atualizar comissões quando mudar modo global
  useEffect(() => {
    if (useGlobalCommission) {
      setProductSales(prev => prev.map(p => {
        const commissionValue = (p.total_value * globalCommission) / 100
        return {
          ...p,
          commission_percentage: globalCommission,
          commission_value: commissionValue
        }
      }))
    }
  }, [useGlobalCommission, globalCommission])

  const handleGlobalCommissionChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    const clampedValue = Math.min(Math.max(0, numValue), 100)
    setGlobalCommission(clampedValue)
  }

  const handleProductCommissionChange = (productId: number, value: string) => {
    const numValue = parseFloat(value) || 0
    const clampedValue = Math.min(Math.max(0, numValue), 100)
    
    setProductSales(prev =>
      prev.map(p => {
        if (p.product_id === productId) {
          const commissionValue = (p.total_value * clampedValue) / 100
          return {
            ...p,
            commission_percentage: clampedValue,
            commission_value: commissionValue
          }
        }
        return p
      })
    )
  }

  const handleRegisterSale = async () => {
    try {
      setIsLoading(true)

      // Verificar se já tem venda registrada
      if (mostruario.has_sale) {
        toast({
          title: "Venda já registrada",
          description: "Este mostruário já possui uma venda registrada. Não é possível criar venda duplicada.",
          variant: "destructive",
        })
        return
      }

      if (productSales.length === 0) {
        toast({
          title: "Nenhum produto vendido",
          description: "Não há produtos para registrar a venda.",
          variant: "destructive",
        })
        return
      }

      // Preparar dados da venda
      const saleData = {
        showcase_id: mostruario.id,
        profile_id: mostruario.profile_id,
        description: description,
        products: productSales.map(p => ({
          product_id: p.product_id,
          quantity: p.sold_quantity,
          sold_price: p.unit_price,
          commission_percentage: p.commission_percentage
        }))
      }

      // Criar venda
      await createShowcaseSale(saleData)

      toast({
        title: "Venda registrada",
        description: `A venda do mostruário ${mostruario.code} foi registrada com sucesso.`,
        variant: "default",
      })

      onOpenChange(false)
      
      if (onSaleRegistered) {
        onSaleRegistered()
      }
    } catch (error) {
      console.error('Erro ao registrar venda:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível registrar a venda.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const totalSale = productSales.reduce((sum, p) => sum + p.total_value, 0)
  const totalCommission = productSales.reduce((sum, p) => sum + p.commission_value, 0)
  const totalProducts = productSales.reduce((sum, p) => sum + p.sold_quantity, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Registrar Venta del Muestrario
          </DialogTitle>
          <DialogDescription className="font-body">
            Configure las comisiones y registre la venta del mostruário <strong>{mostruario.code}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Alerta se venda já registrada */}
          {mostruario.has_sale && (
            <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-heading text-red-800 mb-1">Venta ya registrada</p>
                <p className="text-xs font-body text-red-700">
                  Este muestrario ya tiene una venta registrada. No es posible crear ventas duplicadas.
                </p>
              </div>
            </div>
          )}

          {/* Informações do Mostruário */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-body text-muted-foreground">Distribuidor:</span>
              <span className="text-sm font-heading text-foreground">{mostruario.distributor_profile?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-body text-muted-foreground">Código:</span>
              <span className="text-sm font-heading text-foreground">{mostruario.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-body text-muted-foreground">Productos Vendidos:</span>
              <span className="text-sm font-heading text-foreground">{totalProducts} piezas</span>
            </div>
          </div>

          {/* Controle de Comissão Global */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="global-commission-toggle" className="font-body text-blue-900">
                  Comisión Global para todos los productos
                </Label>
                <p className="text-xs text-blue-700 font-body mt-1">
                  Active para aplicar el mismo porcentaje a todos los productos
                </p>
              </div>
              <Switch
                id="global-commission-toggle"
                checked={useGlobalCommission}
                onCheckedChange={setUseGlobalCommission}
              />
            </div>
            
            {useGlobalCommission && (
              <div className="space-y-2">
                <Label htmlFor="global-commission" className="font-body text-blue-900">
                  Porcentaje de Comisión Global (%)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="global-commission"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={globalCommission}
                    onChange={(e) => handleGlobalCommissionChange(e.target.value)}
                    className="font-body"
                  />
                  <Percent className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            )}
          </div>

          {/* Alerta se não houver produtos */}
          {productSales.length === 0 ? (
            <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-body text-amber-800">
                  No hay productos vendidos en este muestrario. Todos los productos fueron devueltos.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Lista de Produtos Vendidos */}
              <div className="space-y-3">
                <h4 className="font-heading text-foreground">Productos Vendidos:</h4>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {productSales.map((product) => (
                    <div key={product.product_id} className="p-4 border border-border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-heading text-foreground">{product.product_name}</h5>
                          <p className="text-sm text-muted-foreground font-body">Código: {product.product_code}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground font-body">Cantidad</p>
                          <p className="text-lg font-heading text-foreground">{product.sold_quantity}x</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground font-body">Precio Unitario</p>
                          <p className="text-sm font-heading text-foreground">{formatCurrency(product.unit_price)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-body">Total</p>
                          <p className="text-sm font-heading text-primary">{formatCurrency(product.total_value)}</p>
                        </div>
                      </div>

                      {/* Comissão Individual */}
                      {!useGlobalCommission && (
                        <div className="space-y-2 pt-2 border-t border-border">
                          <Label htmlFor={`commission-${product.product_id}`} className="font-body flex items-center gap-1">
                            <Percent className="w-3 h-3" />
                            Comisión Individual (%)
                          </Label>
                          <Input
                            id={`commission-${product.product_id}`}
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={product.commission_percentage}
                            onChange={(e) => handleProductCommissionChange(product.product_id, e.target.value)}
                            className="font-body"
                          />
                        </div>
                      )}

                      {/* Valor da Comissão */}
                      <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
                        <span className="text-xs font-body text-green-700">Comisión ({product.commission_percentage}%)</span>
                        <span className="text-sm font-heading text-green-800">{formatCurrency(product.commission_value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description" className="font-body">
                  Descripción (opcional)
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notas adicionales sobre la venta..."
                  className="font-body"
                  rows={3}
                />
              </div>

              {/* Resumo Total */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h4 className="font-heading text-foreground">Resumen de la Venta</h4>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-body text-muted-foreground">Total de Productos:</span>
                    <span className="font-heading text-foreground">{totalProducts} piezas</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body text-muted-foreground">Valor Total de Venta:</span>
                    <span className="text-lg font-heading text-primary">{formatCurrency(totalSale)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-primary/20">
                    <span className="font-body text-green-700">Comisión Total del Distribuidor:</span>
                    <span className="text-lg font-heading text-green-600">{formatCurrency(totalCommission)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
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
            onClick={handleRegisterSale}
            disabled={isLoading || productSales.length === 0 || mostruario.has_sale}
            className="gap-2 font-body"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Registrando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {mostruario.has_sale ? 'Venta ya Registrada' : 'Registrar Venta'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
