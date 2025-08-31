"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, Mail, Phone, MapPin, Package, TrendingUp, Calendar } from "lucide-react"
import { EditRevendedorDialog } from "./edit-revendedor-dialog"
import { DeleteRevendedorDialog } from "./delete-revendedor-dialog"

interface Revendedor {
  id: string
  nome: string
  email: string
  telefone: string
  endereco: string
  descricao: string
  quantidadePecas: number
  valorTotalPecas: number
  status: string
  dataUltimaVenda: string
  totalVendas: number
}

interface RevendedorCardProps {
  revendedor: Revendedor
}

export function RevendedorCard({ revendedor }: RevendedorCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const formatCurrency = (value: number) => {
    return `₲${value.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PY")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800 border-green-200"
      case "inativo":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ativo":
        return "Activo"
      case "inativo":
        return "Inactivo"
      default:
        return status
    }
  }

  return (
    <>
      <Card className="border-border hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-heading text-foreground text-lg">{revendedor.nome}</h3>
                <Badge className={`text-xs font-body ${getStatusColor(revendedor.status)}`}>
                  {getStatusText(revendedor.status)}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                  <Mail className="w-3 h-3" />
                  {revendedor.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                  <Phone className="w-3 h-3" />
                  {revendedor.telefone}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="w-3 h-3 mr-2" />
                  Editar Reseller
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="font-body text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Address */}
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm font-body text-muted-foreground line-clamp-2">{revendedor.endereco}</p>
            </div>

            {/* Description */}
            <p className="text-sm font-body text-muted-foreground line-clamp-2">{revendedor.descricao}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Package className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-body">Piezas</span>
                </div>
                <p className="text-lg font-heading text-foreground">{revendedor.quantidadePecas}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-body">Valor</span>
                </div>
                <p className="text-lg font-heading text-foreground">{formatCurrency(revendedor.valorTotalPecas)}</p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <p className="text-xs text-muted-foreground font-body">Total Ventas</p>
                <p className="text-sm font-heading text-foreground">{revendedor.totalVendas}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-body">Última Venta</span>
                </div>
                <p className="text-xs font-body text-muted-foreground">{formatDate(revendedor.dataUltimaVenda)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditRevendedorDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} revendedor={revendedor} />
      <DeleteRevendedorDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} revendedor={revendedor} />
    </>
  )
}
