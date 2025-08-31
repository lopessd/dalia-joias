"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/sidebar"
import { Gem, Users, Package, TrendingUp, DollarSign, ShoppingBag, Send, AlertCircle } from "lucide-react"

export default function AdminDashboard() {
  
  // Currency formatting function
  const formatCurrency = (value: number) => {
    return `₲${value.toLocaleString()}`
  }
  
  // Mock data - in a real app, this would come from an API
  const dashboardData = {
    totalJoias: 1247,
    valorTotalEstoque: 89750000, // in Guaraní
    totalRevendedores: 23,
    joisasComRevendedores: 342,
    vendasMes: 156,
    faturamentoMes: 45230000, // in Guaraní
    mostruariosEnviados: 18,
    joisasBaixoEstoque: 12,
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="admin" />

      {/* Main Content */}
      <main className="flex-1 ml-64 md:ml-50 lg:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading text-foreground mb-2">Panel de Control</h1>
            <p className="text-muted-foreground font-body">Resumen general del negocio</p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Total de Joyas</CardTitle>
                <Gem className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{dashboardData.totalJoias.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground font-body">piezas en stock</p>
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
                <p className="text-xs text-muted-foreground font-body">valor del stock</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Distribuidores</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{dashboardData.totalRevendedores}</div>
                <p className="text-xs text-muted-foreground font-body">distribuidores activos</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Joyas Enviadas</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">
                  {dashboardData.joisasComRevendedores.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground font-body">con distribuidores</p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Ventas del Mes</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{dashboardData.vendasMes}</div>
                <p className="text-xs text-green-600 font-body">+12% vs mes anterior</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Facturación</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">
                  {formatCurrency(dashboardData.faturamentoMes)}
                </div>
                <p className="text-xs text-green-600 font-body">+8% este mes</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Muestrarios</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{dashboardData.mostruariosEnviados}</div>
                <p className="text-xs text-muted-foreground font-body">enviados este mes</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Stock Bajo</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-orange-600">{dashboardData.joisasBaixoEstoque}</div>
                <p className="text-xs text-orange-600 font-body">necesitan restock</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading text-foreground">Actividad Reciente</CardTitle>
                <CardDescription className="font-body">Últimas acciones en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-body text-foreground">Nueva joya agregada</p>
                      <p className="text-xs text-muted-foreground font-body">Anillo de oro agregado al inventario</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-body text-foreground">Muestrario enviado</p>
                      <p className="text-xs text-muted-foreground font-body">Muestrario enviado a María Silva</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-body text-foreground">Nuevo distribuidor</p>
                      <p className="text-xs text-muted-foreground font-body">Ana Costa se registró como distribuidora</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-body text-foreground">Stock bajo</p>
                      <p className="text-xs text-muted-foreground font-body">Pulsera de plata necesita restock</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading text-foreground">Top Distribuidores</CardTitle>
                <CardDescription className="font-body">Mejores vendedores del mes</CardDescription>
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
                        <p className="text-xs text-muted-foreground font-body">45 ventas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-heading text-foreground">{formatCurrency(12450000)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                        <span className="text-xs font-heading text-secondary-foreground">2</span>
                      </div>
                      <div>
                        <p className="text-sm font-body text-foreground">Ana Costa</p>
                        <p className="text-xs text-muted-foreground font-body">38 ventas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-heading text-foreground">{formatCurrency(9870000)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-xs font-heading text-accent-foreground">3</span>
                      </div>
                      <div>
                        <p className="text-sm font-body text-foreground">Carla Mendes</p>
                        <p className="text-xs text-muted-foreground font-body">32 ventas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-heading text-foreground">{formatCurrency(8230000)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted-foreground rounded-full flex items-center justify-center">
                        <span className="text-xs font-heading text-background">4</span>
                      </div>
                      <div>
                        <p className="text-sm font-body text-foreground">Lucia Santos</p>
                        <p className="text-xs text-muted-foreground font-body">28 ventas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-heading text-foreground">{formatCurrency(7150000)}</p>
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
