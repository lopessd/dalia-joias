"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface Joia {
  id: string
  codigo: string
  nome: string
  categoria: string
  descricao: string
  precoCusto: number
  precoVenda: number
  quantidade: number
  status: string
  fotos: string[]
}

interface DeleteJoiaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  joia: Joia
}

export function DeleteJoiaDialog({ open, onOpenChange, joia }: DeleteJoiaDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Joia excluída:", joia.id)
      setIsLoading(false)
      onOpenChange(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Excluir Joia
          </DialogTitle>
          <DialogDescription className="font-body">
            Esta ação não pode ser desfeita. A joia será permanentemente removida do sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-heading text-sm text-foreground mb-2">{joia.nome}</h4>
          <p className="text-xs text-muted-foreground font-body">Código: {joia.codigo}</p>
          <p className="text-xs text-muted-foreground font-body">Categoria: {joia.categoria}</p>
          <p className="text-xs text-muted-foreground font-body">Estoque: {joia.quantidade} unidades</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="font-body">
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading} className="font-body">
            {isLoading ? "Excluindo..." : "Excluir Joia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
