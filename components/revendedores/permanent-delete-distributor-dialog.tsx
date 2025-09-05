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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"

interface PermanentDeleteDistributorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  distributor: {
    id: string
    name: string
    displayName?: string
    email: string
  } | null
  onDistributorDeleted?: () => void
}

export function PermanentDeleteDistributorDialog({ 
  open, 
  onOpenChange, 
  distributor,
  onDistributorDeleted 
}: PermanentDeleteDistributorDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [confirmationText, setConfirmationText] = useState("")
  const [showSecondConfirmation, setShowSecondConfirmation] = useState(false)

  const isConfirmationValid = confirmationText.trim().toUpperCase() === "EXCLUIR"

  const handleFirstConfirmation = () => {
    if (isConfirmationValid) {
      setShowSecondConfirmation(true)
    }
  }

  const handlePermanentDelete = async () => {
    if (!distributor) return
    
    setIsLoading(true)

    try {
      console.log('🗑️ PERMANENT-DELETE: Iniciando exclusão permanente do distribuidor:', distributor.id)
      
      const response = await fetch(`/api/distributors/${distributor.id}/permanent-delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir distribuidor')
      }

      const result = await response.json()
      console.log('✅ PERMANENT-DELETE: Resultado da API:', result)

      toast({
        title: "Distribuidor excluído permanentemente",
        description: `${distributor.displayName ?? distributor.name} foi removido definitivamente do sistema.`,
      })

      // Fechar modal e resetar estados
      onOpenChange(false)
      resetForm()

      // Callback para atualizar lista
      if (onDistributorDeleted) {
        onDistributorDeleted()
      }

    } catch (error) {
      console.error("❌ PERMANENT-DELETE: Erro ao excluir distribuidor:", error)
      toast({
        title: "Erro ao excluir distribuidor",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setConfirmationText("")
    setShowSecondConfirmation(false)
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  if (!distributor) return null

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Excluir Distribuidor Permanentemente
          </DialogTitle>
          <DialogDescription>
            Esta ação é <strong>irreversível</strong> e removerá completamente o distribuidor do sistema.
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

          {/* Warning de exclusão permanente */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>ATENÇÃO:</strong> Esta ação é permanente e irreversível. O distribuidor será completamente removido do sistema, incluindo:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Conta de usuário</li>
                <li>Perfil e configurações</li>
                <li>Acesso ao sistema</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Campo de confirmação */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="confirmation-input" className="text-sm font-medium">
                Para confirmar, digite <strong>"EXCLUIR"</strong> no campo abaixo:
              </Label>
              <Input
                id="confirmation-input"
                type="text"
                placeholder="Digite EXCLUIR para confirmar"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                disabled={isLoading || showSecondConfirmation}
                className={isConfirmationValid ? "border-green-500" : ""}
              />
            </div>

            {/* Primeiro botão de confirmação */}
            {!showSecondConfirmation && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleFirstConfirmation}
                disabled={!isConfirmationValid || isLoading}
                className="w-full"
              >
                Confirmar Exclusão
              </Button>
            )}

            {/* Segundo botão de confirmação (só aparece após primeiro clique) */}
            {showSecondConfirmation && (
              <div className="space-y-3">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Última confirmação: Tem certeza que deseja excluir <strong>{distributor.displayName ?? distributor.name}</strong> permanentemente?
                  </AlertDescription>
                </Alert>
                
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handlePermanentDelete}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sim, excluir permanentemente
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
