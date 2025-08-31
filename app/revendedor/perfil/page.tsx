"use client"

import React, { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useUserProfile } from "@/hooks/use-user-profile"
import { User, Lock, Save } from "lucide-react"

export default function RevendedorPerfilPage() {
  const { toast } = useToast()
  const { profileData, isLoading: profileLoading, updateProfile, updatePassword } = useUserProfile()
  
  const [nome, setNome] = useState("")
  const [passwordData, setPasswordData] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  })
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // Update local name when profile data loads
  useEffect(() => {
    if (profileData?.name && nome === "") {
      setNome(profileData.name)
    }
  }, [profileData, nome])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nome.trim()) {
      toast({
        title: "Error",
        description: "El nombre es requerido.",
        variant: "destructive",
      })
      return
    }

    setIsUpdatingProfile(true)
    await updateProfile(nome.trim())
    setIsUpdatingProfile(false)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate password fields
    if (!passwordData.novaSenha || !passwordData.confirmarSenha) {
      toast({
        title: "Error",
        description: "Todos los campos de contraseña son requeridos.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.novaSenha !== passwordData.confirmarSenha) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.novaSenha.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      })
      return
    }

    setIsUpdatingPassword(true)
    const success = await updatePassword(passwordData.novaSenha)
    
    if (success) {
      // Clear password fields on success
      setPasswordData({
        senhaAtual: "",
        novaSenha: "",
        confirmarSenha: "",
      })
    }
    
    setIsUpdatingPassword(false)
  }

  const handleProfileInputChange = (field: string, value: string) => {
    if (field === "nome") {
      setNome(value)
    }
  }

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
  }

  // Show loading state while profile is loading
  if (profileLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar userType="revendedor" />
        <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-heading text-foreground mb-2">Mi Perfil</h1>
              <p className="text-muted-foreground font-body">Cargando información...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="revendedor" />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading text-foreground mb-2">Mi Perfil</h1>
            <p className="text-muted-foreground font-body">Gestiona tu información personal y contraseña</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Profile Information */}
            <Card className="border-border flex flex-col">
              <CardHeader>
                <CardTitle className="font-heading text-foreground flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <form onSubmit={handleProfileSubmit} className="flex-1 flex flex-col space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="font-body">
                      Nombre Completo *
                    </Label>
                    <Input
                      id="nome"
                      placeholder="Ingresa tu nombre completo"
                      value={nome}
                      onChange={(e) => handleProfileInputChange("nome", e.target.value)}
                      required
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
                      value={profileData?.email || ""} 
                      disabled 
                      className="font-body bg-muted text-muted-foreground" 
                    />
                    <p className="text-xs text-muted-foreground font-body">
                      El correo electrónico no se puede cambiar. Contacta al administrador si es necesario.
                    </p>
                  </div>

                  <div className="mt-auto">
                    <Button 
                      type="submit" 
                      disabled={isUpdatingProfile || profileLoading} 
                      className="w-full gap-2 font-body"
                    >
                      <Save className="w-4 h-4" />
                      {isUpdatingProfile ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card className="border-border flex flex-col">
              <CardHeader>
                <CardTitle className="font-heading text-foreground flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Cambiar Contraseña
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <form onSubmit={handlePasswordSubmit} className="flex-1 flex flex-col space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="senhaAtual" className="font-body">
                      Contraseña Actual *
                    </Label>
                    <Input
                      id="senhaAtual"
                      type="password"
                      placeholder="Ingresa tu contraseña actual"
                      value={passwordData.senhaAtual}
                      onChange={(e) => handlePasswordInputChange("senhaAtual", e.target.value)}
                      required
                      className="font-body"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="novaSenha" className="font-body">
                      Nueva Contraseña *
                    </Label>
                    <Input
                      id="novaSenha"
                      type="password"
                      placeholder="Ingresa tu nueva contraseña"
                      value={passwordData.novaSenha}
                      onChange={(e) => handlePasswordInputChange("novaSenha", e.target.value)}
                      required
                      minLength={6}
                      className="font-body"
                    />
                    <p className="text-xs text-muted-foreground font-body">La contraseña debe tener al menos 6 caracteres.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmarSenha" className="font-body">
                      Confirmar Nueva Contraseña *
                    </Label>
                    <Input
                      id="confirmarSenha"
                      type="password"
                      placeholder="Confirma tu nueva contraseña"
                      value={passwordData.confirmarSenha}
                      onChange={(e) => handlePasswordInputChange("confirmarSenha", e.target.value)}
                      required
                      className="font-body"
                    />
                  </div>

                  <div className="mt-auto">
                    <Button 
                      type="submit" 
                      disabled={isUpdatingPassword || profileLoading} 
                      className="w-full gap-2 font-body"
                    >
                      <Lock className="w-4 h-4" />
                      {isUpdatingPassword ? "Cambiando..." : "Cambiar Contraseña"}
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
