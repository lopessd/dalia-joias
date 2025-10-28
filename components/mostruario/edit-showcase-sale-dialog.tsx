"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, Percent, Save, AlertCircle, TrendingUp, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getShowcaseSale, updateShowcaseSale, type ShowcaseSaleDetails } from "@/lib/sales-api"
import { formatCurrency } from "@/lib/currency"
import type { ShowcaseWithDetails } from "@/lib/showcase-api"

interface EditShowcaseSaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mostruario: ShowcaseWithDetails
  onSaleUpdated?: () => void
}

interface ProductSaleEdit {
  sold_product_id: number
  product_id: number
  product_name: string
  product_code: string
  sold_quantity: number
  unit_price: number
  commission_percentage: number
  commission_value: number
  total_value: number
}

export function EditShowcaseSaleDialog({ 
  open, 
  onOpenChange, 
  mostruario, 
  onSaleUpdated 
}: EditShowcaseSaleDialogProps) {
  const [productSales, setProductSales] = useState<ProductSaleEdit[]>([])
  const [globalCommission, setGlobalCommission] = useState(10)
  const [useGlobalCommission, setUseGlobalCommission] = useState(false)
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [saleData, setSaleData] = useState<ShowcaseSaleDetails | null>(null)
  const { toast } = useToast()

  // Carregar dados da venda quando o modal abrir
  useEffect(() => {
    if (open && mostruario.sale_id) {
      loadSaleData()
    }
  }, [open, mostruario.sale_id])

  const loadSaleData = async () => {
    try {
      setIsLoadingData(true)
      const data = await getShowcaseSale(mostruario.sale_id!)
      setSaleData(data)
      setDescription(data.description || "")
      
      // Converter produtos para formato de edição
      const products: ProductSaleEdit[] = data.products.map(p => {
        const totalValue = p.quantity * p.sold_price
        const commissionValue = (totalValue * p.commission_percentage) / 100
        
        return {
          sold_product_id: p.sold_product_id,
          product_id: p.product_id,
          product_name: p.product_name,
          product_code: p.product_code,
          sold_quantity: p.quantity,
          unit_price: p.sold_price,
          commission_percentage: p.commission_percentage,
          commission_value: commissionValue,
          total_value: totalValue
        }
      })
      
      setProductSales(products)
      
      // Verificar se todas as comissões são iguais
      const allSameCommission = products.every(
        p => p.commission_percentage === products[0].commission_percentage
      )
      
      if (allSameCommission) {
        setGlobalCommission(products[0].commission_percentage)
        setUseGlobalCommission(true)
      }
    } catch (error) {
      console.error('Erro ao carregar venda:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da venda.",
        variant: "destructive",
      })
      onOpenChange(false)
    } finally {
      setIsLoadingData(false)
    }
  }

  // Atualizar comissões quando mudar modo global
  useEffect(() => {
    if (useGlobalCommission && productSales.length > 0) {
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

  const handleProductCommissionChange = (soldProductId: number, value: string) => {
    const numValue = parseFloat(value) || 0
    const clampedValue = Math.min(Math.max(0, numValue), 100)
    
    setProductSales(prev =>
      prev.map(p => {
        if (p.sold_product_id === soldProductId) {
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

  const handleUpdateSale = async () => {
    try {
      setIsLoading(true)

      if (!mostruario.sale_id) {
        toast({
          title: "Erro",
          description: "Venda não encontrada.",
          variant: "destructive",
        })
        return
      }

      // Preparar dados para atualização
      const updateData = {
        sale_id: mostruario.sale_id,
        description: description,
        products: productSales.map(p => ({
          sold_product_id: p.sold_product_id,
          commission_percentage: p.commission_percentage
        }))
      }

      // Atualizar venda
      await updateShowcaseSale(updateData)

      toast({
        title: "Venda atualizada",
        description: `A venda do mostruário ${mostruario.code} foi atualizada com sucesso.`,
        variant: "default",
      })

      onOpenChange(false)
      
      if (onSaleUpdated) {
        onSaleUpdated()
      }
    } catch (error) {
      console.error('Erro ao atualizar venda:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível atualizar a venda.",
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
            Editar Venta del Muestrario
          </DialogTitle>
          <DialogDescription className="font-body">
            Edite las comisiones de la venta del mostruário <strong>{mostruario.code}</strong>
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground font-body">Cargando datos de la venta...</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
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
                  <Label htmlFor="global-commission-toggle-edit" className="font-body text-blue-900">
                    Comisión Global para todos los productos
                  </Label>
                  <p className="text-xs text-blue-700 font-body mt-1">
                    Active para aplicar el mismo porcentaje a todos los productos
                  </p>
                </div>
                <Switch
                  id="global-commission-toggle-edit"
                  checked={useGlobalCommission}
                  onCheckedChange={setUseGlobalCommission}
                />
              </div>
              
              {useGlobalCommission && (
                <div className="space-y-2">
                  <Label htmlFor="global-commission-edit" className="font-body text-blue-900">
                    Porcentaje de Comisión Global (%)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="global-commission-edit"
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

            {/* Lista de Produtos Vendidos */}
            {productSales.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-heading text-foreground">Productos Vendidos:</h4>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {productSales.map((product) => (
                    <div key={product.sold_product_id} className="p-4 border border-border rounded-lg space-y-3">
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
                          <Label htmlFor={`commission-edit-${product.sold_product_id}`} className="font-body flex items-center gap-1">
                            <Percent className="w-3 h-3" />
                            Comisión Individual (%)
                          </Label>
                          <Input
                            id={`commission-edit-${product.sold_product_id}`}
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={product.commission_percentage}
                            onChange={(e) => handleProductCommissionChange(product.sold_product_id, e.target.value)}
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
            )}

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description-edit" className="font-body">
                Descripción (opcional)
              </Label>
              <Textarea
                id="description-edit"
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
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading || isLoadingData}
            className="font-body"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateSale}
            disabled={isLoading || isLoadingData || productSales.length === 0}
            className="gap-2 font-body"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
