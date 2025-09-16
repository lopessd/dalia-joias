"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Search, DollarSign, TrendingUp, Package } from "lucide-react"
import { VendaCard } from "@/components/vendas/venda-card"
import { CreateVendaDialog } from "@/components/vendas/create-venda-dialog"
import { formatCurrency } from "@/lib/currency"

// Mock data - in a real app, this would come from an API
const mockVendas = [
  {
    id: "1",
    data: "2024-01-20",
    valor: 1250.0,
    quantidadeProdutos: 3,
    quantidadeJoias: 5,
    observacoes: "Cliente muito satisfeita, indicou para amigas",
    produtos: [
      { id: "1", nome: "Anel de Ouro 18k", quantidade: 2, precoUnitario: 450.0 },
      { id: "2", nome: "Brincos de Prata", quantidade: 3, precoUnitario: 116.67 },
    ],
  },
  {
    id: "2",
    data: "2024-01-19",
    valor: 890.0,
    quantidadeProdutos: 2,
    quantidadeJoias: 4,
    observacoes: "Venda para presente de aniversário",
    produtos: [
      { id: "3", nome: "Colar de Pérolas", quantidade: 1, precoUnitario: 650.0 },
      { id: "4", nome: "Pulseira de Ouro", quantidade: 3, precoUnitario: 80.0 },
    ],
  },
  {
    id: "3",
    data: "2024-01-18",
    valor: 2100.0,
    quantidadeProdutos: 1,
    quantidadeJoias: 1,
    observacoes: "Peça especial encomendada",
    produtos: [{ id: "5", nome: "Anel de Diamante", quantidade: 1, precoUnitario: 2100.0 }],
  },
  {
    id: "4",
    data: "2024-01-17",
    valor: 340.0,
    quantidadeProdutos: 2,
    quantidadeJoias: 6,
    observacoes: "",
    produtos: [
      { id: "6", nome: "Brincos Pequenos", quantidade: 4, precoUnitario: 60.0 },
      { id: "7", nome: "Pingente", quantidade: 2, precoUnitario: 50.0 },
    ],
  },
]

export default function VendasPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  // Calculate summary data
  const totalVendas = mockVendas.length
  const valorTotal = mockVendas.reduce((sum, venda) => sum + venda.valor, 0)
  const mediaVenda = totalVendas > 0 ? valorTotal / totalVendas : 0



  // Filter vendas based on search and date
  const filteredVendas = mockVendas.filter((venda) => {
    const matchesSearch =
      searchTerm === "" ||
      venda.observacoes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venda.produtos.some((produto) => produto.nome.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesDate = dateFilter === "" || venda.data.includes(dateFilter)

    return matchesSearch && matchesDate
  })

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="revendedor" />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-heading text-foreground mb-2">Vendas</h1>
              <p className="text-muted-foreground font-body">Gerencie suas vendas e acompanhe o desempenho</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="font-body">
              <Plus className="w-4 h-4 mr-2" />
              Nova Venda
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Total de Vendas</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{totalVendas}</div>
                <p className="text-xs text-green-600 font-body">+12% vs mês anterior</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Valor Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{formatCurrency(valorTotal)}</div>
                <p className="text-xs text-green-600 font-body">+18% vs mês anterior</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Média por Venda</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{formatCurrency(mediaVenda)}</div>
                <p className="text-xs text-muted-foreground font-body">valor médio</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-border mb-6">
            <CardHeader>
              <CardTitle className="font-heading text-foreground">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search" className="font-body">
                    Buscar
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="search"
                      placeholder="Buscar por produto ou observação..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 font-body"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="font-body">
                    Data
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="date"
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="pl-10 font-body"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vendas List */}
          <div className="space-y-4">
            {filteredVendas.length === 0 ? (
              <Card className="border-border">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-heading text-foreground mb-2">Nenhuma venda encontrada</h3>
                  <p className="text-muted-foreground font-body text-center mb-4">
                    {searchTerm || dateFilter
                      ? "Tente ajustar os filtros para encontrar vendas."
                      : "Comece criando sua primeira venda."}
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="font-body">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Venda
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredVendas.map((venda) => <VendaCard key={venda.id} venda={venda} />)
            )}
          </div>
        </div>
      </main>

      <CreateVendaDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  )
}
