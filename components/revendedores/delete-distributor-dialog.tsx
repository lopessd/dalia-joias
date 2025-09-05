"use client"

import type React from "react"
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
import { AlertTriangle, Loader2 } from "lucide-react"

interface DeleteDistributorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  distributor: {
    id: string
    name: string
    displayName?: string
    email: string
    active: boolean
  } | null
  onDistributorUpdated?: () => void
}

export function DeleteDistributorDialog({ 
  open, 
  onOpenChange, 
  distributor,
  onDistributorUpdated 
}: DeleteDistributorDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleDeactivate = async () => {
    if (!distributor) return
    
    setIsLoading(true)

    try {
      console.log('🚀 DELETE: Iniciando desativação do distribuidor...')
  console.log('📊 DELETE: Distribuidor:', distributor.email)
      
      // Desativar distribuidor
      console.log('🔄 DELETE: Chamando manageDistributor API para desativar...')
      const result = await manageDistributor(distributor.id, 'toggle_status', {
        active: false
      })
      console.log('✅ DELETE: Resultado da API:', result)

      toast({
        title: "Distribuidor desativado com sucesso!",
        description: `${distributor.displayName ?? distributor.name} foi desativado e não poderá mais acessar o sistema.`,
      })

      // Callback para atualizar lista
      if (onDistributorUpdated) {
        onDistributorUpdated()
      }

      // Fechar modal
      onOpenChange(false)

    } catch (error) {
      console.error("❌ DELETE: Erro ao desativar distribuidor:", error)
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
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Desativar Distribuidor
          </DialogTitle>
          <DialogDescription>
            Esta ação irá desativar o distribuidor, impedindo o acesso ao sistema.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Atenção:</strong> O distribuidor será desativado e não poderá mais fazer login no sistema. 
              Esta ação pode ser revertida posteriormente reativando o perfil.
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Distribuidor a ser desativado:</p>
            <div className="text-sm text-muted-foreground">
              <p><strong>Nome:</strong> {distributor.name}</p>
              <p><strong>Email:</strong> {distributor.email}</p>
              <p><strong>Status atual:</strong> {distributor.active ? 'Ativo' : 'Inativo'}</p>
            </div>
          </div>
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
            disabled={isLoading || !distributor.active}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {distributor.active ? 'Desativar Distribuidor' : 'Já está inativo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
