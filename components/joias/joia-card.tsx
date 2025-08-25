"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, Plus, Minus, Send } from "lucide-react"
import { EditJoiaDialog } from "./edit-joia-dialog"
import { StockMovementDialog } from "./stock-movement-dialog"
import { DeleteJoiaDialog } from "./delete-joia-dialog"

interface Joia {
  id: string
  codigo: string
  nome: string
  categoria: string
  descricao: string
  precoCusto: number
  precoVenda: number
  quantidade: number
  status: string
  fotos: string[]
}

interface JoiaCardProps {
  joia: Joia
}

export function JoiaCard({ joia }: JoiaCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false)
  const [stockMovementType, setStockMovementType] = useState<"entrada" | "saida" | "envio">("entrada")

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800 border-green-200"
      case "baixo_estoque":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "inativo":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ativo":
        return "Ativo"
      case "baixo_estoque":
        return "Baixo Estoque"
      case "inativo":
        return "Inativo"
      default:
        return status
    }
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
                <h3 className="font-heading text-foreground text-lg">{joia.nome}</h3>
                <Badge className={`text-xs font-body ${getStatusColor(joia.status)}`}>
                  {getStatusText(joia.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-body">Código: {joia.codigo}</p>
              <p className="text-sm text-muted-foreground font-body">{joia.categoria}</p>
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
                <DropdownMenuItem onClick={() => handleStockMovement("entrada")} className="font-body">
                  <Plus className="mr-2 h-4 w-4" />
                  Entrada
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStockMovement("saida")} className="font-body">
                  <Minus className="mr-2 h-4 w-4" />
                  Saída
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStockMovement("envio")} className="font-body">
                  <Send className="mr-2 h-4 w-4" />
                  Envio
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
            <img src={joia.fotos[0] || "/placeholder.svg"} alt={joia.nome} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-body text-muted-foreground line-clamp-2">{joia.descricao}</p>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground font-body">Custo</p>
                <p className="text-sm font-heading text-foreground">{formatCurrency(joia.precoCusto)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-body">Venda</p>
                <p className="text-sm font-heading text-foreground">{formatCurrency(joia.precoVenda)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-body">Estoque</p>
                <p className="text-sm font-heading text-foreground">{joia.quantidade} un</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditJoiaDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} joia={joia} />
      <DeleteJoiaDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} joia={joia} />
      <StockMovementDialog
        open={isStockDialogOpen}
        onOpenChange={setIsStockDialogOpen}
        joia={joia}
        type={stockMovementType}
      />
    </>
  )
}
