"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Package, DollarSign } from "lucide-react"
import { type ShowcaseHistoryItem } from "@/lib/showcase-history-api"
import { formatCurrency } from "@/lib/currency"

interface ViewRecebimentoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recebimento: ShowcaseHistoryItem
}

export function ViewRecebimentoDialog({ open, onOpenChange, recebimento }: ViewRecebimentoDialogProps) {


  const formatDate = (dateString: string) => {
    // Criar data considerando o fuso horário local para evitar problemas de conversão
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      timeZone: "America/Asuncion"
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-heading">{recebimento.code}</DialogTitle>
          <DialogDescription className="font-body">Detalhes completos do recebimento</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Header Info */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-heading text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data de Recebimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-body text-foreground">{formatDate(recebimento.created_at)}</p>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card className="border-border">
              <CardContent className="p-3 sm:p-4 text-center">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xl sm:text-2xl font-heading text-foreground">{recebimento.total_pieces}</p>
                <p className="text-xs sm:text-sm text-muted-foreground font-body">Total de Peças</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-3 sm:p-4 text-center">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xl sm:text-2xl font-heading text-foreground">{recebimento.total_products}</p>
                <p className="text-xs sm:text-sm text-muted-foreground font-body">Produtos Diferentes</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-3 sm:p-4 text-center">
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xl sm:text-2xl font-heading text-foreground">{formatCurrency(recebimento.total_value)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground font-body">Valor Total</p>
              </CardContent>
            </Card>
          </div>

          {/* Products List */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-heading text-foreground">Lista Detalhada de Produtos</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-3">
                {recebimento.products.map((produto, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-muted rounded-lg border border-border gap-2 sm:gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading text-foreground text-sm sm:text-base truncate">{produto.product_name}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground font-body">Código: {produto.product_code}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground font-body">
                        Preço unitário: {formatCurrency(produto.selling_price || 0)}
                      </p>
                    </div>
                    <div className="flex justify-between sm:block sm:text-right shrink-0">
                      <div className="sm:mb-1">
                        <p className="text-base sm:text-lg font-heading text-foreground">{produto.quantity}x</p>
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-heading text-foreground">
                          {formatCurrency(produto.quantity * (produto.selling_price || 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <p className="text-base sm:text-lg font-heading text-foreground">Total Geral:</p>
                  <p className="text-lg sm:text-xl font-heading text-primary">{formatCurrency(recebimento.total_value)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
