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
import { hardDeleteProduct, handleSupabaseError } from '@/lib/products-api'
import { useToast } from '@/hooks/use-toast'
import type { ProductWithDetails } from '@/lib/supabase'

interface DeleteJoiaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  joia: ProductWithDetails
  onSuccess?: () => void
}

export function DeleteJoiaDialog({ open, onOpenChange, joia, onSuccess }: DeleteJoiaDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      await hardDeleteProduct(joia.id) // Exclusão real do banco de dados
      
      toast({
        title: "Sucesso",
        description: "Joia excluída com sucesso!",
        variant: "default"
      })

      onOpenChange(false)
      if (onSuccess) onSuccess()

    } catch (error: any) {
      console.error('Erro ao excluir joia:', error)
      const errorMessage = handleSupabaseError(error)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
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
            Esta ação não pode ser desfeita. A joia e todas as suas movimentações de estoque serão permanentemente removidas do sistema.
          </DialogDescription>
        </DialogHeader>        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-heading text-sm text-foreground mb-2">{joia.name}</h4>
          <p className="text-xs text-muted-foreground font-body">Código: {joia.code}</p>
          <p className="text-xs text-muted-foreground font-body">Categoria: {joia.category?.name || 'Sem categoria'}</p>
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
