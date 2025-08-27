"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Filter, Gem, Package, TrendingUp, DollarSign } from "lucide-react"
import { JoiaCard } from "@/components/joias/joia-card"
import { CreateJoiaDialog } from "@/components/joias/create-joia-dialog"
import { TransactionCard } from "@/components/joias/transaction-card"
import { getProductsWithDetails, getCategories } from '@/lib/products-api'
import { useToast } from '@/hooks/use-toast'
import type { ProductWithDetails, Category } from '@/lib/supabase'

// Mock data para transações (mantido temporariamente)
const mockTransactions = [
  {
    id: "T001",
    joiaId: "J001",
    joiaNome: "Anel de Ouro 18k",
    tipo: "entrada" as const,
    quantidade: 10,
    motivo: "Compra de fornecedor",
    data: "2024-01-15",
    valor: 4500.0,
  },
  {
    id: "T002",
    joiaId: "J002",
    joiaNome: "Brincos de Prata",
    tipo: "saida" as const,
    quantidade: 2,
    motivo: "Venda para revendedor",
    data: "2024-01-14",
    valor: 360.0,
  },
  {
    id: "T003",
    joiaId: "J003",
    joiaNome: "Colar de Pérolas",
    tipo: "envio" as const,
    quantidade: 1,
    motivo: "Mostruário para Maria Silva",
    data: "2024-01-13",
    valor: 420.0,
  },
]

export default function JoiasPage() {
  const [products, setProducts] = useState<ProductWithDetails[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("todas")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [transactionFilters, setTransactionFilters] = useState({
    dataInicio: "",
    dataFim: "",
    motivo: "",
    tipo: "todos",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [productsData, categoriesData] = await Promise.all([
        getProductsWithDetails(),
        getCategories()
      ])
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Função callback para recarregar dados após mudanças
  const handleDataChange = () => {
    loadData()
  }

  // Filtros de produtos
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "todas" || product.category?.name === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredTransactions = mockTransactions.filter((transaction) => {
    const matchesMotivo = transaction.motivo.toLowerCase().includes(transactionFilters.motivo.toLowerCase())
    const matchesTipo = transactionFilters.tipo === "todos" || transaction.tipo === transactionFilters.tipo
    return matchesMotivo && matchesTipo
  })

  // Cálculos dos KPIs
  const totalPecas = products.length
  const valorTotalEstoque = products.reduce((sum, product) => {
    return sum + (product.selling_price || product.cost_price)
  }, 0)
  const joisasAtivas = products.filter((product) => product.active).length
  const joisasBaixoEstoque = 0 // Por enquanto, sem lógica de estoque

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar userType="admin" />
        <main className="flex-1 md:ml-64 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando joias...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="admin" />

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-heading text-foreground mb-2">Gestão de Joias</h1>
              <p className="text-muted-foreground font-body">Controle completo do estoque de joias</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2 font-body">
              <Plus className="w-4 h-4" />
              Nova Joia
            </Button>
          </div>

          <Tabs defaultValue="estoque" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="estoque" className="font-body">
                Controle de Estoque
              </TabsTrigger>
              <TabsTrigger value="historico" className="font-body">
                Histórico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="estoque" className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-body text-muted-foreground">Total de Peças</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-heading text-foreground">{totalPecas.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground font-body">peças em estoque</p>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-body text-muted-foreground">Valor Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-heading text-foreground">{formatCurrency(valorTotalEstoque)}</div>
                    <p className="text-xs text-muted-foreground font-body">preço de venda</p>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-body text-muted-foreground">Joias Ativas</CardTitle>
                    <Gem className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-heading text-foreground">{joisasAtivas}</div>
                    <p className="text-xs text-muted-foreground font-body">produtos ativos</p>
                  </CardContent>
                </Card>

                <Card className="border-border border-orange-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-body text-muted-foreground">Baixo Estoque</CardTitle>
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-heading text-orange-600">{joisasBaixoEstoque}</div>
                    <p className="text-xs text-orange-600 font-body">precisam reposição</p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-heading text-foreground flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="search" className="font-body">
                        Buscar
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="search"
                          placeholder="Nome ou código da joia..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 font-body"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-body">Categoria</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="font-body">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas as categorias</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm("")
                          setSelectedCategory("todas")
                        }}
                        className="font-body"
                      >
                        Limpar Filtros
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Joias Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <JoiaCard key={product.id} joia={product} onDataChange={handleDataChange} />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <Card className="border-border">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Gem className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-heading text-foreground mb-2">Nenhuma joia encontrada</h3>
                    <p className="text-muted-foreground font-body text-center">
                      Tente ajustar os filtros ou criar uma nova joia.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="historico" className="space-y-6">
              {/* Transaction Filters */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-heading text-foreground flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtros do Histórico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataInicio" className="font-body">
                        Data Início
                      </Label>
                      <Input
                        id="dataInicio"
                        type="date"
                        value={transactionFilters.dataInicio}
                        onChange={(e) =>
                          setTransactionFilters((prev) => ({
                            ...prev,
                            dataInicio: e.target.value,
                          }))
                        }
                        className="font-body"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataFim" className="font-body">
                        Data Fim
                      </Label>
                      <Input
                        id="dataFim"
                        type="date"
                        value={transactionFilters.dataFim}
                        onChange={(e) =>
                          setTransactionFilters((prev) => ({
                            ...prev,
                            dataFim: e.target.value,
                          }))
                        }
                        className="font-body"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motivo" className="font-body">
                        Motivo
                      </Label>
                      <Input
                        id="motivo"
                        placeholder="Buscar por motivo..."
                        value={transactionFilters.motivo}
                        onChange={(e) =>
                          setTransactionFilters((prev) => ({
                            ...prev,
                            motivo: e.target.value,
                          }))
                        }
                        className="font-body"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-body">Tipo</Label>
                      <Select
                        value={transactionFilters.tipo}
                        onValueChange={(value) =>
                          setTransactionFilters((prev) => ({
                            ...prev,
                            tipo: value,
                          }))
                        }
                      >
                        <SelectTrigger className="font-body">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os tipos</SelectItem>
                          <SelectItem value="entrada">Entrada</SelectItem>
                          <SelectItem value="saida">Saída</SelectItem>
                          <SelectItem value="envio">Envio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transactions List */}
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <TransactionCard key={transaction.id} transaction={transaction} />
                ))}
              </div>

              {filteredTransactions.length === 0 && (
                <Card className="border-border">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-heading text-foreground mb-2">Nenhuma transação encontrada</h3>
                    <p className="text-muted-foreground font-body text-center">
                      Tente ajustar os filtros para ver as transações.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <CreateJoiaDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        categories={categories}
        onSuccess={handleDataChange}
      />
    </div>
  )
}
