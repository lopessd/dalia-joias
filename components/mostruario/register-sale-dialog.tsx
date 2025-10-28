"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { DollarSign, Package, ShoppingCart, Percent, Loader2 } from "lucide-react"
import { getShowcaseProductsForSale, registerShowcaseSale, type ShowcaseProductForSale } from "@/lib/showcase-api"
import { formatCurrency } from "@/lib/currency"

interface RegisterSaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  showcaseId: number
  showcaseCode: string
  onSaleRegistered?: () => void
}

export function RegisterSaleDialog({ 
  open, 
  onOpenChange, 
  showcaseId, 
  showcaseCode,
  onSaleRegistered 
}: RegisterSaleDialogProps) {
  const [products, setProducts] = useState<ShowcaseProductForSale[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [saleQuantities, setSaleQuantities] = useState<Record<number, number>>({})
  const [commissionPercentage, setCommissionPercentage] = useState<number>(0)
  const [description, setDescription] = useState("")
  const { toast } = useToast()

  // Carregar produtos disponíveis
  useEffect(() => {
    if (open) {
      loadProducts()
    }
  }, [open, showcaseId])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await getShowcaseProductsForSale(showcaseId)
      setProducts(data)
      
      // Inicializar quantidades em 0
      const initialQuantities: Record<number, number> = {}
      data.forEach(p => {
        initialQuantities[p.product_id] = 0
      })
      setSaleQuantities(initialQuantities)
      
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos disponíveis.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (productId: number, value: string) => {
    const quantity = parseInt(value) || 0
    const product = products.find(p => p.product_id === productId)
    
    if (product && quantity >= 0 && quantity <= product.available_for_sale) {
      setSaleQuantities(prev => ({ ...prev, [productId]: quantity }))
    }
  }

  const calculateTotals = () => {
    let totalValue = 0
    let totalCommission = 0
    
    products.forEach(product => {
      const quantity = saleQuantities[product.product_id] || 0
      const value = quantity * product.selling_price
      totalValue += value
      totalCommission += (value * commissionPercentage) / 100
    })
    
    return { totalValue, totalCommission }
  }

  const handleSubmit = async () => {
    // Validar se pelo menos um produto foi selecionado
    const hasSelectedProducts = Object.values(saleQuantities).some(q => q > 0)
    
    if (!hasSelectedProducts) {
      toast({
        title: "Atenção",
        description: "Selecione pelo menos um produto para vender.",
        variant: "destructive",
      })
      return
    }

    if (commissionPercentage < 0 || commissionPercentage > 100) {
      toast({
        title: "Atenção",
        description: "A porcentagem de comissão deve estar entre 0 e 100.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      // Preparar dados dos produtos vendidos
      const productsToSell = products
        .filter(p => (saleQuantities[p.product_id] || 0) > 0)
        .map(p => ({
          product_id: p.product_id,
          quantity: saleQuantities[p.product_id],
          sold_price: p.selling_price
        }))

      await registerShowcaseSale(showcaseId, {
        products: productsToSell,
        commission_percentage: commissionPercentage,
        description: description || `Venda do mostruário ${showcaseCode}`
      })

      toast({
        title: "Sucesso",
        description: "Venda registrada com sucesso!",
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
      setSubmitting(false)
    }
  }

  const { totalValue, totalCommission } = calculateTotals()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Registrar Venda - {showcaseCode}
          </DialogTitle>
          <DialogDescription className="font-body">
            Registre a venda de produtos deste mostruário
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-body">
              Não há produtos disponíveis para venda neste mostruário.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Lista de Produtos */}
            <div className="space-y-4">
              <h3 className="font-heading text-foreground">Produtos Disponíveis</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {products.map(product => (
                  <Card key={product.product_id} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-heading text-foreground text-sm">{product.product_name}</h4>
                          <p className="text-xs text-muted-foreground font-body">
                            Código: {product.product_code}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-body">
                            <span>Disponível: {product.available_for_sale}</span>
                            <span>Preço: {formatCurrency(product.selling_price)}</span>
                          </div>
                        </div>
                        <div className="w-24">
                          <Label htmlFor={`qty-${product.product_id}`} className="text-xs font-body">
                            Quantidade
                          </Label>
                          <Input
                            id={`qty-${product.product_id}`}
                            type="number"
                            min="0"
                            max={product.available_for_sale}
                            value={saleQuantities[product.product_id] || 0}
                            onChange={(e) => handleQuantityChange(product.product_id, e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Comissão e Observações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commission" className="font-body flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Comissão (%)
                </Label>
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={commissionPercentage}
                  onChange={(e) => setCommissionPercentage(parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="font-body">
                  Observações (Opcional)
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Adicione detalhes sobre a venda..."
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Resumo da Venda */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground font-body">Valor Total</p>
                    <p className="text-lg font-heading text-foreground">{formatCurrency(totalValue)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground font-body">Comissão ({commissionPercentage}%)</p>
                    <p className="text-lg font-heading text-primary">{formatCurrency(totalCommission)}</p>
                  </div>
                  <div className="text-center col-span-2 md:col-span-1">
                    <p className="text-sm text-muted-foreground font-body">Valor Líquido</p>
                    <p className="text-lg font-heading text-foreground">{formatCurrency(totalValue - totalCommission)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || loading || products.length === 0}
            className="gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                Registrar Venda
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
