"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Package, DollarSign, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ViewRecebimentoDialog } from "./view-recebimento-dialog"

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

interface HistoricoRecebimentoCardProps {
  recebimento: Recebimento
}

export function HistoricoRecebimentoCard({ recebimento }: HistoricoRecebimentoCardProps) {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

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
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-heading text-foreground">{recebimento.codigo}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-body mt-1">
                <Calendar className="w-3 h-3" />
                {formatDate(recebimento.dataRecebimento)}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsViewDialogOpen(true)} className="gap-2 font-body">
              <Eye className="w-4 h-4" />
              Ver Detalhes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-body">Peças</span>
              </div>
              <p className="text-lg font-heading text-foreground">{recebimento.quantidadePecas}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-body">Produtos</span>
              </div>
              <p className="text-lg font-heading text-foreground">{recebimento.quantidadeProdutos}</p>
            </div>
            <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-body">Valor</span>
              </div>
              <p className="text-lg font-heading text-primary">{formatCurrency(recebimento.valorTotal)}</p>
            </div>
          </div>

          {/* Products Preview */}
          <div className="mt-4">
            <h4 className="text-sm font-heading text-foreground mb-2">Produtos Recebidos:</h4>
            <div className="space-y-1">
              {recebimento.produtos.slice(0, 3).map((produto, index) => (
                <div key={index} className="flex justify-between items-center text-sm font-body">
                  <span className="text-muted-foreground truncate">{produto.joiaNome}</span>
                  <span className="text-foreground">{produto.quantidade}x</span>
                </div>
              ))}
              {recebimento.produtos.length > 3 && (
                <p className="text-xs text-muted-foreground font-body">
                  +{recebimento.produtos.length - 3} produtos...
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
