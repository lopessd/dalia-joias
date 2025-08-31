"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, FileText, Eye, Calendar, Package, User, DollarSign } from "lucide-react"
import { ViewMostruarioDialog } from "./view-mostruario-dialog"

interface Produto {
  joiaId: string
  joiaNome: string
  quantidade: number
  precoVenda: number
}

interface Mostruario {
  id: string
  codigo: string
  revendedorId: string
  revendedorNome: string
  dataEnvio: string
  quantidadePecas: number
  quantidadeProdutos: number
  valorTotal: number
  status: string
  produtos: Produto[]
}

interface MostruarioCardProps {
  mostruario: Mostruario
}

export function MostruarioCard({ mostruario }: MostruarioCardProps) {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const formatCurrency = (value: number) => {
    return `₲${value.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PY")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "enviado":
        return "bg-green-100 text-green-800 border-green-200"
      case "pendente":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "enviado":
        return "Enviado"
      case "pendente":
        return "Pendiente"
      case "cancelado":
        return "Cancelado"
      default:
        return status
    }
  }

  const handleExportPDF = () => {
    // In a real app, this would generate and download a PDF
    console.log("Exportando PDF del muestrario:", mostruario.codigo)
    alert(`PDF del muestrario ${mostruario.codigo} sería generado aquí`)
  }

  return (
    <>
      <Card className="border-border hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-heading text-foreground text-lg">{mostruario.codigo}</h3>
                <Badge className={`text-xs font-body ${getStatusColor(mostruario.status)}`}>
                  {getStatusText(mostruario.status)}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                  <User className="w-3 h-3" />
                  {mostruario.revendedorNome}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                  <Calendar className="w-3 h-3" />
                  {formatDate(mostruario.dataEnvio)}
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
                <DropdownMenuItem onClick={() => setIsViewDialogOpen(true)} className="font-body">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF} className="font-body">
                  <FileText className="mr-2 h-4 w-4" />
                  Exportar PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Package className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-body">Piezas</span>
                </div>
                <p className="text-lg font-heading text-foreground">{mostruario.quantidadePecas}</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Package className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-body">Productos</span>
                </div>
                <p className="text-lg font-heading text-foreground">{mostruario.quantidadeProdutos}</p>
              </div>
            </div>

            {/* Total Value */}
            <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-body">Valor Total</span>
              </div>
              <p className="text-xl font-heading text-primary">{formatCurrency(mostruario.valorTotal)}</p>
            </div>

            {/* Products Preview */}
            <div className="space-y-2">
              <h4 className="text-sm font-heading text-foreground">Productos:</h4>
              <div className="space-y-1">
                {mostruario.produtos.slice(0, 2).map((produto, index) => (
                  <div key={index} className="flex justify-between items-center text-xs font-body">
                    <span className="text-muted-foreground truncate">{produto.joiaNome}</span>
                    <span className="text-foreground">{produto.quantidade}x</span>
                  </div>
                ))}
                {mostruario.produtos.length > 2 && (
                  <p className="text-xs text-muted-foreground font-body">
                    +{mostruario.produtos.length - 2} productos...
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ViewMostruarioDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} mostruario={mostruario} />
    </>
  )
}
