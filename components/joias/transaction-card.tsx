"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, Send, Calendar, Package } from "lucide-react"
import type { InventoryMovement } from "@/lib/inventory-api"
import { formatCurrency } from "@/lib/currency"

interface TransactionCardProps {
  movement: InventoryMovement
}

export function TransactionCard({ movement }: TransactionCardProps) {


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Determinar tipo baseado na quantidade
  const getMovementType = (quantity: number) => {
    if (quantity > 0) return 'entrada'
    if (quantity < 0) return 'saida'
    return 'neutro'
  }

  const tipo = getMovementType(movement.quantity)
  const quantidadeAbs = Math.abs(movement.quantity)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "entrada":
        return <ArrowUp className="w-4 h-4 text-green-600" />
      case "saida":
        return <ArrowDown className="w-4 h-4 text-red-600" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "entrada":
        return "bg-green-100 text-green-800 border-green-200"
      case "saida":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "entrada":
        return "Entrada"
      case "saida":
        return "Saída"
      default:
        return "Movimentação"
    }
  }

  // Calcular valor baseado na quantidade e preço
  const calcularValor = () => {
    const produto = movement.product
    if (!produto) return 0
    
    const preco = produto.selling_price || produto.cost_price
    return quantidadeAbs * preco
  }

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getTypeIcon(tipo)}
              <h3 className="font-heading text-foreground">
                {movement.product?.name || 'Produto não encontrado'}
              </h3>
              <Badge className={`text-xs font-body ${getTypeColor(tipo)}`}>
                {getTypeText(tipo)}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground font-body mb-2">
              {movement.reason}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(movement.created_at)}
              </div>
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                {quantidadeAbs} un
              </div>
              {movement.product?.code && (
                <div>
                  Código: {movement.product.code}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-lg font-heading text-foreground">
              {formatCurrency(calcularValor())}
            </p>
            {movement.product?.category && (
              <p className="text-xs text-muted-foreground font-body">
                {movement.product.category.name}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
