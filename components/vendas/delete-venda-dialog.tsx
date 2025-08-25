"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Produto {
  id: string
  nome: string
  quantidade: number
  precoUnitario: number
}

interface Venda {
  id: string
  data: string
  valor: number
  quantidadeProdutos: number
  quantidadeJoias: number
  observacoes: string
  produtos: Produto[]
}

interface DeleteVendaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  venda: Venda
}

export function DeleteVendaDialog({ open, onOpenChange, venda }: DeleteVendaDialogProps) {
  const { toast } = useToast()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const handleDelete = () => {
    // Here you would typically send the delete request to your API
    console.log("Excluindo venda:", venda.id)

    toast({
      title: "Sucesso",
      description: "Venda excluída com sucesso!",
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="font-heading">Excluir Venda</DialogTitle>
              <DialogDescription className="font-body">Esta ação não pode ser desfeita.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-heading text-foreground mb-2">Detalhes da Venda</h4>
            <div className="space-y-2 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="text-foreground">#{venda.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data:</span>
                <span className="text-foreground">{formatDate(venda.data)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor:</span>
                <span className="text-foreground font-heading">{formatCurrency(venda.valor)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Produtos:</span>
                <span className="text-foreground">{venda.quantidadeProdutos}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Joias:</span>
                <span className="text-foreground">{venda.quantidadeJoias}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <p className="text-sm font-body text-destructive">
              <strong>Atenção:</strong> Ao excluir esta venda, os produtos voltarão para o seu estoque automaticamente.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="font-body">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="font-body">
              Excluir Venda
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
