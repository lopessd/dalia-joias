"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, Plus, Minus, Send, Package } from "lucide-react"
import { EditJoiaDialog } from "./edit-joia-dialog"
import { StockMovementDialog } from "./stock-movement-dialog"
import { StockManagementDialog } from "./stock-management-dialog"
import { DeleteJoiaDialog } from "./delete-joia-dialog"
import type { ProductWithDetails, Category } from "@/lib/supabase"

interface JoiaCardProps {
  joia: ProductWithDetails
  onDataChange?: () => void
}

export function JoiaCard({ joia, onDataChange }: JoiaCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false)
  const [isStockManagementDialogOpen, setIsStockManagementDialogOpen] = useState(false)
  const [stockMovementType, setStockMovementType] = useState<"entrada" | "saida" | "envio">("entrada")

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getStatusColor = (active: boolean) => {
    return active 
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getStatusText = (active: boolean) => {
    return active ? "Ativo" : "Inativo"
  }

  const handleStockMovement = (type: "entrada" | "saida" | "envio") => {
    setStockMovementType(type)
    setIsStockDialogOpen(true)
  }

  return (
    <>
      <Card className="border-border hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-heading text-foreground text-lg">{joia.name}</h3>
                <Badge className={`text-xs font-body ${getStatusColor(joia.active)}`}>
                  {getStatusText(joia.active)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-body">Código: {joia.code}</p>
              <p className="text-sm text-muted-foreground font-body">{joia.category?.name || 'Sem categoria'}</p>
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
                  Editar Joia
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setIsStockManagementDialogOpen(true)} 
                  className="font-body"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Gerenciar Estoque
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
          <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden">
            <img 
              src={joia.photos[0]?.image || "/placeholder.svg"} 
              alt={joia.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground font-body">Custo</p>
                <p className="text-sm font-heading text-foreground">{formatCurrency(joia.cost_price)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-body">Venda</p>
                <p className="text-sm font-heading text-foreground">
                  {joia.selling_price ? formatCurrency(joia.selling_price) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditJoiaDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        joia={joia}
        onSuccess={onDataChange}
      />
      <DeleteJoiaDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        joia={joia}
        onSuccess={onDataChange}
      />
      <StockMovementDialog
        open={isStockDialogOpen}
        onOpenChange={setIsStockDialogOpen}
        joia={joia}
        type={stockMovementType}
        onSuccess={onDataChange}
      />
      <StockManagementDialog
        open={isStockManagementDialogOpen}
        onOpenChange={setIsStockManagementDialogOpen}
        joia={joia}
        onSuccess={onDataChange}
      />
    </>
  )
}
