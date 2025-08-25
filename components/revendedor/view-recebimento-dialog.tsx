"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Package, DollarSign } from "lucide-react"

interface Produto {
  joiaId: string
  joiaNome: string
  quantidade: number
  precoVenda: number
}

interface Recebimento {
  id: string
  codigo: string
  dataRecebimento: string
  quantidadePecas: number
  quantidadeProdutos: number
  valorTotal: number
  produtos: Produto[]
}

interface ViewRecebimentoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recebimento: Recebimento
}

export function ViewRecebimentoDialog({ open, onOpenChange, recebimento }: ViewRecebimentoDialogProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{recebimento.codigo}</DialogTitle>
          <DialogDescription className="font-body">Detalhes completos do recebimento</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-heading text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data de Recebimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-body text-foreground">{formatDate(recebimento.dataRecebimento)}</p>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-heading text-foreground">{recebimento.quantidadePecas}</p>
                <p className="text-sm text-muted-foreground font-body">Total de Peças</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-heading text-foreground">{recebimento.quantidadeProdutos}</p>
                <p className="text-sm text-muted-foreground font-body">Produtos Diferentes</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-heading text-foreground">{formatCurrency(recebimento.valorTotal)}</p>
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
                {recebimento.produtos.map((produto, index) => (
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
                  <p className="text-xl font-heading text-primary">{formatCurrency(recebimento.valorTotal)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
