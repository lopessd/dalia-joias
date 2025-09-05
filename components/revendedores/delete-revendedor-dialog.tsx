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
import { useToast } from "@/hooks/use-toast"
import { deactivateDistributor, reactivateDistributor, type DistributorProfile } from "@/lib/distributors-api"
import { AlertTriangle, UserX, UserCheck } from "lucide-react"

interface DeleteRevendedorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  distributor: DistributorProfile | null
  onDistributorUpdated?: () => void
}

export function DeleteRevendedorDialog({ 
  open, 
  onOpenChange, 
  distributor, 
  onDistributorUpdated 
}: DeleteRevendedorDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  if (!distributor) return null

  const isActive = distributor.active
  const actionText = isActive ? "Desativar" : "Reativar"
  const actionPastText = isActive ? "desativado" : "reativado"

  const handleAction = async () => {
    setIsLoading(true)

    try {
      if (isActive) {
        await deactivateDistributor(distributor.id)
      } else {
        await reactivateDistributor(distributor.id)
      }

      toast({
        title: `Distribuidor ${actionPastText}!`,
        description: isActive 
          ? "O distribuidor foi desativado e não poderá mais fazer login no sistema."
          : "O distribuidor foi reativado e pode fazer login no sistema novamente.",
      })

      onOpenChange(false)
      
      if (onDistributorUpdated) {
        onDistributorUpdated()
      }

    } catch (error) {
      console.error(`Erro ao ${actionText.toLowerCase()} distribuidor:`, error)
      toast({
        title: `Erro ao ${actionText.toLowerCase()}`,
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className={`font-heading flex items-center gap-2 ${
            isActive ? 'text-destructive' : 'text-green-700'
          }`}>
            {isActive ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
            {actionText} Distribuidor
          </DialogTitle>
          <DialogDescription className="font-body">
            {isActive 
              ? "O distribuidor será desativado (não excluído) e não poderá mais fazer login no sistema."
              : "O distribuidor será reativado e poderá fazer login no sistema novamente."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-muted rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-heading text-sm text-foreground">
              {distributor.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h4>
            <span className={`px-2 py-1 rounded text-xs ${
              isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isActive ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-body">Email: {distributor.email}</p>
          <p className="text-xs text-muted-foreground font-body">
            Endereço: {distributor.address || "Não informado"}
          </p>
          <p className="text-xs text-muted-foreground font-body">
            Criado em: {new Date(distributor.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {isActive ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800 font-body">
                <p><strong>Atenção:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>O distribuidor não poderá fazer login</li>
                  <li>Os dados serão preservados (soft delete)</li>
                  <li>A conta pode ser reativada posteriormente</li>
                  <li>Histórico e dados de vendas são mantidos</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-body">
              <strong>Reativação:</strong> O distribuidor poderá fazer login no sistema novamente 
              com as mesmas credenciais.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="font-body"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            variant={isActive ? "destructive" : "default"}
            onClick={handleAction} 
            disabled={isLoading} 
            className="font-body"
          >
            {isLoading ? `${actionText.replace('r', 'ndo')}...` : `${actionText} Distribuidor`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
