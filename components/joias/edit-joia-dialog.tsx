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
import { Upload, X } from "lucide-react"

interface Joia {
  id: string
  codigo: string
  nome: string
  categoria: string
  descricao: string
  precoCusto: number
  precoVenda: number
  quantidade: number
  status: string
  fotos: string[]
}

interface EditJoiaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  joia: Joia
}

export function EditJoiaDialog({ open, onOpenChange, joia }: EditJoiaDialogProps) {
  const [formData, setFormData] = useState({
    codigo: "",
    categoria: "",
    nome: "",
    descricao: "",
    precoCusto: "",
    precoVenda: "",
    status: "ativo",
  })
  const [fotos, setFotos] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const categories = ["Anéis", "Brincos", "Colares", "Pulseiras", "Relógios"]

  useEffect(() => {
    if (joia) {
      setFormData({
        codigo: joia.codigo,
        categoria: joia.categoria,
        nome: joia.nome,
        descricao: joia.descricao,
        precoCusto: joia.precoCusto.toString(),
        precoVenda: joia.precoVenda.toString(),
        status: joia.status,
      })
      setFotos(joia.fotos)
    }
  }, [joia])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Joia editada:", { ...formData, fotos })
      setIsLoading(false)
      onOpenChange(false)
    }, 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addFoto = () => {
    const newFoto = `/placeholder.svg?height=200&width=200&query=joia-${fotos.length + 1}`
    setFotos((prev) => [...prev, newFoto])
  }

  const removeFoto = (index: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Editar Joia</DialogTitle>
          <DialogDescription className="font-body">
            Edite os dados da joia. Código não pode ser alterado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo" className="font-body">
                Código da Joia
              </Label>
              <Input id="codigo" value={formData.codigo} disabled className="font-body bg-muted" />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Categoria *</Label>
              <Select value={formData.categoria} onValueChange={(value) => handleInputChange("categoria", value)}>
                <SelectTrigger className="font-body">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome" className="font-body">
              Nome *
            </Label>
            <Input
              id="nome"
              placeholder="Ex: Anel de Ouro 18k"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
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
              placeholder="Descreva as características da joia..."
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
              rows={3}
              className="font-body"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precoCusto" className="font-body">
                Preço de Custo *
              </Label>
              <Input
                id="precoCusto"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.precoCusto}
                onChange={(e) => handleInputChange("precoCusto", e.target.value)}
                required
                className="font-body"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precoVenda" className="font-body">
                Preço de Venda *
              </Label>
              <Input
                id="precoVenda"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.precoVenda}
                onChange={(e) => handleInputChange("precoVenda", e.target.value)}
                required
                className="font-body"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-body">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger className="font-body">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="baixo_estoque">Baixo Estoque</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-body">Fotos</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {fotos.map((foto, index) => (
                <div key={index} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src={foto || "/placeholder.svg"}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => removeFoto(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {fotos.length < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  className="aspect-square border-dashed font-body bg-transparent"
                  onClick={addFoto}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              )}
            </div>
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
