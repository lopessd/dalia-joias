"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Search, Plus, Minus, X, Package, User, AlertTriangle } from "lucide-react"
import { getDistributors, type DistributorProfile } from "@/lib/distributors-api"
import { getProductsWithDetails, getCategories } from "@/lib/products-api"
import { createShowcase } from "@/lib/showcase-api"
import type { ProductWithDetails, Category } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/currency"

interface CreateMostruarioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMostruarioCreated?: () => void
}

interface ProdutoSelecionado {
  joia: ProductWithDetails
  quantidade: number
}

// Removido mockRevendedores e mockJoias - agora usando dados reais da API

export function CreateMostruarioDialog({ open, onOpenChange, onMostruarioCreated }: CreateMostruarioDialogProps) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedRevendedor, setSelectedRevendedor] = useState<DistributorProfile | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [produtosSelecionados, setProdutosSelecionados] = useState<ProdutoSelecionado[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [revendedores, setRevendedores] = useState<DistributorProfile[]>([])
  const [isLoadingRevendedores, setIsLoadingRevendedores] = useState(false)
  
  // Estados para produtos e categorias
  const [produtos, setProdutos] = useState<ProductWithDetails[]>([])
  const [categorias, setCategorias] = useState<Category[]>([])
  const [isLoadingProdutos, setIsLoadingProdutos] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState<string>("todas")

  // Carregar revendedores quando o componente montar
  useEffect(() => {
    const loadRevendedores = async () => {
      setIsLoadingRevendedores(true)
      try {
        const distributors = await getDistributors()
        // Filtrar apenas revendedores ativos
        const activeRevendedores = distributors.filter(distributor => distributor.active)
        setRevendedores(activeRevendedores)
      } catch (error) {
        console.error('Erro ao carregar revendedores:', error)
        setRevendedores([])
      } finally {
        setIsLoadingRevendedores(false)
      }
    }

    if (open) {
      loadRevendedores()
    }
  }, [open])

  // Carregar produtos e categorias quando o componente montar
  useEffect(() => {
    const loadProdutosECategorias = async () => {
      try {
        setIsLoadingProdutos(true)
        
        // Carregar produtos e categorias em paralelo
        const [produtosData, categoriasData] = await Promise.all([
          getProductsWithDetails(),
          getCategories()
        ])
        
        // Filtrar apenas produtos com estoque > 1
        const produtosComEstoque = produtosData.filter(produto => 
          (produto.current_stock || 0) > 1
        )
        
        setProdutos(produtosComEstoque)
        setCategorias(categoriasData)
      } catch (error) {
        console.error('Erro ao carregar produtos e categorias:', error)
      } finally {
        setIsLoadingProdutos(false)
      }
    }

    loadProdutosECategorias()
  }, [])

  // Filtrar produtos baseado na busca e categoria selecionada
  const filteredJoias = produtos.filter((produto) => {
    const matchesSearch = 
      produto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.code.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategoria === "todas" || 
      produto.category?.name === selectedCategoria
    
    return matchesSearch && matchesCategory
   })



  const handleSelectRevendedor = (revendedorId: string) => {
    const revendedor = revendedores.find((r) => r.id === revendedorId)
    setSelectedRevendedor(revendedor || null)
  }

  const handleSelectJoia = (joia: ProductWithDetails) => {
    const existingIndex = produtosSelecionados.findIndex((p) => p.joia.id === joia.id)
    if (existingIndex >= 0) {
      // If already selected, remove it
      const newProdutos = [...produtosSelecionados]
      newProdutos.splice(existingIndex, 1)
      setProdutosSelecionados(newProdutos)
    } else {
      // Add new product with quantity 1
      setProdutosSelecionados([...produtosSelecionados, { joia, quantidade: 1 }])
    }
  }

  const handleQuantityChange = (joiaId: number, delta: number) => {
    setProdutosSelecionados(
      (prev) =>
        prev
          .map((produto) => {
            if (produto.joia.id === joiaId) {
              const newQuantity = produto.quantidade + delta
              if (newQuantity <= 0) return null
              if (newQuantity > (produto.joia.current_stock || 0)) return produto
              return { ...produto, quantidade: newQuantity }
            }
            return produto
          })
          .filter(Boolean) as ProdutoSelecionado[],
    )
  }

  const getTotalPecas = () => {
    return produtosSelecionados.reduce((sum, produto) => sum + produto.quantidade, 0)
  }

  const getTotalValor = () => {
    return produtosSelecionados.reduce((sum, produto) => {
      const preco = produto.joia.selling_price || produto.joia.cost_price || 0
      return sum + produto.quantidade * preco
    }, 0)
  }

  const handleSubmit = async () => {
    if (!selectedRevendedor || produtosSelecionados.length === 0) {
      toast({
        title: "Error",
        description: "Seleccione un distribuidor y al menos un producto.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Preparar dados para a API
      const showcaseData = {
        profile_id: selectedRevendedor.id,
        products: produtosSelecionados.map((p) => ({
          product_id: Number(p.joia.id),
          quantity: p.quantidade,
        })),
      }

      // Criar o showcase
      await createShowcase(showcaseData)

    toast({
          title: "¡Vitrina creada con éxito!",
          description: "Vitrina creada con éxito. Los productos fueron agregados y el stock se actualizó.",
        })

      // Reset form e fechar dialog
      setCurrentStep(1)
      setSelectedRevendedor(null)
      setSearchTerm("")
      setProdutosSelecionados([])
      onOpenChange(false)

      // Callback para recarregar a lista
      if (onMostruarioCreated) {
        onMostruarioCreated()
      }

    } catch (error) {
      console.error('Erro ao criar mostruário:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error inesperado al crear la vitrina.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setCurrentStep(1)
    setSelectedRevendedor(null)
    setSearchTerm("")
    setProdutosSelecionados([])
    // Não limpar revendedores aqui para evitar recarregamento desnecessário
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-heading text-foreground mb-4">Elegí el Distribuidor</h3>
        <div className="space-y-2">
          <Label className="font-body">Distribuidor *</Label>
          <Select onValueChange={handleSelectRevendedor} disabled={isLoadingRevendedores}>
            <SelectTrigger className="font-body">
              <SelectValue placeholder={isLoadingRevendedores ? "Cargando distribuidores..." : "Seleccioná un distribuidor"} />
            </SelectTrigger>
            <SelectContent>
              {revendedores.map((revendedor) => (
                <SelectItem key={revendedor.id} value={revendedor.id}>
                  {revendedor.name || revendedor.email.split('@')[0]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedRevendedor && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-heading text-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Distribuidor Seleccionado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-body text-foreground">{selectedRevendedor.name || selectedRevendedor.email.split('@')[0]}</p>
              <p className="text-sm text-muted-foreground font-body">{selectedRevendedor.email}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-heading text-foreground mb-4">Elegí los Productos</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="font-body">
                Buscar Productos
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Código, nombre o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 font-body"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-body">
                Categoría
              </Label>
              <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                <SelectTrigger className="font-body">
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.name}>
                      {categoria.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {isLoadingProdutos ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Cargando productos...</p>
                </div>
              </div>
            ) : filteredJoias.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No se encontraron productos con los filtros aplicados.</p>
              </div>
            ) : (
              filteredJoias.map((joia) => {
                const produtoSelecionado = produtosSelecionados.find((p) => p.joia.id === joia.id)
                const isSelected = !!produtoSelecionado
                const estoqueDisponivel = joia.current_stock || 0

                return (
                  <Card
                    key={joia.id}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'border-none bg-muted/80 shadow-sm' : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => handleSelectJoia(joia)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-heading text-sm text-foreground">{joia.name}</h4>
                            {joia.category && (
                              <Badge variant="outline" className="text-xs font-body">
                                {joia.category.name}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground font-body">Código: {joia.code}</p>
                          <p className="text-xs text-muted-foreground font-body">Stock: {estoqueDisponivel}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-heading text-foreground">
                            {formatCurrency(joia.selling_price || joia.cost_price || 0)}
                          </p>
                          {isSelected && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              Seleccionado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-heading text-foreground mb-4">Lista de Productos Seleccionados</h3>
        {produtosSelecionados.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground font-body">Ningún producto seleccionado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {produtosSelecionados.map((produto) => (
              <Card key={produto.joia.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-heading text-sm text-foreground">{produto.joia.name}</h4>
                      <p className="text-xs text-muted-foreground font-body">Código: {produto.joia.code}</p>
                      <p className="text-xs text-muted-foreground font-body">Stock: {produto.joia.current_stock || 0}</p>
                      <p className="text-xs text-muted-foreground font-body">
                        {formatCurrency(produto.joia.selling_price || produto.joia.cost_price || 0)} c/u
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(produto.joia.id, -1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-heading text-foreground w-8 text-center">{produto.quantidade}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(produto.joia.id, 1)}
                        disabled={produto.quantidade >= (produto.joia.current_stock || 0)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-heading text-foreground mb-2">Confirmación Final</h3>
        <p className="text-muted-foreground font-body">
          Revisá todos los datos antes de confirmar el envío de la vitrina
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg bg-muted/30">
          <h4 className="font-heading mb-2 flex items-center gap-2">
            <User className="h-4 w-4" />
            Distribuidor Seleccionado
          </h4>
          <p className="text-sm font-heading text-foreground">{selectedRevendedor?.name}</p>
          <p className="text-xs text-muted-foreground font-body">{selectedRevendedor?.email}</p>
        </div>

        <div className="p-4 border rounded-lg bg-muted/30">
          <h4 className="font-heading mb-3 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Resumen del Envío
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center p-2 bg-background rounded">
              <p className="font-heading text-lg text-foreground">{produtosSelecionados.length}</p>
              <p className="text-muted-foreground text-xs font-body">Productos</p>
            </div>
            <div className="text-center p-2 bg-background rounded">
              <p className="font-heading text-lg text-foreground">{getTotalPecas()}</p>
              <p className="text-muted-foreground text-xs font-body">Piezas</p>
            </div>
            <div className="text-center p-2 bg-background rounded">
              <p className="font-heading text-lg text-foreground">{formatCurrency(getTotalValor())}</p>
              <p className="text-muted-foreground text-xs font-body">Valor Total</p>
            </div>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-heading mb-3">Lista de Productos</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
             {produtosSelecionados.map((produto) => (
               <div key={produto.joia.id} className="flex justify-between items-center text-sm p-3 bg-muted/50 rounded border">
                 <div className="flex-1">
                   <p className="font-heading text-foreground">{produto.joia.name}</p>
                   <p className="text-muted-foreground text-xs font-body">Código: {produto.joia.code}</p>
                 </div>
                 <div className="text-right">
                   <p className="font-heading text-foreground">Cant: {produto.quantidade}</p>
                   <p className="text-muted-foreground text-xs font-body">
                     {formatCurrency(produto.quantidade * (produto.joia.selling_price || produto.joia.cost_price || 0))}
                   </p>
                 </div>
               </div>
             ))}
           </div>
         </div>

         <div className="p-4 border-2 border-dashed border-orange-200 bg-orange-50 rounded-lg">
           <div className="flex items-start gap-3">
             <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
             <div className="text-sm">
               <p className="font-heading text-orange-800 mb-1">¡Atención!</p>
               <p className="text-orange-700 font-body">
                 Al confirmar, los productos serán agregados a la vitrina y <strong>removidos del stock</strong>. 
                 Esta acción registrará los movimientos en el sistema.
               </p>
             </div>
           </div>
         </div>
       </div>
     </div>
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Crear Nueva Vitrina</DialogTitle>
          <DialogDescription className="font-body">
            Paso {currentStep} de 4: {currentStep === 1 && "Elegí el distribuidor"}
            {currentStep === 2 && "Seleccioná los productos"}
            {currentStep === 3 && "Ajustá las cantidades"}
            {currentStep === 4 && "Confirmá los datos"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} className="gap-2 font-body">
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="font-body bg-transparent">
                Cancelar
              </Button>
              {currentStep < 4 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={
                    (currentStep === 1 && !selectedRevendedor) ||
                    (currentStep === 3 && produtosSelecionados.length === 0)
                  }
                  className="gap-2 font-body"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading} className="font-body">
                  {isLoading ? "Creando..." : "Confirmar Vitrina"}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
