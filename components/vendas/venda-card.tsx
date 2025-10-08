"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, Calendar, Package, Gem, DollarSign, FileText } from "lucide-react"
import { EditVendaDialog } from "./edit-venda-dialog"
import { DeleteVendaDialog } from "./delete-venda-dialog"

interface Produto {
  id: string
  name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Venda {
  id: string
  created_at: string
  total_amount: number
  notes?: string
  reseller_id: string
  products: Produto[]
}

interface VendaCardProps {
  venda: Venda
}

export function VendaCard({ venda }: VendaCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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
    <>
      <Card className="border-border hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-heading text-foreground text-lg">Venda #{venda.id}</h3>
                <Badge variant="outline" className="text-xs font-body">
                  {formatDate(venda.created_at)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                <Calendar className="w-3 h-3" />
                {formatDate(venda.created_at)}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)} className="font-body">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Venda
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="font-body text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <DollarSign className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-body">Valor</span>
                </div>
                <p className="text-lg font-heading text-foreground">{formatCurrency(venda.total_amount)}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Package className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-body">Produtos</span>
                </div>
                <p className="text-lg font-heading text-foreground">{venda.products.length}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Gem className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-body">Itens</span>
                </div>
                <p className="text-lg font-heading text-foreground">{venda.products.reduce((sum, p) => sum + p.quantity, 0)}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <DollarSign className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-body">Média</span>
                </div>
                <p className="text-lg font-heading text-foreground">
                  {formatCurrency(venda.products.length > 0 ? venda.total_amount / venda.products.length : 0)}
                </p>
              </div>
            </div>

            {/* Products List */}
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-heading text-foreground mb-2">Produtos Vendidos</h4>
              <div className="space-y-2">
                {venda.products?.map((produto) => (
                  <div key={produto.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-body text-foreground">{produto.name}</p>
                      <p className="text-xs text-muted-foreground font-body">
                        {produto.quantity}x {formatCurrency(produto.unit_price)}
                      </p>
                    </div>
                    <p className="text-sm font-heading text-foreground">
                      {formatCurrency(produto.quantity * produto.unit_price)}
                    </p>
                  </div>
                )) || <p className="text-sm text-muted-foreground">Nenhum produto encontrado</p>}
              </div>
            </div>

            {/* Observations */}
            {venda.notes && (
              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-sm font-heading text-foreground">Observações</h4>
                </div>
                <p className="text-sm font-body text-muted-foreground">{venda.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditVendaDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} venda={venda} />
      <DeleteVendaDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} venda={venda} />
    </>
  )
}
