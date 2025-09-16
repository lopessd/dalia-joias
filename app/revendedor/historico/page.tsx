"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Filter, Calendar, Package, Send, X } from "lucide-react"
import { HistoricoRecebimentoCard } from "@/components/revendedor/historico-recebimento-card"
import { useAuth } from "@/components/auth/auth-context"
import { getShowcaseHistory, getShowcaseHistoryStats, handleShowcaseHistoryError, type ShowcaseHistoryItem, type ShowcaseHistoryStats } from "@/lib/showcase-history-api"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/currency"


export default function RevendedorHistoricoPage() {
  const [dateFilters, setDateFilters] = useState({
    dataInicio: "",
    dataFim: "",
  })

  const [historico, setHistorico] = useState<ShowcaseHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ShowcaseHistoryStats>({ total_showcases: 0, total_pieces: 0, total_value: 0 })
  
  const { user } = useAuth()
  const { toast } = useToast()



  // Carregar dados do histórico
  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.id) return
      
      try {
        setLoading(true)
        const [historyData, statsData] = await Promise.all([
          getShowcaseHistory(user.id, dateFilters.dataInicio, dateFilters.dataFim),
          getShowcaseHistoryStats(user.id, dateFilters.dataInicio, dateFilters.dataFim)
        ])
        
        setHistorico(historyData)
        setStats(statsData)
      } catch (error) {
        const errorMessage = handleShowcaseHistoryError(error)
        toast({
          title: "Erro ao carregar histórico",
          description: errorMessage,
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [user?.id, dateFilters.dataInicio, dateFilters.dataFim, toast])

  const filteredHistorico = historico

  const { total_showcases: totalRecebimentos, total_pieces: totalPecasRecebidas, total_value: valorTotalRecebido } = stats

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
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-heading text-foreground">{totalRecebimentos}</div>
                )}
                <p className="text-xs text-muted-foreground font-body">muestrarios recibidos</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Piezas Recibidas</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-heading text-foreground">{totalPecasRecebidas}</div>
                )}
                <p className="text-xs text-muted-foreground font-body">total de piezas</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Valor Total</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-heading text-foreground">{formatCurrency(valorTotalRecebido)}</div>
                )}
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
                    onClick={() => {
                      setDateFilters({ dataInicio: "", dataFim: "" })
                    }}
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
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="border-border">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredHistorico.map((item) => (
                <HistoricoRecebimentoCard key={item.id} recebimento={item} />
              ))
            )}
          </div>

          {!loading && filteredHistorico.length === 0 && (
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
