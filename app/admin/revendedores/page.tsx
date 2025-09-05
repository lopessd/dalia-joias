"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Users, Package, TrendingUp, UserCheck } from "lucide-react"
import { RevendedorCard } from "@/components/revendedores/revendedor-card"
import { CreateRevendedorDialog } from "@/components/revendedores/create-revendedor-dialog"
import { getResellers, getResellerStats, handleSupabaseUserError } from "@/lib/users-api"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import type { ResellerProfile, ResellerStats } from "@/lib/supabase"

export default function RevendedoresPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [revendedores, setRevendedores] = useState<ResellerProfile[]>([])
  const [stats, setStats] = useState<ResellerStats | null>(null)
  const [loading, setLoading] = useState(true)
  
  // AC4, AC5: Sistema de filtros - 'ativos' por padrão
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativos' | 'inativos'>('ativos')
  
  const { toast } = useToast()
  
  // AC3, AC7: Debounce para evitar múltiplas chamadas
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // AC3, AC7: Função de carregamento com debounce
  const debouncedLoadData = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      loadData()
    }, 300)
  }, [])

  useEffect(() => {
    loadData()
    
    // AC3, AC7: Subscription para mudanças em profiles de revendedores
    console.log('📡 Configurando subscription para tempo real...')
    const channel = supabase
      .channel('revendedores-realtime')
      .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'profiles', 
            filter: 'role=eq.reseller' 
          }, 
          (payload) => {
            console.log('🔄 Mudança detectada em profiles de revendedores:', payload)
            debouncedLoadData()
          }
      )
      .subscribe((status) => {
        console.log('📡 Status da subscription:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscription ativa para tempo real')
        }
      })

    // Cleanup subscription
    return () => {
      console.log('🛑 Removendo subscription de tempo real')
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      supabase.removeChannel(channel)
    }
  }, [debouncedLoadData])

  const loadData = async () => {
    console.log('🔄 RevendedoresPage: Iniciando carregamento de dados...')
    try {
      setLoading(true)
      console.log('📞 RevendedoresPage: Fazendo chamadas das APIs...')
      
      const [resellersData, statsData] = await Promise.all([
        getResellers(),
        getResellerStats()
      ])
      
      console.log('✅ RevendedoresPage: Dados recebidos:', {
        resellersCount: resellersData?.length,
        resellers: resellersData,
        stats: statsData
      })
      
      setRevendedores(resellersData)
      setStats(statsData)
    } catch (error: unknown) {
      console.error('❌ RevendedoresPage: Erro ao carregar dados:', error)
      const errorMessage = handleSupabaseUserError(error)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      console.log('🏁 RevendedoresPage: Carregamento finalizado')
    }
  }

  // AC4, AC5: Lógica de filtro combinada com busca
  const filteredRevendedores = revendedores.filter((revendedor) => {
    const matchesSearch = revendedor.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'todos' || 
      (filterStatus === 'ativos' && revendedor.active) ||
      (filterStatus === 'inativos' && !revendedor.active)
    
    return matchesSearch && matchesFilter
  })

  // AC5: Calcular estatísticas baseadas no filtro aplicado
  const getFilteredStats = () => {
    let filtered = revendedores
    if (filterStatus === 'ativos') {
      filtered = revendedores.filter(r => r.active)
    } else if (filterStatus === 'inativos') {
      filtered = revendedores.filter(r => !r.active)
    }
    
    return {
      totalRevendedores: filtered.length,
      revendedoresAtivos: filtered.filter(r => r.active).length,
      revendedoresInativos: filtered.filter(r => !r.active).length
    }
  }

  const filteredStats = getFilteredStats()
  
  // Usar stats filtradas ou stats globais
  const totalRevendedores = filteredStats.totalRevendedores
  const revendedoresAtivos = filteredStats.revendedoresAtivos  
  const revendedoresInativos = filteredStats.revendedoresInativos

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
              <h1 className="text-3xl font-heading text-foreground mb-2">Gestión de Distribuidores</h1>
              <p className="text-muted-foreground font-body">Control completo de distribuidores y sus actividades</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2 font-body">
              <Plus className="w-4 h-4" />
              Nuevo Distribuidor
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Total de Distribuidores</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <div className="text-2xl font-heading text-foreground">{totalRevendedores}</div>
                )}
                <p className="text-xs text-muted-foreground font-body">distribuidores registrados</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Distribuidores Activos</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <div className="text-2xl font-heading text-foreground">{revendedoresAtivos}</div>
                )}
                <div className="text-xs text-green-600 font-body">
                  {loading ? (
                    <Skeleton className="h-3 w-12" />
                  ) : (
                    `${totalRevendedores > 0 ? ((revendedoresAtivos / totalRevendedores) * 100).toFixed(0) : 0}% del total`
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Distribuidores Inactivos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <div className="text-2xl font-heading text-foreground">{revendedoresInativos}</div>
                )}
                <p className="text-xs text-muted-foreground font-body">distribuidores inactivos</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Últimos 30 días</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <div className="text-2xl font-heading text-foreground">-</div>
                )}
                <p className="text-xs text-muted-foreground font-body">datos no disponibles</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="border-border mb-8">
            <CardHeader>
              <CardTitle className="font-heading text-foreground flex items-center gap-2">
                <Search className="w-4 h-4" />
                Buscar y Filtrar Distribuidores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="search" className="font-body">
                    Nombre o Email
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Ingrese nombre o email del distribuidor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 font-body"
                    />
                  </div>
                </div>
                
                {/* AC4: Filtros por status */}
                <div className="space-y-2 min-w-[180px]">
                  <Label htmlFor="status-filter" className="font-body">
                    Estado
                  </Label>
                  <Select value={filterStatus} onValueChange={(value: 'todos' | 'ativos' | 'inativos') => setFilterStatus(value)}>
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativos">Solo Activos</SelectItem>
                      <SelectItem value="inativos">Solo Inactivos</SelectItem>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end gap-2">
                  <Button variant="outline" onClick={() => {setSearchTerm(""); setFilterStatus('ativos')}} className="font-body">
                    Limpiar
                  </Button>
                </div>
              </div>
              
              {/* Indicador de filtro aplicado */}
              {(searchTerm || filterStatus !== 'ativos') && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-body text-muted-foreground">
                    Mostrando {filteredRevendedores.length} de {revendedores.length} distribuidores
                    {searchTerm && ` • Buscando: "${searchTerm}"`}
                    {filterStatus === 'ativos' && " • Solo activos"}
                    {filterStatus === 'inativos' && " • Solo inactivos"}
                    {filterStatus === 'todos' && " • Todos los estados"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revendedores Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 6 }, (_, i) => (
                <Card key={i} className="border-border">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                      <div className="flex justify-between items-center mt-4">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Real data
              filteredRevendedores.map((revendedor) => (
                <RevendedorCard key={revendedor.id} revendedor={revendedor} onUpdate={loadData} />
              ))
            )}
          </div>

          {!loading && filteredRevendedores.length === 0 && (
            <Card className="border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-heading text-foreground mb-2">Ningún distribuidor encontrado</h3>
                <p className="text-muted-foreground font-body text-center">
                  {searchTerm
                    ? "Intente ajustar el término de búsqueda o crear un nuevo distribuidor."
                    : "Comience creando su primer distribuidor."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <CreateRevendedorDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  )
}
