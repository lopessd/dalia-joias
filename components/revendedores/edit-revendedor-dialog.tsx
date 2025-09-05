"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { updateDistributorProfile, getDistributorById, type DistributorProfile } from "@/lib/distributors-api"

interface EditRevendedorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  distributorId: string | null
  onDistributorUpdated?: () => void
}

export function EditRevendedorDialog({ 
  open, 
  onOpenChange, 
  distributorId, 
  onDistributorUpdated 
}: EditRevendedorDialogProps) {
  const { toast } = useToast()
  
  const [distributor, setDistributor] = useState<DistributorProfile | null>(null)
  const [formData, setFormData] = useState({
    address: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Carregar dados do distribuidor quando o dialog abrir
  useEffect(() => {
    const loadDistributor = async () => {
      if (open && distributorId) {
        setIsLoadingData(true)
        try {
          const distributorData = await getDistributorById(distributorId)
          if (distributorData) {
            setDistributor(distributorData)
            setFormData({
              address: distributorData.address || "",
              description: distributorData.description || "",
            })
          }
        } catch (error) {
          console.error("Erro ao carregar distribuidor:", error)
          toast({
            title: "Erro ao carregar dados",
            description: "Não foi possível carregar os dados do distribuidor.",
            variant: "destructive",
          })
          onOpenChange(false)
        } finally {
          setIsLoadingData(false)
        }
      }
    }

    loadDistributor()
  }, [open, distributorId, toast, onOpenChange])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!distributorId) return
    
    setIsLoading(true)

    try {
      await updateDistributorProfile(distributorId, {
        address: formData.address.trim() || undefined,
        description: formData.description.trim() || undefined,
      })

      toast({
        title: "Distribuidor atualizado!",
        description: "Os dados do distribuidor foram atualizados com sucesso.",
      })

      onOpenChange(false)
      
      if (onDistributorUpdated) {
        onDistributorUpdated()
      }

    } catch (error) {
      console.error("Erro ao atualizar distribuidor:", error)
      toast({
        title: "Erro ao atualizar",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      address: "",
      description: "",
    })
    setDistributor(null)
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Editar Distribuidor</DialogTitle>
          <DialogDescription className="font-body">
            Edite os dados do distribuidor. O email não pode ser alterado.
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Carregando dados...</p>
            </div>
          </div>
        ) : distributor ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-body">
                Email (não editável)
              </Label>
              <Input 
                id="email" 
                type="email" 
                value={distributor.email} 
                disabled 
                className="font-body bg-muted" 
              />
              <p className="text-xs text-muted-foreground">
                O email é definido na criação da conta e não pode ser alterado.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="font-body">
                Endereço
              </Label>
              <Input
                id="address"
                placeholder="Rua, número, bairro, cidade"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="font-body"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-body">
                Descrição
              </Label>
              <Textarea
                id="description"
                placeholder="Descreva o perfil do distribuidor, especialidades, etc..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                className="font-body"
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Informações da conta:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    distributor.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {distributor.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Criado em:</span>
                  <span className="ml-2">
                    {new Date(distributor.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Para desativar/reativar a conta, use a opção de exclusão.
              </p>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleDialogClose(false)} 
                className="font-body"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="font-body"
              >
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="text-center p-8">
            <p className="text-muted-foreground">Distribuidor não encontrado.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
