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

export default function AdminPerfil() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Mock current user data
  const [userData, setUserData] = useState({
    nome: "Administrador",
    email: "admin@sistema.com",
  })

  const [passwordData, setPasswordData] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  })

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      })
      setIsLoading(false)
    }, 1000)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
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

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com sucesso.",
      })
      setPasswordData({
        senhaAtual: "",
        novaSenha: "",
        confirmarSenha: "",
      })
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="admin" />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading text-foreground mb-2">Perfil</h1>
            <p className="text-muted-foreground font-body">Gerencie suas informações pessoais e configurações</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Information */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading text-foreground">
                  <User className="w-5 h-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="font-body">
                      Nome
                    </Label>
                    <Input
                      id="nome"
                      value={userData.nome}
                      onChange={(e) => setUserData({ ...userData, nome: e.target.value })}
                      className="font-body"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-body">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      className="font-body"
                    />
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full font-body">
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading text-foreground">
                  <Lock className="w-5 h-5" />
                  Alterar Senha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="senhaAtual" className="font-body">
                      Senha Atual
                    </Label>
                    <Input
                      id="senhaAtual"
                      type="password"
                      value={passwordData.senhaAtual}
                      onChange={(e) => setPasswordData({ ...passwordData, senhaAtual: e.target.value })}
                      className="font-body"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="novaSenha" className="font-body">
                      Nova Senha
                    </Label>
                    <Input
                      id="novaSenha"
                      type="password"
                      value={passwordData.novaSenha}
                      onChange={(e) => setPasswordData({ ...passwordData, novaSenha: e.target.value })}
                      className="font-body"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmarSenha" className="font-body">
                      Confirmar Nova Senha
                    </Label>
                    <Input
                      id="confirmarSenha"
                      type="password"
                      value={passwordData.confirmarSenha}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmarSenha: e.target.value })}
                      className="font-body"
                    />
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full font-body">
                    <Lock className="w-4 h-4 mr-2" />
                    {isLoading ? "Alterando..." : "Alterar Senha"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
