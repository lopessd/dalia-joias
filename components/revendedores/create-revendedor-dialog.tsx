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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CreateRevendedorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateRevendedorDialog({ open, onOpenChange }: CreateRevendedorDialogProps) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
    endereco: "",
    descricao: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Nuevo distribuidor creado:", formData)
      setIsLoading(false)
      onOpenChange(false)
      // Reset form
      setFormData({
        nome: "",
        email: "",
        senha: "",
        telefone: "",
        endereco: "",
        descricao: "",
      })
    }, 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Crear Nuevo Distribuidor</DialogTitle>
          <DialogDescription className="font-body">
            Complete los datos del nuevo distribuidor para agregarlo al sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="font-body">
                Nombre Completo *
              </Label>
              <Input
                id="nome"
                placeholder="Ej: María Silva"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
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
                required
                className="font-body"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="senha" className="font-body">
                Contraseña *
              </Label>
              <Input
                id="senha"
                type="password"
                placeholder="Ingrese una contraseña segura"
                value={formData.senha}
                onChange={(e) => handleInputChange("senha", e.target.value)}
                required
                className="font-body"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone" className="font-body">
                Teléfono *
              </Label>
              <Input
                id="telefone"
                placeholder="+595 971 123456"
                value={formData.telefone}
                onChange={(e) => handleInputChange("telefone", e.target.value)}
                required
                className="font-body"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco" className="font-body">
              Dirección Completa *
            </Label>
            <Input
              id="endereco"
              placeholder="Calle, número, barrio, ciudad, departamento"
              value={formData.endereco}
              onChange={(e) => handleInputChange("endereco", e.target.value)}
              required
              className="font-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao" className="font-body">
              Descripción
            </Label>
            <Textarea
              id="descricao"
              placeholder="Describa el perfil del distribuidor, especialidades, etc..."
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
              rows={3}
              className="font-body"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="font-body">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="font-body">
              {isLoading ? "Creando..." : "Crear Distribuidor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
