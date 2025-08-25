"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { User, Lock, Save } from "lucide-react"

export default function RevendedorPerfilPage() {
  const { toast } = useToast()
  const [profileData, setProfileData] = useState({
    nome: "Maria Silva",
    email: "maria.silva@email.com",
  })

  const [passwordData, setPasswordData] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  })

  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingProfile(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Perfil atualizado:", profileData)
      setIsLoadingProfile(false)
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      })
    }, 1000)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.novaSenha !== passwordData.confirmarSenha) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.novaSenha.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      })
      return
    }

    setIsLoadingPassword(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Senha alterada")
      setIsLoadingPassword(false)
      setPasswordData({
        senhaAtual: "",
        novaSenha: "",
        confirmarSenha: "",
      })
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      })
    }, 1000)
  }

  const handleProfileInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="revendedor" />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading text-foreground mb-2">Meu Perfil</h1>
            <p className="text-muted-foreground font-body">Gerencie suas informações pessoais e senha</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Profile Information */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading text-foreground flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="font-body">
                      Nome Completo *
                    </Label>
                    <Input
                      id="nome"
                      placeholder="Digite seu nome completo"
                      value={profileData.nome}
                      onChange={(e) => handleProfileInputChange("nome", e.target.value)}
                      required
                      className="font-body"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-body">
                      Email
                    </Label>
                    <Input id="email" type="email" value={profileData.email} disabled className="font-body bg-muted" />
                    <p className="text-xs text-muted-foreground font-body">
                      O email não pode ser alterado. Entre em contato com o administrador se necessário.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoadingProfile} className="gap-2 font-body">
                      <Save className="w-4 h-4" />
                      {isLoadingProfile ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading text-foreground flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Alterar Senha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="senhaAtual" className="font-body">
                      Senha Atual *
                    </Label>
                    <Input
                      id="senhaAtual"
                      type="password"
                      placeholder="Digite sua senha atual"
                      value={passwordData.senhaAtual}
                      onChange={(e) => handlePasswordInputChange("senhaAtual", e.target.value)}
                      required
                      className="font-body"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="novaSenha" className="font-body">
                      Nova Senha *
                    </Label>
                    <Input
                      id="novaSenha"
                      type="password"
                      placeholder="Digite sua nova senha"
                      value={passwordData.novaSenha}
                      onChange={(e) => handlePasswordInputChange("novaSenha", e.target.value)}
                      required
                      minLength={6}
                      className="font-body"
                    />
                    <p className="text-xs text-muted-foreground font-body">A senha deve ter pelo menos 6 caracteres.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmarSenha" className="font-body">
                      Confirmar Nova Senha *
                    </Label>
                    <Input
                      id="confirmarSenha"
                      type="password"
                      placeholder="Confirme sua nova senha"
                      value={passwordData.confirmarSenha}
                      onChange={(e) => handlePasswordInputChange("confirmarSenha", e.target.value)}
                      required
                      className="font-body"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoadingPassword} className="gap-2 font-body">
                      <Lock className="w-4 h-4" />
                      {isLoadingPassword ? "Alterando..." : "Alterar Senha"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
