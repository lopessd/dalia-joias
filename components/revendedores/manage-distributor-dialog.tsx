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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { manageDistributor } from "@/lib/distributors-api"
import { Settings, Key, Eye, EyeOff, Copy, Check, Loader2, AlertCircle } from "lucide-react"

interface ManageDistributorDialogProps {
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

export function ManageDistributorDialog({ 
  open, 
  onOpenChange, 
  distributor,
  onDistributorUpdated 
}: ManageDistributorDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeStatus, setActiveStatus] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordCopied, setPasswordCopied] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [showGeneratedPassword, setShowGeneratedPassword] = useState(false)

  // Atualizar status quando distribuidor muda
  useEffect(() => {
    if (distributor) {
      setActiveStatus(distributor.active)
    }
  }, [distributor])

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleGeneratePassword = () => {
    const password = generateRandomPassword()
    setNewPassword(password)
    setGeneratedPassword(password)
    setShowGeneratedPassword(true)
  }

  const handleCopyPassword = async () => {
    if (generatedPassword) {
      try {
        await navigator.clipboard.writeText(generatedPassword)
        setPasswordCopied(true)
        setTimeout(() => setPasswordCopied(false), 2000)
        toast({
          title: "Senha copiada!",
          description: "A senha foi copiada para a área de transferência.",
        })
      } catch (error) {
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar a senha.",
          variant: "destructive",
        })
      }
    }
  }

  const handleToggleStatus = async () => {
  if (!distributor) return
    
    setIsLoading(true)

    try {
      console.log('🚀 MANAGE: Alterando status do distribuidor...')
      console.log('📊 MANAGE: Novo status:', !activeStatus)
      
      const result = await manageDistributor(distributor.id, 'toggle_status', {
        active: !activeStatus
      })
      console.log('✅ MANAGE: Resultado da API:', result)

      setActiveStatus(!activeStatus)

      toast({
        title: `Distribuidor ${!activeStatus ? 'ativado' : 'desativado'} com sucesso!`,
  description: `${distributor.displayName ?? distributor.name} foi ${!activeStatus ? 'ativado' : 'desativado'}.`,
      })

      // Callback para atualizar lista
      if (onDistributorUpdated) {
        onDistributorUpdated()
      }

    } catch (error) {
      console.error("❌ MANAGE: Erro ao alterar status:", error)
      toast({
        title: "Erro ao alterar status",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!distributor || !newPassword.trim()) return
    
    if (newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)

    try {
      console.log('🚀 MANAGE: Alterando senha do distribuidor...')
      
      const result = await manageDistributor(distributor.id, 'reset_password', {
        newPassword: newPassword.trim()
      })
      console.log('✅ MANAGE: Resultado da API:', result)

      // Se o perfil estava inativo, ativar após alterar a senha
      if (!activeStatus) {
        console.log('🔄 MANAGE: Ativando distribuidor após alteração de senha...')
        await manageDistributor(distributor.id, 'toggle_status', {
          active: true
        })
        setActiveStatus(true)
        
        toast({
          title: "Distribuidor ativado com sucesso. Nova senha definida.",
    description: `${distributor.displayName ?? distributor.name} foi ativado e pode agora acessar o sistema.`,
        })
      } else {
        toast({
          title: "Senha alterada com sucesso!",
    description: `Nova senha definida para ${distributor.displayName ?? distributor.name}.`,
        })
      }

      // Limpar campos
      setNewPassword("")
      setGeneratedPassword("")
      setShowGeneratedPassword(false)
      setShowPassword(false)

      // Callback para atualizar lista
      if (onDistributorUpdated) {
        onDistributorUpdated()
      }

    } catch (error) {
      console.error("❌ MANAGE: Erro ao alterar senha:", error)
      toast({
        title: "Erro ao alterar senha",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    if (distributor) {
      setActiveStatus(distributor.active)
    }
    setNewPassword("")
    setGeneratedPassword("")
    setShowGeneratedPassword(false)
    setShowPassword(false)
    setPasswordCopied(false)
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
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gerenciar Acesso
          </DialogTitle>
          <DialogDescription>
            Gerencie o acesso e senha do distribuidor.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações do distribuidor */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Distribuidor:</p>
              <Badge variant={activeStatus ? "default" : "secondary"}>
                {activeStatus ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Nome:</strong> {distributor.name}</p>
              <p><strong>Email:</strong> {distributor.email}</p>
            </div>
          </div>

          {/* Controle de Status */}
          <div className="space-y-3">
            <div className="space-y-3">
              <div>
                <Label className="text-base font-medium">
                  {activeStatus ? "Perfil Ativo - Gerenciar Acesso" : "Perfil Inativo - Ativar Acesso"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {activeStatus 
                    ? "Distribuidor pode acessar o sistema normalmente" 
                    : "Para ativar este distribuidor, é necessário definir uma nova senha"
                  }
                </p>
              </div>
              
              {!activeStatus && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Ativação obrigatória:</strong> O distribuidor só será ativado após a senha ser alterada com sucesso.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Controle de Senha */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <Label className="text-base font-medium">Nova Senha</Label>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeneratePassword}
                  disabled={isLoading}
                  size="sm"
                >
                  Gerar Senha Segura
                </Button>
                {showGeneratedPassword && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPassword}
                    disabled={isLoading}
                  >
                    {passwordCopied ? (
                      <><Check className="mr-2 h-4 w-4" /> Copiado</>
                    ) : (
                      <><Copy className="mr-2 h-4 w-4" /> Copiar</>
                    )}
                  </Button>
                )}
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite uma nova senha (mín. 6 caracteres)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {newPassword && newPassword.length < 6 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    A senha deve ter pelo menos 6 caracteres
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="button"
                onClick={handleResetPassword}
                disabled={isLoading || !newPassword.trim() || newPassword.length < 6}
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {activeStatus ? "Alterar Senha" : "Ativar Acesso"}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
