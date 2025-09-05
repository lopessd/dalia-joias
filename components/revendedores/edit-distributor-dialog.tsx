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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { updateDistributor, checkEmailExists } from "@/lib/distributors-api"
import { AlertCircle, Loader2 } from "lucide-react"

interface EditDistributorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  distributor: {
    id: string
    name: string
  displayName?: string
    email: string
    phone?: string
    address?: string
    description?: string
  } | null
  onDistributorUpdated?: () => void
}

export function EditDistributorDialog({ 
  open, 
  onOpenChange, 
  distributor,
  onDistributorUpdated 
}: EditDistributorDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
  })

  // Atualizar form quando distribuidor muda
  useEffect(() => {
    if (distributor) {
      setFormData({
        name: distributor.name || "",
        email: distributor.email || "",
        phone: distributor.phone || "",
        address: distributor.address || "",
        description: distributor.description || "",
      })
    }
  }, [distributor])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = async (email: string) => {
    setFormData(prev => ({ ...prev, email }))
    setEmailError("")

    if (!email.trim()) {
      setEmailError("Email é obrigatório")
      return
    }

    if (!validateEmail(email)) {
      setEmailError("Formato de email inválido")
      return
    }

    // Só verificar duplicação se o email foi alterado
    if (email.toLowerCase() !== distributor?.email?.toLowerCase()) {
      try {
        const exists = await checkEmailExists(email)
        if (exists) {
          setEmailError("Este email já está sendo usado no sistema")
        }
      } catch (error) {
        console.log("Erro ao verificar email:", error)
      }
    }
  }

  const resetForm = () => {
    if (distributor) {
      setFormData({
        name: distributor.name || "",
        email: distributor.email || "",
        phone: distributor.phone || "",
        address: distributor.address || "",
        description: distributor.description || "",
      })
    }
    setEmailError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!distributor) return
    
    setIsLoading(true)

    try {
      console.log('🚀 EDIT: Iniciando atualização do distribuidor...')
      console.log('📊 EDIT: Dados do formulário:', formData)
      
      // Validar campos obrigatórios
      if (!formData.name.trim()) {
        throw new Error("Nome é obrigatório")
      }
      if (!formData.email.trim()) {
        throw new Error("Email é obrigatório")
      }
      if (emailError) {
        throw new Error("Corrija o erro de email antes de continuar")
      }

      // Preparar dados para atualização
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        description: formData.description.trim() || undefined,
      }

      console.log('📝 EDIT: Dados preparados para atualização:', updateData)

      // Atualizar distribuidor
      console.log('🔄 EDIT: Chamando updateDistributor API...')
      const result = await updateDistributor(distributor.id, updateData)
      console.log('✅ EDIT: Resultado da API:', result)

      toast({
        title: "Distribuidor atualizado com sucesso!",
        description: `Dados de ${result.user.email} foram atualizados.`,
      })

      // Callback para atualizar lista
      if (onDistributorUpdated) {
        onDistributorUpdated()
      }

      // Fechar modal
      onOpenChange(false)

    } catch (error) {
      console.error("❌ EDIT: Erro ao atualizar distribuidor:", error)
      toast({
        title: "Erro ao atualizar distribuidor",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
          <DialogTitle>Editar Distribuidor</DialogTitle>
          <DialogDescription>
            Atualize os dados do distribuidor. Todos os campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ex: María Silva"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="maria@email.com"
                value={formData.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                required
              />
              {emailError && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {emailError}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+595 971 123456"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección Completa</Label>
            <Input
              id="address"
              type="text"
              placeholder="Calle, número, barrio, ciudad, departamento"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describa el perfil del distribuidor, especialidades, etc..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
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
              type="submit"
              disabled={isLoading || !!emailError}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Actualizar Distribuidor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
