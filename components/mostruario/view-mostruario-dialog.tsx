"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, Package, DollarSign, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

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

interface ViewMostruarioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mostruario: Mostruario
}

export function ViewMostruarioDialog({ open, onOpenChange, mostruario }: ViewMostruarioDialogProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
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
        return "Pendente"
      case "cancelado":
        return "Cancelado"
      default:
        return status
    }
  }

  const handleExportPDF = () => {
    console.log("Exportando PDF do mostruário:", mostruario.codigo)
    alert(`PDF do mostruário ${mostruario.codigo} seria gerado aqui`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="font-heading flex items-center gap-2">
                {mostruario.codigo}
                <Badge className={`text-xs font-body ${getStatusColor(mostruario.status)}`}>
                  {getStatusText(mostruario.status)}
                </Badge>
              </DialogTitle>
              <DialogDescription className="font-body">Detalhes completos do mostruário</DialogDescription>
            </div>
            <Button onClick={handleExportPDF} variant="outline" className="gap-2 font-body bg-transparent">
              <FileText className="w-4 h-4" />
              Exportar PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading text-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Revendedor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-body text-foreground">{mostruario.revendedorNome}</p>
                <p className="text-sm text-muted-foreground font-body">ID: {mostruario.revendedorId}</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data de Envio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-body text-foreground">{formatDate(mostruario.dataEnvio)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-heading text-foreground">{mostruario.quantidadePecas}</p>
                <p className="text-sm text-muted-foreground font-body">Total de Peças</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-heading text-foreground">{mostruario.quantidadeProdutos}</p>
                <p className="text-sm text-muted-foreground font-body">Produtos Diferentes</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-heading text-foreground">{formatCurrency(mostruario.valorTotal)}</p>
                <p className="text-sm text-muted-foreground font-body">Valor Total</p>
              </CardContent>
            </Card>
          </div>

          {/* Products List */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-heading text-foreground">Lista Detalhada de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mostruario.produtos.map((produto, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-muted rounded-lg border border-border"
                  >
                    <div className="flex-1">
                      <h4 className="font-heading text-foreground">{produto.joiaNome}</h4>
                      <p className="text-sm text-muted-foreground font-body">Código: {produto.joiaId}</p>
                      <p className="text-sm text-muted-foreground font-body">
                        Preço unitário: {formatCurrency(produto.precoVenda)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-heading text-foreground">{produto.quantidade}x</p>
                      <p className="text-sm font-heading text-foreground">
                        {formatCurrency(produto.quantidade * produto.precoVenda)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-heading text-foreground">Total Geral:</p>
                  <p className="text-xl font-heading text-primary">{formatCurrency(mostruario.valorTotal)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
