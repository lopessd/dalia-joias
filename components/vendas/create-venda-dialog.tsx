'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, Search, Minus, X, ShoppingCart, Package } from 'lucide-react'
import { toast } from 'sonner'
import { createSale } from '@/lib/sales-api'
import { getResellerProducts, type ProductWithStock } from '@/lib/products-api'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SelectedProduct {
  id: string
  code: string
  name: string
  category_name: string
  sale_price: number
  quantity: number
  total: number
  stock_quantity: number
}

interface CreateVendaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVendaCreated?: () => void
}

export function CreateVendaDialog({ open, onOpenChange, onVendaCreated }: CreateVendaDialogProps) {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [notes, setNotes] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<ProductWithStock[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [availableProducts, setAvailableProducts] = useState<ProductWithStock[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('todas')

  // Buscar produtos com debounce
  useEffect(() => {
    const searchProducts = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults(availableProducts)
        return
      }

      setIsSearching(true)
      try {
        const result = await getResellerProducts(searchTerm, 50)
        setSearchResults(result.products)
      } catch (error) {
        console.error('Erro ao buscar produtos:', error)
        toast.error('Erro ao buscar produtos')
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm, availableProducts])

  const loadInitialProducts = async () => {
    setIsSearching(true)
    try {
      const result = await getResellerProducts('', 50)
      setAvailableProducts(result.products)
      setSearchResults(result.products)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      toast.error('Erro ao carregar produtos')
    } finally {
      setIsSearching(false)
    }
  }

  // Carregar produtos iniciais quando o modal abrir
  useEffect(() => {
    if (open) {
      loadInitialProducts()
    }
  }, [open])

  // Função para selecionar/deselecionar produto (similar ao modal de mostruário)
  const handleSelectProduct = (product: ProductWithStock) => {
    const existingIndex = selectedProducts.findIndex((p) => p.id === product.id)
    if (existingIndex >= 0) {
      // Se já está selecionado, remove
      const newProducts = [...selectedProducts]
      newProducts.splice(existingIndex, 1)
      setSelectedProducts(newProducts)
    } else {
      // Adiciona novo produto com quantidade 1
      const newProduct: SelectedProduct = {
        id: product.id,
        code: product.code,
        name: product.name,
        category_name: product.category_name,
        sale_price: product.sale_price,
        quantity: 1,
        total: product.sale_price,
        stock_quantity: product.stock_quantity
      }
      setSelectedProducts([...selectedProducts, newProduct])
    }
  }

  // Função para verificar se produto está selecionado
  const isProductSelected = (productId: string) => {
    return selectedProducts.some(p => p.id === productId)
  }

  // Obter categorias únicas dos produtos disponíveis
  const getUniqueCategories = () => {
    const categories = new Set(availableProducts.map(p => p.category_name))
    return Array.from(categories).sort()
  }

  // Filtrar produtos por categoria
  const getFilteredProducts = () => {
    if (selectedCategory === 'todas') {
      return searchResults
    }
    return searchResults.filter(p => p.category_name === selectedCategory)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Função para ajustar quantidade de produto selecionado
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove o produto se quantidade for 0 ou menor
      setSelectedProducts(selectedProducts.filter(p => p.id !== productId))
      return
    }

    const product = selectedProducts.find(p => p.id === productId)
    if (!product) return

    // Verificar se não excede o estoque
    if (newQuantity > product.stock_quantity) {
      toast.error(`Quantidade máxima disponível: ${product.stock_quantity}`)
      return
    }

    setSelectedProducts(selectedProducts.map(p => 
      p.id === productId 
        ? { ...p, quantity: newQuantity }
        : p
    ))
  }

  const addProduct = (product: ProductWithStock) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id)
    
    if (existingProduct) {
      if (existingProduct.quantity >= product.stock_quantity) {
        toast.error(`Estoque insuficiente. Disponível: ${product.stock_quantity}`)
        return
      }
      
      setSelectedProducts(prev => prev.map(p => 
        p.id === product.id 
          ? { 
              ...p, 
              quantity: p.quantity + 1,
              total: (p.quantity + 1) * p.sale_price
            }
          : p
      ))
    } else {
      const newProduct: SelectedProduct = {
        id: product.id,
        code: product.code,
        name: product.name,
        category_name: product.category_name,
        sale_price: product.sale_price,
        quantity: 1,
        total: product.sale_price,
        stock_quantity: product.stock_quantity
      }
      setSelectedProducts(prev => [...prev, newProduct])
    }
    setSearchTerm('')
  }

  // Calcular totais
  const getTotalQuantity = () => {
    return selectedProducts.reduce((total, product) => total + product.quantity, 0)
  }

  const getTotalAmount = () => {
    return selectedProducts.reduce((total, product) => total + (product.quantity * product.unit_price), 0)
  }

  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Selecione pelo menos um produto')
      return
    }

    setIsLoading(true)
    try {
      const saleData = {
        products: selectedProducts.map(p => ({
          product_id: parseInt(p.id),
          quantity: p.quantity,
          unit_price: p.unit_price
        })),
        notes: notes.trim() || undefined
      }

      await createSale(saleData)
      
      toast.success('Venda criada com sucesso!')
      
      // Reset form
      setSelectedProducts([])
      setNotes('')
      setSearchTerm('')
      setSearchResults([])
      setSelectedCategory('todas')
      
      onVendaCreated()
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao criar venda:', error)
      toast.error('Erro ao criar venda')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedProducts([])
    setNotes('')
    setSearchTerm('')
    setSearchResults([])
    onOpenChange(false)
  }

  // Filtrar produtos que já foram selecionados
  const filteredProducts = searchResults.filter(
    product => !selectedProducts.some(selected => selected.id === product.id)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="font-heading text-lg sm:text-xl">Nova Venda</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 px-1">
          {/* Product Search */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="search" className="font-body text-sm sm:text-base">
                Buscar Produtos
              </Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Buscar por código, nome ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 font-body text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Product Results */}
            {(searchTerm || availableProducts.length > 0) && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <h4 className="font-body text-sm font-medium text-muted-foreground">
                  Produtos Disponíveis
                </h4>
                {isSearching ? (
                  <div className="text-center py-4">
                    <div className="text-sm text-muted-foreground">Buscando produtos...</div>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => addProduct(product)}>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-body text-xs text-muted-foreground">#{product.code}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {product.category_name}
                                </Badge>
                              </div>
                              <h5 className="font-body text-sm font-medium truncate">{product.name}</h5>
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-body text-sm font-semibold text-green-600">
                                  {formatCurrency(product.sale_price)}
                                </span>
                                <span className="font-body text-xs text-muted-foreground">
                                  Estoque: {product.stock_quantity}
                                </span>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost" className="ml-2 h-8 w-8 p-0">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Products */}
          {selectedProducts.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-body text-sm sm:text-base font-medium">Produtos Selecionados</h4>
              
              {/* Mobile Layout */}
              <div className="block sm:hidden space-y-3">
                {selectedProducts.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-body text-xs text-muted-foreground">#{product.code}</span>
                            <Badge variant="secondary" className="text-xs">
                              {product.category_name}
                            </Badge>
                          </div>
                          <h5 className="font-body text-sm font-medium">{product.name}</h5>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeProduct(product.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-body text-sm">Quantidade:</span>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateProductQuantity(product.id, product.quantity - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="font-body text-sm font-medium w-8 text-center">
                              {product.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateProductQuantity(product.id, product.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-body text-sm">Preço Unit.:</span>
                          <Input
                            type="number"
                            value={product.sale_price}
                            onChange={(e) => updateProductPrice(product.id, Number.parseFloat(e.target.value) || 0)}
                            className="w-24 h-8 text-sm text-right"
                            step="0.01"
                            min="0"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="font-body text-sm font-medium">Total:</span>
                          <span className="font-body text-sm font-semibold text-green-600">
                            {formatCurrency(product.total)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:block">
                <div className="space-y-2">
                  {selectedProducts.map((product) => (
                    <Card key={product.id}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-body text-xs text-muted-foreground">#{product.code}</span>
                              <Badge variant="secondary" className="text-xs">
                                {product.category_name}
                              </Badge>
                            </div>
                            <h5 className="font-body text-sm font-medium">{product.name}</h5>
                          </div>
                          
                          <div className="col-span-2">
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateProductQuantity(product.id, product.quantity - 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-body text-sm font-medium w-8 text-center">
                                {product.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateProductQuantity(product.id, product.quantity + 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="col-span-2">
                            <Input
                              type="number"
                              value={product.sale_price}
                              onChange={(e) => updateProductPrice(product.id, Number.parseFloat(e.target.value) || 0)}
                              className="h-8 text-sm text-right"
                              step="0.01"
                              min="0"
                            />
                          </div>
                          
                          <div className="col-span-3">
                            <span className="font-body text-sm font-semibold text-green-600">
                              {formatCurrency(product.total)}
                            </span>
                          </div>
                          
                          <div className="col-span-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeProduct(product.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sale Summary */}
          {selectedProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-base sm:text-lg">Resumo da Venda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="font-body text-lg sm:text-xl font-bold">{selectedProducts.length}</div>
                    <div className="font-body text-xs sm:text-sm text-muted-foreground">Produtos</div>
                  </div>
                  <div>
                    <div className="font-body text-lg sm:text-xl font-bold">{getTotalQuantity()}</div>
                    <div className="font-body text-xs sm:text-sm text-muted-foreground">Quantidade</div>
                  </div>
                  <div>
                    <div className="font-body text-lg sm:text-xl font-bold text-green-600">
                      {formatCurrency(getTotalAmount())}
                    </div>
                    <div className="font-body text-xs sm:text-sm text-muted-foreground">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="font-body text-sm sm:text-base">
              Observações
            </Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre a venda (opcional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2 font-body text-sm sm:text-base"
              rows={3}
            />
          </div>
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} className="font-body bg-transparent text-sm sm:text-base">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={selectedProducts.length === 0} className="font-body text-sm sm:text-base">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Criar Venda
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
