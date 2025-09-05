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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { manageDistributor } from "@/lib/distributors-api"
import { UserX, AlertCircle, Loader2, Info } from "lucide-react"

interface DeactivateDistributorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  distributor: {
    id: string
    name: string
    displayName?: string
    email: string
  } | null
  onDistributorUpdated?: () => void
}

export function DeactivateDistributorDialog({ 
  open, 
  onOpenChange, 
  distributor,
  onDistributorUpdated 
}: DeactivateDistributorDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleDeactivate = async () => {
    if (!distributor) return
    
    setIsLoading(true)

    try {
      console.log('⏹️ DEACTIVATE: Desativando distribuidor:', distributor.id)
      
      const result = await manageDistributor(distributor.id, 'toggle_status', {
        active: false
      })
      console.log('✅ DEACTIVATE: Resultado da API:', result)

      toast({
        title: "Distribuidor desativado com sucesso",
        description: `${distributor.displayName ?? distributor.name} não poderá mais acessar o sistema.`,
      })

      // Fechar modal
      onOpenChange(false)

      // Callback para atualizar lista
      if (onDistributorUpdated) {
        onDistributorUpdated()
      }

    } catch (error) {
      console.error("❌ DEACTIVATE: Erro ao desativar distribuidor:", error)
      toast({
        title: "Erro ao desativar distribuidor",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!distributor) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5" />
            Desativar Acesso do Distribuidor
          </DialogTitle>
          <DialogDescription>
            O distribuidor não poderá mais fazer login no sistema.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Informações do distribuidor */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="text-sm">
              <p><strong>Nome:</strong> {distributor.name}</p>
              <p><strong>Email:</strong> {distributor.email}</p>
            </div>
          </div>

          {/* Warning informativo */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Esta ação pode ser revertida através do <strong>Gerenciar Acesso</strong>.
            </AlertDescription>
          </Alert>

          {/* Confirmação de desativação */}
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Após a desativação, o distribuidor perderá o acesso imediato ao sistema.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeactivate}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Desativar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
