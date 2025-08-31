"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Filter, Calendar, Package, Send, X } from "lucide-react"
import { HistoricoRecebimentoCard } from "@/components/revendedor/historico-recebimento-card"

// Mock data - historial de muestrarios recibidos
const mockHistorico = [
  {
    id: "M001",
    codigo: "MST-2024-001",
    dataRecebimento: "2024-01-15",
    quantidadePecas: 15,
    quantidadeProdutos: 8,
    valorTotal: 4250.0,
    produtos: [
      { joiaId: "J001", joiaNome: "Anel de Ouro 18k", quantidade: 3, precoVenda: 680.0 },
      { joiaId: "J002", joiaNome: "Brincos de Prata", quantidade: 5, precoVenda: 180.0 },
      { joiaId: "J003", joiaNome: "Colar de Pérolas", quantidade: 2, precoVenda: 420.0 },
      { joiaId: "J004", joiaNome: "Pulseira de Ouro", quantidade: 5, precoVenda: 520.0 },
    ],
  },
  {
    id: "M002",
    codigo: "MST-2024-002",
    dataRecebimento: "2024-01-10",
    quantidadePecas: 12,
    quantidadeProdutos: 6,
    valorTotal: 3180.0,
    produtos: [
      { joiaId: "J001", joiaNome: "Anel de Ouro 18k", quantidade: 2, precoVenda: 680.0 },
      { joiaId: "J002", joiaNome: "Brincos de Prata", quantidade: 4, precoVenda: 180.0 },
      { joiaId: "J003", joiaNome: "Colar de Pérolas", quantidade: 3, precoVenda: 420.0 },
      { joiaId: "J004", joiaNome: "Pulseira de Ouro", quantidade: 3, precoVenda: 520.0 },
    ],
  },
  {
    id: "M003",
    codigo: "MST-2023-015",
    dataRecebimento: "2023-12-28",
    quantidadePecas: 8,
    quantidadeProdutos: 4,
    valorTotal: 2240.0,
    produtos: [
      { joiaId: "J003", joiaNome: "Colar de Pérolas", quantidade: 3, precoVenda: 420.0 },
      { joiaId: "J002", joiaNome: "Brincos de Prata", quantidade: 5, precoVenda: 180.0 },
    ],
  },
]

export default function RevendedorHistoricoPage() {
  const [dateFilters, setDateFilters] = useState({
    dataInicio: "",
    dataFim: "",
  })

  const filteredHistorico = mockHistorico.filter((item) => {
    if (!dateFilters.dataInicio && !dateFilters.dataFim) return true

    const itemDate = new Date(item.dataRecebimento)
    const startDate = dateFilters.dataInicio ? new Date(dateFilters.dataInicio) : null
    const endDate = dateFilters.dataFim ? new Date(dateFilters.dataFim) : null

    if (startDate && itemDate < startDate) return false
    if (endDate && itemDate > endDate) return false

    return true
  })

  const totalRecebimentos = mockHistorico.length
  const totalPecasRecebidas = mockHistorico.reduce((sum, item) => sum + item.quantidadePecas, 0)
  const valorTotalRecebido = mockHistorico.reduce((sum, item) => sum + item.valorTotal, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
    }).format(value)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="revendedor" />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading text-foreground mb-2">Historial de Recepciones</h1>
            <p className="text-muted-foreground font-body">Todos los muestrarios que has recibido</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Total de Recepciones</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{totalRecebimentos}</div>
                <p className="text-xs text-muted-foreground font-body">muestrarios recibidos</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Piezas Recibidas</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{totalPecasRecebidas}</div>
                <p className="text-xs text-muted-foreground font-body">total de piezas</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Valor Total</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{formatCurrency(valorTotalRecebido)}</div>
                <p className="text-xs text-muted-foreground font-body">valor recibido</p>
              </CardContent>
            </Card>
          </div>

          {/* Date Filters */}
          <Card className="border-border mb-8">
            <CardHeader>
              <CardTitle className="font-heading text-foreground flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros por Fecha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataInicio" className="font-body">
                    Fecha Inicio
                  </Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={dateFilters.dataInicio}
                    onChange={(e) =>
                      setDateFilters((prev) => ({
                        ...prev,
                        dataInicio: e.target.value,
                      }))
                    }
                    className="font-body"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataFim" className="font-body">
                    Fecha Fin
                  </Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={dateFilters.dataFim}
                    onChange={(e) =>
                      setDateFilters((prev) => ({
                        ...prev,
                        dataFim: e.target.value,
                      }))
                    }
                    className="font-body"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => setDateFilters({ dataInicio: "", dataFim: "" })}
                    className="px-4 py-2 text-sm font-body border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={dateFilters.dataInicio === "" && dateFilters.dataFim === ""}
                  >
                    <X className="w-4 h-4" />
                    Limpiar Filtros
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Histórico List */}
          <div className="space-y-6">
            {filteredHistorico.map((item) => (
              <HistoricoRecebimentoCard key={item.id} recebimento={item} />
            ))}
          </div>

          {filteredHistorico.length === 0 && (
            <Card className="border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Send className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-heading text-foreground mb-2">Ninguna recepción encontrada</h3>
                <p className="text-muted-foreground font-body text-center">
                  {dateFilters.dataInicio || dateFilters.dataFim
                    ? "Intenta ajustar los filtros de fecha."
                    : "Aún no has recibido ningún muestrario."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
