"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Package, DollarSign, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ViewRecebimentoDialog } from "./view-recebimento-dialog"
import { type ShowcaseHistoryItem } from "@/lib/showcase-history-api"
import { formatCurrency } from "@/lib/currency"

interface HistoricoRecebimentoCardProps {
  recebimento: ShowcaseHistoryItem
}

export function HistoricoRecebimentoCard({ recebimento }: HistoricoRecebimentoCardProps) {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)



  const formatDate = (dateString: string) => {
    // Criar data considerando o fuso horário local para evitar problemas de conversão
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      timeZone: "America/Asuncion"
    })
  }

  return (
    <>
      <Card className="border-border hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-heading text-foreground">{recebimento.code}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-body mt-1">
                <Calendar className="w-3 h-3" />
                {formatDate(recebimento.created_at)}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsViewDialogOpen(true)} className="gap-2 font-body">
              <Eye className="w-4 h-4" />
              Ver Detalles
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-body">Piezas</span>
              </div>
              <p className="text-lg font-heading text-foreground">{recebimento.total_pieces}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-body">Productos</span>
              </div>
              <p className="text-lg font-heading text-foreground">{recebimento.total_products}</p>
            </div>
            <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-body">Valor</span>
              </div>
              <p className="text-lg font-heading text-primary">{formatCurrency(recebimento.total_value)}</p>
            </div>
          </div>

          {/* Products Preview */}
          <div className="mt-4">
            <h4 className="text-sm font-heading text-foreground mb-2">Productos Recibidos:</h4>
            <div className="space-y-1">
              {recebimento.products.slice(0, 3).map((produto, index) => (
                <div key={index} className="flex justify-between items-center text-sm font-body">
                  <span className="text-muted-foreground truncate">{produto.product_name}</span>
                  <span className="text-foreground">{produto.quantity}x</span>
                </div>
              ))}
              {recebimento.products.length > 3 && (
                <p className="text-xs text-muted-foreground font-body">
                  +{recebimento.products.length - 3} productos...
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ViewRecebimentoDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} recebimento={recebimento} />
    </>
  )
}
