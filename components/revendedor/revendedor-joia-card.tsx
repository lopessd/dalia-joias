"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Eye, Edit, Package } from "lucide-react"
import { ViewJoiaDialog } from "./view-joia-dialog"
import { EditPrecoDialog } from "./edit-preco-dialog"
import { formatCurrency } from "@/lib/currency"

interface Joia {
  id: string
  codigo: string
  nome: string
  categoria: string
  descricao: string
  precoCusto: number
  precoVenda: number
  quantidade: number
  fotos: string[]
}

interface RevendedorJoiaCardProps {
  joia: Joia
  onPriceUpdate?: () => void
}

export function RevendedorJoiaCard({ joia, onPriceUpdate }: RevendedorJoiaCardProps) {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditPrecoDialogOpen, setIsEditPrecoDialogOpen] = useState(false)

  const handlePriceSave = (novoPreco: number) => {
    // Atualizar o preço localmente se necessário
    if (onPriceUpdate) {
      onPriceUpdate()
    }
  }



  const calcularMargem = () => {
    if (joia.precoCusto <= 0) return "0.0"
    const margem = ((joia.precoVenda - joia.precoCusto) / joia.precoCusto) * 100
    return margem.toFixed(1)
  }

  const getMargemColor = () => {
    const margem = parseFloat(calcularMargem())
    if (margem > 0) return "text-green-600"
    if (margem < 0) return "text-red-600"
    return "text-muted-foreground"
  }

  return (
    <>
      <Card className="border-border hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-heading text-foreground text-lg mb-2">{joia.nome}</h3>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-body">Código: {joia.codigo}</p>
                <p className="text-sm text-muted-foreground font-body">{joia.categoria}</p>
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
                  Ver Joia
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditPrecoDialogOpen(true)} className="font-body">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Precio
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="aspect-[2/1] bg-muted rounded-lg mb-2 overflow-hidden">
            <img src={joia.fotos[0] || "/placeholder.svg"} alt={joia.nome} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-body text-muted-foreground line-clamp-2">{joia.descricao}</p>

            {/* Pricing Info */}
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg border border-border/50">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-body">Costo</span>
                <span className="text-sm font-heading text-foreground font-medium">{formatCurrency(joia.precoCusto)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-body">Venta</span>
                <span className="text-sm font-heading text-primary font-semibold">{formatCurrency(joia.precoVenda)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground font-body">Margem</span>
                <span className={`text-sm font-heading font-medium ${getMargemColor()}`}>
                  {parseFloat(calcularMargem()) >= 0 ? '+' : ''}{calcularMargem()}%
                </span>
              </div>
            </div>

            {/* Stock Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-body text-muted-foreground">Stock</span>
              </div>
              <span className="text-sm font-heading text-foreground">{joia.quantidade} un</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ViewJoiaDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} joia={joia} />
      <EditPrecoDialog 
        open={isEditPrecoDialogOpen} 
        onOpenChange={setIsEditPrecoDialogOpen} 
        joia={joia} 
        onSave={handlePriceSave}
      />
    </>
  )
}
