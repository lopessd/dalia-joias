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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Revendedor {
  id: string
  nome: string
  email: string
  telefone: string
  endereco: string
  descricao: string
  quantidadePecas: number
  valorTotalPecas: number
  status: string
  dataUltimaVenda: string
  totalVendas: number
}

interface EditRevendedorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  revendedor: Revendedor
}

export function EditRevendedorDialog({ open, onOpenChange, revendedor }: EditRevendedorDialogProps) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    descricao: "",
    status: "ativo",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (revendedor) {
      setFormData({
        nome: revendedor.nome,
        email: revendedor.email,
        telefone: revendedor.telefone,
        endereco: revendedor.endereco,
        descricao: revendedor.descricao,
        status: revendedor.status,
      })
    }
  }, [revendedor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Revendedor editado:", { id: revendedor.id, ...formData })
      setIsLoading(false)
      onOpenChange(false)
    }, 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Editar Revendedor</DialogTitle>
          <DialogDescription className="font-body">
            Edite os dados do revendedor. O email não pode ser alterado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="font-body">
                Nome Completo *
              </Label>
              <Input
                id="nome"
                placeholder="Ex: Maria Silva"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                required
                className="font-body"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-body">
                Email
              </Label>
              <Input id="email" type="email" value={formData.email} disabled className="font-body bg-muted" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone" className="font-body">
                Telefone *
              </Label>
              <Input
                id="telefone"
                placeholder="(11) 99999-9999"
                value={formData.telefone}
                onChange={(e) => handleInputChange("telefone", e.target.value)}
                required
                className="font-body"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger className="font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco" className="font-body">
              Endereço Completo *
            </Label>
            <Input
              id="endereco"
              placeholder="Rua, número, bairro, cidade, estado"
              value={formData.endereco}
              onChange={(e) => handleInputChange("endereco", e.target.value)}
              required
              className="font-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao" className="font-body">
              Descrição
            </Label>
            <Textarea
              id="descricao"
              placeholder="Descreva o perfil do revendedor, especialidades, etc..."
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
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
