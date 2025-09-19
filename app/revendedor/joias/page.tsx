"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Gem, Package, DollarSign, Loader2 } from "lucide-react"
import { RevendedorJoiaCard } from "@/components/revendedor/revendedor-joia-card"
import { getDistributorJewelry, type DistributorJewelry } from "@/lib/inventory-api"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/currency"

export default function RevendedorJoiasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("todas")
  const [joias, setJoias] = useState<DistributorJewelry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [userProfile, setUserProfile] = useState<string | null>(null)

  // Função para carregar dados do usuário e joias
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("Usuário não autenticado")
        return
      }

      setUserProfile(user.id)

      // Carregar joias do distribuidor
      const distributorJewelry = await getDistributorJewelry(user.id)
      setJoias(distributorJewelry)

      // Extrair categorias únicas
      const uniqueCategories = Array.from(
        new Set(distributorJewelry.map(j => j.category?.name).filter(Boolean))
      ) as string[]
      setCategories(uniqueCategories)

    } catch (err) {
      console.error('Erro ao carregar joias:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Carregar dados na inicialização
  useEffect(() => {
    loadData()
  }, [])

  const filteredJoias = joias.filter((joia) => {
    const matchesSearch =
      joia.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      joia.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "todas" || joia.category?.name === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalPecas = joias.reduce((sum, joia) => sum + joia.quantity, 0)
  const totalProdutos = joias.length
  const valorTotalEstoque = joias.reduce((sum, joia) => {
    const precoVenda = joia.selling_price || joia.cost_price * 1.5 // Fallback se não tiver preço de venda
    return sum + joia.quantity * precoVenda
  }, 0)



  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="revendedor" />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading text-foreground mb-2">Minhas Joias</h1>
            <p className="text-muted-foreground font-body">Gerencie suas joias e preços de venda</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Cantidad de Joyas</CardTitle>
                <Gem className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{totalPecas}</div>
                <p className="text-xs text-muted-foreground font-body">piezas en inventario</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Productos Diferentes</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{totalProdutos}</div>
                <p className="text-xs text-muted-foreground font-body">tipos de joyas</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Valor em Estoque</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{formatCurrency(valorTotalEstoque)}</div>
                <p className="text-xs text-muted-foreground font-body">preço de venda</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-border mb-8">
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
                      placeholder="Nombre o código de la joya..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 font-body"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-body">Categoria</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={loading}>
                    <SelectTrigger className="font-body">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as categorias</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("todas")
                    }}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-body border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Joias Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Carregando joias...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-red-800 mb-2">Erro ao carregar joias</h3>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJoias.map((joia) => (
                  <RevendedorJoiaCard 
                    key={joia.id} 
                    joia={{
                      id: joia.id.toString(),
                      codigo: joia.code,
                      nome: joia.name,
                      categoria: joia.category?.name || 'Sem categoria',
                      descricao: joia.description || '',
                      precoCusto: joia.selling_price, // Agora mostra o preço de venda da tabela product
                      precoVenda: joia.resale_price || joia.selling_price, // Preço personalizado do revendedor ou fallback
                      quantidade: joia.quantity,
                      fotos: joia.photos?.map(p => p.url) || []
                    }} 
                    onPriceUpdate={loadData}
                  />
                ))}
              </div>

              {filteredJoias.length === 0 && !loading && (
                <Card className="border-border">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Gem className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-heading text-foreground mb-2">Nenhuma joia encontrada</h3>
                    <p className="text-muted-foreground font-body text-center">
                      {joias.length === 0 
                        ? "Você ainda não possui joias em seu estoque. Entre em contato com a Dalia Joias para receber seu mostruário."
                        : "Tente ajustar os filtros para encontrar as joias desejadas."
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
