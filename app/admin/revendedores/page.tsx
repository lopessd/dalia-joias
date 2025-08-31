"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Search, Users, Package, TrendingUp, UserCheck } from "lucide-react"
import { RevendedorCard } from "@/components/revendedores/revendedor-card"
import { CreateRevendedorDialog } from "@/components/revendedores/create-revendedor-dialog"

// Mock data
const mockRevendedores = [
  {
    id: "R001",
    nome: "Maria Silva",
    email: "maria.silva@email.com",
    telefone: "(11) 99999-1234",
    endereco: "Rua das Flores, 123 - São Paulo, SP",
    descricao: "Revendedora especializada em joias femininas",
    quantidadePecas: 45,
    valorTotalPecas: 12450.0,
    status: "ativo",
    dataUltimaVenda: "2024-01-15",
    totalVendas: 156,
  },
  {
    id: "R002",
    nome: "Ana Costa",
    email: "ana.costa@email.com",
    telefone: "(11) 98888-5678",
    endereco: "Av. Principal, 456 - Rio de Janeiro, RJ",
    descricao: "Foco em joias de prata e acessórios",
    quantidadePecas: 32,
    valorTotalPecas: 8960.0,
    status: "ativo",
    dataUltimaVenda: "2024-01-14",
    totalVendas: 89,
  },
  {
    id: "R003",
    nome: "Carla Mendes",
    email: "carla.mendes@email.com",
    telefone: "(11) 97777-9012",
    endereco: "Rua do Comércio, 789 - Belo Horizonte, MG",
    descricao: "Especialista em joias de ouro e semijoias",
    quantidadePecas: 28,
    valorTotalPecas: 7840.0,
    status: "ativo",
    dataUltimaVenda: "2024-01-13",
    totalVendas: 67,
  },
  {
    id: "R004",
    nome: "Lucia Santos",
    email: "lucia.santos@email.com",
    telefone: "(11) 96666-3456",
    endereco: "Praça Central, 321 - Salvador, BA",
    descricao: "Revendedora com foco em mercado local",
    quantidadePecas: 15,
    valorTotalPecas: 4200.0,
    status: "inativo",
    dataUltimaVenda: "2024-01-10",
    totalVendas: 34,
  },
]

export default function RevendedoresPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const filteredRevendedores = mockRevendedores.filter(
    (revendedor) =>
      revendedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      revendedor.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalRevendedores = mockRevendedores.length
  const revendedoresAtivos = mockRevendedores.filter((r) => r.status === "ativo").length
  const totalPecasComRevendedores = mockRevendedores.reduce((sum, r) => sum + r.quantidadePecas, 0)
  const valorTotalComRevendedores = mockRevendedores.reduce((sum, r) => sum + r.valorTotalPecas, 0)

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
                <div className="text-2xl font-heading text-foreground">{totalRevendedores}</div>
                <p className="text-xs text-muted-foreground font-body">distribuidores registrados</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Distribuidores Activos</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{revendedoresAtivos}</div>
                <p className="text-xs text-green-600 font-body">
                  {((revendedoresAtivos / totalRevendedores) * 100).toFixed(0)}% del total
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Piezas con Distribuidores</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">
                  {totalPecasComRevendedores.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground font-body">piezas distribuidas</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Valor Distribuido</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading text-foreground">{formatCurrency(valorTotalComRevendedores)}</div>
                <p className="text-xs text-muted-foreground font-body">valor total en piezas</p>
              </CardContent>
            </Card>
          </div>

          {/* Search Filter */}
          <Card className="border-border mb-8">
            <CardHeader>
              <CardTitle className="font-heading text-foreground flex items-center gap-2">
                <Search className="w-4 h-4" />
                Buscar Revendedores
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
                <div className="flex items-end">
                  <Button variant="outline" onClick={() => setSearchTerm("")} className="font-body">
                    Limpiar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revendedores Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRevendedores.map((revendedor) => (
              <RevendedorCard key={revendedor.id} revendedor={revendedor} />
            ))}
          </div>

          {filteredRevendedores.length === 0 && (
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
