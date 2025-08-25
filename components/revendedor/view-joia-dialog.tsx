"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Package } from "lucide-react"

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

interface ViewJoiaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  joia: Joia
}

export function ViewJoiaDialog({ open, onOpenChange, joia }: ViewJoiaDialogProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const calcularMargem = () => {
    const margem = ((joia.precoVenda - joia.precoCusto) / joia.precoCusto) * 100
    return margem.toFixed(1)
  }

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % joia.fotos.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + joia.fotos.length) % joia.fotos.length)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{joia.nome}</DialogTitle>
          <DialogDescription className="font-body">Visualização completa da joia</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Photo Gallery */}
          <div className="relative">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={joia.fotos[currentPhotoIndex] || "/placeholder.svg"}
                alt={`${joia.nome} - Foto ${currentPhotoIndex + 1}`}
                className="w-full h-full object-cover"
              />
            </div>

            {joia.fotos.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
                  onClick={prevPhoto}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
                  onClick={nextPhoto}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Photo indicators */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {joia.fotos.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentPhotoIndex ? "bg-primary" : "bg-background/50"
                      }`}
                      onClick={() => setCurrentPhotoIndex(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Joia Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground font-body">Código</p>
                <p className="font-heading text-foreground">{joia.codigo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-body">Categoria</p>
                <p className="font-heading text-foreground">{joia.categoria}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground font-body">Descrição</p>
              <p className="font-body text-foreground">{joia.descricao}</p>
            </div>

            {/* Pricing Details */}
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <h4 className="font-heading text-foreground">Informações de Preço</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground font-body">Preço de Custo</p>
                  <p className="text-lg font-heading text-foreground">{formatCurrency(joia.precoCusto)}</p>
                  <p className="text-xs text-muted-foreground font-body">Não editável</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-body">Preço de Venda</p>
                  <p className="text-lg font-heading text-primary">{formatCurrency(joia.precoVenda)}</p>
                  <p className="text-xs text-green-600 font-body">Margem: +{calcularMargem()}%</p>
                </div>
              </div>
            </div>

            {/* Stock Info */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-muted-foreground" />
                <span className="font-heading text-foreground">Estoque Atual</span>
              </div>
              <span className="text-xl font-heading text-foreground">{joia.quantidade} unidades</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
