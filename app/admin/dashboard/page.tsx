"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/sidebar"
import { Gem, Users, Package, TrendingUp, DollarSign, ShoppingBag, Send, AlertCircle } from "lucide-react"

export default function AdminDashboard() {
  // Mock data - in a real app, this would come from an API
  const dashboardData = {
    totalJoias: 1247,
    valorTotalEstoque: 89750.0,
    totalRevendedores: 23,
    joisasComRevendedores: 342,
    vendasMes: 156,
    faturamentoMes: 45230.0,
    mostruariosEnviados: 18,
    joisasBaixoEstoque: 12,
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="admin" />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading text-foreground mb-2">Dashboard Administrativo</h1>
            <p className="text-muted-foreground font-body">Visão geral do sistema Dalia Joyas</p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Total de Joias</CardTitle>
                <Gem className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{dashboardData.totalJoias.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground font-body">peças em estoque</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Valor Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">
                  {formatCurrency(dashboardData.valorTotalEstoque)}
                </div>
                <p className="text-xs text-muted-foreground font-body">valor em estoque</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Revendedores</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{dashboardData.totalRevendedores}</div>
                <p className="text-xs text-muted-foreground font-body">revendedores ativos</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Joias Enviadas</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">
                  {dashboardData.joisasComRevendedores.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground font-body">com revendedores</p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Vendas do Mês</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{dashboardData.vendasMes}</div>
                <p className="text-xs text-green-600 font-body">+12% vs mês anterior</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Faturamento</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">
                  {formatCurrency(dashboardData.faturamentoMes)}
                </div>
                <p className="text-xs text-green-600 font-body">+8% vs mês anterior</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Mostruários</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{dashboardData.mostruariosEnviados}</div>
                <p className="text-xs text-muted-foreground font-body">enviados este mês</p>
              </CardContent>
            </Card>

            <Card className="border-border border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Baixo Estoque</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-orange-600">{dashboardData.joisasBaixoEstoque}</div>
                <p className="text-xs text-orange-600 font-body">joias precisam reposição</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading text-foreground">Atividades Recentes</CardTitle>
                <CardDescription className="font-body">Últimas movimentações do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-body text-foreground">Nova joia cadastrada</p>
                      <p className="text-xs text-muted-foreground font-body">Anel de Ouro 18k - há 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-body text-foreground">Mostruário enviado</p>
                      <p className="text-xs text-muted-foreground font-body">Para Maria Silva - há 4 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-body text-foreground">Novo revendedor</p>
                      <p className="text-xs text-muted-foreground font-body">João Santos cadastrado - há 6 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-body text-foreground">Estoque baixo</p>
                      <p className="text-xs text-muted-foreground font-body">Brincos de Prata - há 8 horas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading text-foreground">Top Revendedores</CardTitle>
                <CardDescription className="font-body">Melhores performances do mês</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xs font-heading text-primary-foreground">1</span>
                      </div>
                      <div>
                        <p className="text-sm font-body text-foreground">Maria Silva</p>
                        <p className="text-xs text-muted-foreground font-body">45 vendas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-heading text-foreground">{formatCurrency(12450)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                        <span className="text-xs font-heading text-secondary-foreground">2</span>
                      </div>
                      <div>
                        <p className="text-sm font-body text-foreground">Ana Costa</p>
                        <p className="text-xs text-muted-foreground font-body">38 vendas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-heading text-foreground">{formatCurrency(9870)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-xs font-heading text-accent-foreground">3</span>
                      </div>
                      <div>
                        <p className="text-sm font-body text-foreground">Carla Mendes</p>
                        <p className="text-xs text-muted-foreground font-body">32 vendas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-heading text-foreground">{formatCurrency(8230)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted-foreground rounded-full flex items-center justify-center">
                        <span className="text-xs font-heading text-background">4</span>
                      </div>
                      <div>
                        <p className="text-sm font-body text-foreground">Lucia Santos</p>
                        <p className="text-xs text-muted-foreground font-body">28 vendas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-heading text-foreground">{formatCurrency(7150)}</p>
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
