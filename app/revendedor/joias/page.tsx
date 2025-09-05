"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Gem, Package, DollarSign } from "lucide-react"
import { RevendedorJoiaCard } from "@/components/revendedor/revendedor-joia-card"

// Mock data - joias que a revendedora possui
const mockJoias = [
  {
    id: "J001",
    codigo: "AN001",
    nome: "Anel de Ouro 18k",
    categoria: "Anéis",
    descricao: "Anel clássico em ouro 18k com acabamento polido",
    precoCusto: 450.0, // Não pode editar
    precoVenda: 680.0, // Pode editar
    quantidade: 5,
    fotos: ["/anel-ouro.png", "/anel-ouro-2.png"],
  },
  {
    id: "J002",
    codigo: "BR002",
    nome: "Brincos de Prata",
    categoria: "Brincos",
    descricao: "Brincos delicados em prata 925 com zircônias",
    precoCusto: 120.0,
    precoVenda: 220.0,
    quantidade: 3,
    fotos: ["/brincos-prata.png", "/brincos-prata-2.png"],
  },
  {
    id: "J003",
    codigo: "CO003",
    nome: "Colar de Pérolas",
    categoria: "Colares",
    descricao: "Colar elegante com pérolas naturais",
    precoCusto: 280.0,
    precoVenda: 520.0,
    quantidade: 2,
    fotos: ["/colar-perolas.png", "/colar-perolas-2.png"],
  },
  {
    id: "J004",
    codigo: "PU004",
    nome: "Pulseira de Ouro",
    categoria: "Pulseiras",
    descricao: "Pulseira delicada em ouro 18k",
    precoCusto: 380.0,
    precoVenda: 600.0,
    quantidade: 4,
    fotos: ["/pulseira-ouro.png"],
  },
]

export default function RevendedorJoiasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("todas")

  const categories = ["Anéis", "Brincos", "Colares", "Pulseiras", "Relógios"]

  const filteredJoias = mockJoias.filter((joia) => {
    const matchesSearch =
      joia.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      joia.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "todas" || joia.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalPecas = mockJoias.reduce((sum, joia) => sum + joia.quantidade, 0)
  const totalProdutos = mockJoias.length
  const valorTotalEstoque = mockJoias.reduce((sum, joia) => sum + joia.quantidade * joia.precoVenda, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

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
                    className="px-4 py-2 text-sm font-body border border-border rounded-md hover:bg-muted transition-colors"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Joias Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJoias.map((joia) => (
              <RevendedorJoiaCard key={joia.id} joia={joia} />
            ))}
          </div>

          {filteredJoias.length === 0 && (
            <Card className="border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Gem className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-heading text-foreground mb-2">Nenhuma joia encontrada</h3>
                <p className="text-muted-foreground font-body text-center">
                  Tente ajustar os filtros para encontrar suas joias.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
