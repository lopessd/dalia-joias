"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, Send, Calendar, Package } from "lucide-react"

interface Transaction {
  id: string
  joiaId: string
  joiaNome: string
  tipo: "entrada" | "saida" | "envio"
  quantidade: number
  motivo: string
  data: string
  valor: number
}

interface TransactionCardProps {
  transaction: Transaction
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "entrada":
        return <ArrowUp className="w-4 h-4 text-green-600" />
      case "saida":
        return <ArrowDown className="w-4 h-4 text-red-600" />
      case "envio":
        return <Send className="w-4 h-4 text-blue-600" />
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
      case "envio":
        return "bg-blue-100 text-blue-800 border-blue-200"
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
      case "envio":
        return "Envio"
      default:
        return type
    }
  }

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getTypeIcon(transaction.tipo)}
              <h3 className="font-heading text-foreground">{transaction.joiaNome}</h3>
              <Badge className={`text-xs font-body ${getTypeColor(transaction.tipo)}`}>
                {getTypeText(transaction.tipo)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground font-body mb-2">{transaction.motivo}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(transaction.data)}
              </div>
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                {transaction.quantidade} un
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-heading text-foreground">{formatCurrency(transaction.valor)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
