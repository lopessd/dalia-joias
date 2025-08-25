"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gem, Package, DollarSign, TrendingUp, Calendar, ShoppingBag } from "lucide-react"

export default function RevendedorDashboard() {
  // Mock data - in a real app, this would come from an API
  const dashboardData = {
    quantidadeJoias: 45,
    quantidadeProdutos: 12,
    valorEstoque: 15750.0, // Valor calculado pelo preço de venda que a revendedora coloca
    vendasMes: 23,
    faturamentoMes: 8450.0,
    mediaVenda: 367.39,
    ultimoRecebimento: "2024-01-15",
    mostruariosRecebidos: 3,
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="revendedor" />

      {/* Main Content with Padding Adjustments for Mobile */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading text-foreground mb-2">Dashboard Revendedor</h1>
            <p className="text-muted-foreground font-body">Visão geral das suas joias e vendas</p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Quantidade de Joias</CardTitle>
                <Gem className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{dashboardData.quantidadeJoias}</div>
                <p className="text-xs text-muted-foreground font-body">peças em estoque</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Produtos Diferentes</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{dashboardData.quantidadeProdutos}</div>
                <p className="text-xs text-muted-foreground font-body">tipos de joias</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Valor em Estoque</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">
                  {formatCurrency(dashboardData.valorEstoque)}
                </div>
                <p className="text-xs text-muted-foreground font-body">preço de venda</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Vendas do Mês</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{dashboardData.vendasMes}</div>
                <p className="text-xs text-green-600 font-body">+15% vs mês anterior</p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Faturamento</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">
                  {formatCurrency(dashboardData.faturamentoMes)}
                </div>
                <p className="text-xs text-green-600 font-body">+12% vs mês anterior</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Média por Venda</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{formatCurrency(dashboardData.mediaVenda)}</div>
                <p className="text-xs text-muted-foreground font-body">valor médio</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Último Recebimento</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">
                  {formatDate(dashboardData.ultimoRecebimento)}
                </div>
                <p className="text-xs text-muted-foreground font-body">
                  {dashboardData.mostruariosRecebidos} mostruários este mês
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading text-foreground">Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-body text-foreground">Venda realizada</p>
                      <p className="text-xs text-muted-foreground font-body">Anel de Ouro 18k - há 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-body text-foreground">Preço atualizado</p>
                      <p className="text-xs text-muted-foreground font-body">Brincos de Prata - há 4 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-body text-foreground">Mostruário recebido</p>
                      <p className="text-xs text-muted-foreground font-body">15 peças recebidas - há 1 dia</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-body text-foreground">Venda realizada</p>
                      <p className="text-xs text-muted-foreground font-body">Colar de Pérolas - há 1 dia</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading text-foreground">Produtos Mais Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xs font-heading text-primary-foreground">1</span>
                      </div>
                      <div>
                        <p className="text-sm font-body text-foreground">Anel de Ouro 18k</p>
                        <p className="text-xs text-muted-foreground font-body">8 vendas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-heading text-foreground">{formatCurrency(5440)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                        <span className="text-xs font-heading text-secondary-foreground">2</span>
                      </div>
                      <div>
                        <p className="text-sm font-body text-foreground">Brincos de Prata</p>
                        <p className="text-xs text-muted-foreground font-body">6 vendas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-heading text-foreground">{formatCurrency(1320)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-xs font-heading text-accent-foreground">3</span>
                      </div>
                      <div>
                        <p className="text-sm font-body text-foreground">Colar de Pérolas</p>
                        <p className="text-xs text-muted-foreground font-body">4 vendas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-heading text-foreground">{formatCurrency(1890)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted-foreground rounded-full flex items-center justify-center">
                        <span className="text-xs font-heading text-background">4</span>
                      </div>
                      <div>
                        <p className="text-sm font-body text-foreground">Pulseira de Ouro</p>
                        <p className="text-xs text-muted-foreground font-body">3 vendas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-heading text-foreground">{formatCurrency(1800)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
