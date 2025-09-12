"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, Send, Package, TrendingUp, DollarSign } from "lucide-react"
import { MostruarioCard } from "@/components/mostruario/mostruario-card"
import { CreateMostruarioDialog } from "@/components/mostruario/create-mostruario-dialog"
import { getShowcases, getShowcaseMovements } from "@/lib/showcase-api"
import { getDistributors } from "@/lib/distributors-api"
import type { DistributorProfile } from "@/lib/distributors-api"
import { useToast } from "@/hooks/use-toast"
import type { ShowcaseWithDetails } from "@/lib/showcase-api"

// Dados reais do Supabase

export default function MostruarioPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRevendedor, setSelectedRevendedor] = useState("todos")
  const [dateFilters, setDateFilters] = useState({
    dataInicio: "",
    dataFim: "",
  })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [mostruarios, setMostruarios] = useState<ShowcaseWithDetails[]>([])
  const [revendedores, setRevendedores] = useState<DistributorProfile[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Carregar mostruários e revendedores do banco de dados
  useEffect(() => {
    loadShowcases()
    loadRevendedores()
  }, [])

  const loadShowcases = async () => {
    try {
      setLoading(true)
      const data = await getShowcases()
      setMostruarios(data)
    } catch (error) {
      console.error('Erro ao carregar mostruários:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os mostruários.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadRevendedores = async () => {
    try {
      const data = await getDistributors()
      // Filtrar apenas revendedores ativos
      const activeRevendedores = data.filter(distributor => distributor.active)
      setRevendedores(activeRevendedores)
    } catch (error) {
      console.error('Erro ao carregar revendedores:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os revendedores.",
        variant: "destructive",
      })
    }
  }

  const filteredMostruarios = mostruarios.filter((mostruario) => {
    const matchesSearch =
      (mostruario.code?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (mostruario.distributor_profile?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesRevendedor = selectedRevendedor === "todos" || mostruario.profile_id === selectedRevendedor
    return matchesSearch && matchesRevendedor
  })

  const totalMostruarios = mostruarios.length
  const totalPecasEnviadas = mostruarios.reduce((sum, m) => sum + (m.total_pieces || 0), 0)
  const valorTotalEnviado = mostruarios.reduce((sum, m) => sum + (m.total_value || 0), 0)


  const formatCurrency = (value: number) => {
    return `₲${value.toLocaleString()}`
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="admin" />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-heading text-foreground mb-2">Sistema de Muestrario</h1>
              <p className="text-muted-foreground font-body">Envío de joyas para distribuidores</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2 font-body">
              <Plus className="w-4 h-4" />
              Nuevo Muestrario
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Total de Muestrarios</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{totalMostruarios}</div>
                <p className="text-xs text-muted-foreground font-body">muestrarios creados</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Piezas Enviadas</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{totalPecasEnviadas.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground font-body">piezas distribuidas</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Valor Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{formatCurrency(valorTotalEnviado)}</div>
                <p className="text-xs text-muted-foreground font-body">valor enviado</p>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search" className="font-body">
                    Buscar
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Código o distribuidor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 font-body"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-body">Distribuidor</Label>
                  <Select value={selectedRevendedor} onValueChange={setSelectedRevendedor}>
                    <SelectTrigger className="font-body">
                      <SelectValue placeholder="Seleccione un distribuidor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los distribuidores</SelectItem>
                      {revendedores.map((revendedor) => (
                        <SelectItem key={revendedor.id} value={revendedor.id}>
                          {revendedor.name || revendedor.email.split('@')[0]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedRevendedor("todos")
                    setDateFilters({ dataInicio: "", dataFim: "" })
                  }}
                  className="font-body"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mostruarios Grid */}
          {loading ? (
            <Card className="border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground font-body">Cargando muestrarios...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMostruarios.map((mostruario) => (
                  <MostruarioCard key={mostruario.id} mostruario={mostruario} />
                ))}
              </div>

              {filteredMostruarios.length === 0 && (
                <Card className="border-border">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Send className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-heading text-foreground mb-2">Ningún muestrario encontrado</h3>
                    <p className="text-muted-foreground font-body text-center">
                      {searchTerm || selectedRevendedor !== "todos"
                        ? "Intente ajustar los filtros o crear un nuevo muestrario."
                        : "Comience creando su primer muestrario."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>

      <CreateMostruarioDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onMostruarioCreated={loadShowcases}
      />
    </div>
  )
}
