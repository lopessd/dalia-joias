"use client"

// DEV: Cache buster - 2025-09-01-14:30:00
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { createDistributor, checkEmailExists, type CreateDistributorData } from "@/lib/distributors-api"
import { Eye, EyeOff, AlertCircle, Copy, Check } from "lucide-react"

interface CreateRevendedorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDistributorCreated?: () => void
}

export function CreateRevendedorDialog({ 
  open, 
  onOpenChange,
  onDistributorCreated 
}: CreateRevendedorDialogProps) {
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    description: "",
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [generatePassword, setGeneratePassword] = useState(true)
  const [emailError, setEmailError] = useState("")
  const [createdPassword, setCreatedPassword] = useState("")
  const [showCreatedPassword, setShowCreatedPassword] = useState(false)
  const [passwordCopied, setPasswordCopied] = useState(false)

  const handleEmailBlur = async () => {
    if (!formData.email) return
    
    try {
      const exists = await checkEmailExists(formData.email)
      if (exists) {
        setEmailError("Este email já está sendo usado no sistema")
      } else {
        setEmailError("")
      }
    } catch (error) {
      console.error("Erro ao verificar email:", error)
    }
  }

  const copyPassword = async () => {
    if (createdPassword) {
      await navigator.clipboard.writeText(createdPassword)
      setPasswordCopied(true)
      setTimeout(() => setPasswordCopied(false), 2000)
      toast({
        title: "Senha copiada!",
        description: "A senha foi copiada para a área de transferência.",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      description: "",
    })
    setEmailError("")
    setCreatedPassword("")
    setShowCreatedPassword(false)
    setPasswordCopied(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    console.log('🎯 FORM SUBMIT: Evento preventDefault chamado')

    try {
      console.log('🚀 FORM SUBMIT: Iniciando submissão do formulário...')
      console.log('📊 FORM SUBMIT: Estado atual do formData:', formData)
      
      // Validar campos obrigatórios
      if (!formData.name.trim()) {
        throw new Error("Nombre es obligatorio")
      }
      if (!formData.email.trim()) {
        throw new Error("Email é obrigatório")
      }
      if (emailError) {
        throw new Error("Corrija o erro de email antes de continuar")
      }

      // Preparar dados para criação
      const distributorData: CreateDistributorData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        description: formData.description.trim() || undefined,
        password: generatePassword ? undefined : formData.password || undefined,
      }

      console.log('📝 FORM SUBMIT: Dados preparados para criação:', distributorData)
      console.log('🔧 FORM SUBMIT: Verificando função createDistributor:', typeof createDistributor)

      // Crear distribuidor
      console.log('🔄 FORM SUBMIT: Prestes a chamar createDistributor API...')
      
      if (typeof createDistributor !== 'function') {
        console.error('❌ FORM SUBMIT: createDistributor não é uma função!', createDistributor)
        throw new Error('Erro interno: função createDistributor não encontrada')
      }
      
      const result = await createDistributor(distributorData)
      console.log('✅ FORM SUBMIT: Resultado da API:', result)
      
      // Mostrar senha gerada
      setCreatedPassword(result.password)
      setShowCreatedPassword(true)

      toast({
        title: "¡Distribuidor creado con éxito!",
        description: `Conta criada para ${result.user.email}. A senha foi gerada automaticamente.`,
      })

      // Callback para atualizar lista
      if (onDistributorCreated) {
        onDistributorCreated()
      }

    } catch (error) {
      console.error("Error al crear distribuidor:", error)
      toast({
        title: "Error al crear distribuidor",
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Limpar erro de email quando o usuário digitar
    if (field === "email" && emailError) {
      setEmailError("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
                    <DialogTitle className="font-heading">Crear Nuevo Distribuidor</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Complete los datos del nuevo distribuidor para agregarlo al sistema.
          </DialogDescription>
        </DialogHeader>

        {showCreatedPassword ? (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>¡Distribuidor creado con éxito!</strong>
                <br />
                A senha foi gerada automaticamente. Anote ou copie a senha abaixo - ela só será exibida uma vez.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label className="font-body">Senha gerada:</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={createdPassword}
                  type="text"
                  readOnly
                  className="font-mono font-bold text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyPassword}
                  className="flex-shrink-0"
                >
                  {passwordCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                onClick={() => handleDialogClose(false)} 
                className="font-body"
              >
                Fechar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-body">
                  Nombre Completo *
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: Maria Silva"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="font-body"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-body">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="maria@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={handleEmailBlur}
                  required
                  className="font-body"
                />
                {emailError && (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {emailError}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="generatePassword"
                  checked={generatePassword}
                  onChange={(e) => setGeneratePassword(e.target.checked)}
                />
                <Label htmlFor="generatePassword" className="font-body text-sm">
                  Gerar senha automaticamente (recomendado)
                </Label>
              </div>
            </div>

            {!generatePassword && (
              <div className="space-y-2">
                <Label htmlFor="password" className="font-body">
                  Senha personalizada *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required={!generatePassword}
                    minLength={6}
                    className="font-body pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

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
                Descripción
              </Label>
              <Textarea
                id="description"
                placeholder="Describa el perfil del distribuidor, especialidades, etc..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                className="font-body"
              />
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
                disabled={isLoading || !!emailError} 
                className="font-body"
              >
                {isLoading ? "Creando..." : "Crear Distribuidor"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
