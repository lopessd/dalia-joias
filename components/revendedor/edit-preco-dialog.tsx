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
import { Card, CardContent } from "@/components/ui/card"

interface Joia {
  id: string
  codigo: string
  nome: string
  categoria: string
  descricao: string
  precoCusto: number
  precoVenda: number
  quantidade: number
  fotos: string[]
}

interface EditPrecoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  joia: Joia
}

export function EditPrecoDialog({ open, onOpenChange, joia }: EditPrecoDialogProps) {
  const [novoPreco, setNovoPreco] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (joia) {
      setNovoPreco(joia.precoVenda.toString())
    }
  }, [joia])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const calcularMargem = (precoVenda: number) => {
    const margem = ((precoVenda - joia.precoCusto) / joia.precoCusto) * 100
    return margem.toFixed(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const precoNumerico = Number.parseFloat(novoPreco)

    if (precoNumerico <= joia.precoCusto) {
      alert("O preço de venda deve ser maior que o preço de custo!")
      setIsLoading(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      console.log("Preço atualizado:", {
        joiaId: joia.id,
        precoAnterior: joia.precoVenda,
        novoPreco: precoNumerico,
      })
      setIsLoading(false)
      onOpenChange(false)
    }, 1000)
  }

  const precoNumerico = Number.parseFloat(novoPreco) || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Editar Preço de Venda</DialogTitle>
          <DialogDescription className="font-body">
            Ajuste o preço de venda da joia. O preço de custo não pode ser alterado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Joia Info */}
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <img
                  src={joia.fotos[0] || "/placeholder.svg"}
                  alt={joia.nome}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-heading text-foreground">{joia.nome}</h4>
                  <p className="text-sm text-muted-foreground font-body">Código: {joia.codigo}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-body">Preço de Custo</Label>
                <Input value={formatCurrency(joia.precoCusto)} disabled className="font-body bg-muted" />
                <p className="text-xs text-muted-foreground font-body">Não editável</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="novoPreco" className="font-body">
                  Preço de Venda *
                </Label>
                <Input
                  id="novoPreco"
                  type="number"
                  step="0.01"
                  min={joia.precoCusto + 0.01}
                  placeholder="0,00"
                  value={novoPreco}
                  onChange={(e) => setNovoPreco(e.target.value)}
                  required
                  className="font-body"
                />
              </div>
            </div>

            {/* Preview */}
            {precoNumerico > 0 && (
              <Card className="border-border bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-heading text-foreground mb-2">Preview</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-body text-muted-foreground">Novo preço:</span>
                      <span className="font-heading text-primary">{formatCurrency(precoNumerico)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-body text-muted-foreground">Nova margem:</span>
                      <span
                        className={`font-heading ${
                          precoNumerico > joia.precoCusto ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {precoNumerico > joia.precoCusto ? "+" : ""}
                        {calcularMargem(precoNumerico)}%
                      </span>
                    </div>
                    {precoNumerico <= joia.precoCusto && (
                      <p className="text-xs text-red-600 font-body">Atenção: Preço deve ser maior que o custo!</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="font-body">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || precoNumerico <= joia.precoCusto} className="font-body">
                {isLoading ? "Salvando..." : "Salvar Preço"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
