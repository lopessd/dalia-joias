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

interface Revendedor {
  id: string
  nome: string
  email: string
  telefone: string
  endereco: string
  descricao: string
  quantidadePecas: number
  valorTotalPecas: number
  status: string
  dataUltimaVenda: string
  totalVendas: number
}

interface DeleteRevendedorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  revendedor: Revendedor
}

export function DeleteRevendedorDialog({ open, onOpenChange, revendedor }: DeleteRevendedorDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
    }).format(value)
  }

  const handleDelete = async () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Distribuidor eliminado:", revendedor.id)
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
            Eliminar Distribuidor
          </DialogTitle>
          <DialogDescription className="font-body">
            Esta acción no se puede deshacer. El distribuidor será eliminado permanentemente del sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-muted rounded-lg space-y-2">
          <h4 className="font-heading text-sm text-foreground">{revendedor.nome}</h4>
          <p className="text-xs text-muted-foreground font-body">Email: {revendedor.email}</p>
          <p className="text-xs text-muted-foreground font-body">Teléfono: {revendedor.telefone}</p>
          <p className="text-xs text-muted-foreground font-body">
            Piezas: {revendedor.quantidadePecas} ({formatCurrency(revendedor.valorTotalPecas)})
          </p>
          <p className="text-xs text-muted-foreground font-body">Total de ventas: {revendedor.totalVendas}</p>
        </div>

        {revendedor.quantidadePecas > 0 && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800 font-body">
              <strong>Atención:</strong> Este distribuidor posee {revendedor.quantidadePecas} piezas en stock.
              Asegúrese de recuperar las piezas antes de eliminar.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="font-body">
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading} className="font-body">
            {isLoading ? "Eliminando..." : "Eliminar Distribuidor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
