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
import { formatCurrency } from "@/lib/currency"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

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
  onSave?: (novoPreco: number) => void
}

export function EditPrecoDialog({ open, onOpenChange, joia, onSave }: EditPrecoDialogProps) {
  const [novoPreco, setNovoPreco] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [realCostPrice, setRealCostPrice] = useState<number>(0)
  const [currentResalePrice, setCurrentResalePrice] = useState<number>(0)
  const { toast } = useToast()

  // Buscar dados do usuário e preços atuais quando o modal abrir
  useEffect(() => {
    if (open && joia) {
      loadUserAndPricing()
    }
  }, [open, joia])

  const loadUserAndPricing = async () => {
    try {
      // Obter usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        })
        return
      }
      
      setCurrentUserId(user.id)

      // Buscar o preço de custo real (selling_price da tabela products)
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('selling_price')
        .eq('id', parseInt(joia.id))
        .single()

      if (productError) {
        console.error('Erro ao buscar produto:', productError)
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do produto",
          variant: "destructive"
        })
        return
      }

      const costPrice = productData.selling_price || 0
      setRealCostPrice(costPrice)

      // Buscar preço de venda atual na tabela product_pricing
      const { data: pricingData, error: pricingError } = await supabase
        .from('product_pricing')
        .select('resale_price')
        .eq('product_id', parseInt(joia.id))
        .eq('profile_id', user.id)
        .single()

      if (pricingError && pricingError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Erro ao buscar preço de venda:', pricingError)
      }

      // Se não houver preço registrado, usar o preço de custo como padrão
      const resalePrice = pricingData?.resale_price || costPrice
      setCurrentResalePrice(resalePrice)
      setNovoPreco(resalePrice.toString())

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive"
      })
    }
  }



  const calcularMargem = (precoVenda: number) => {
    if (realCostPrice <= 0) return "0.0"
    const margem = ((precoVenda - realCostPrice) / realCostPrice) * 100
    return margem.toFixed(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUserId) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      })
      return
    }

    const precoNumerico = Number.parseFloat(novoPreco)

    if (isNaN(precoNumerico) || precoNumerico <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um preço válido",
        variant: "destructive"
      })
      return
    }

    if (precoNumerico <= realCostPrice) {
      toast({
        title: "Atenção",
        description: "O preço de venda deve ser maior que o preço de custo!",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      // Verificar se já existe um registro na tabela product_pricing
      const { data: existingPricing, error: checkError } = await supabase
        .from('product_pricing')
        .select('id')
        .eq('product_id', parseInt(joia.id))
        .eq('profile_id', currentUserId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingPricing) {
        // Atualizar registro existente
        const { error: updateError } = await supabase
          .from('product_pricing')
          .update({ resale_price: precoNumerico })
          .eq('product_id', parseInt(joia.id))
          .eq('profile_id', currentUserId)

        if (updateError) throw updateError
      } else {
        // Criar novo registro
        const { error: insertError } = await supabase
          .from('product_pricing')
          .insert({
            product_id: parseInt(joia.id),
            profile_id: currentUserId,
            resale_price: precoNumerico
          })

        if (insertError) throw insertError
      }

      toast({
        title: "Sucesso",
        description: "Preço atualizado com sucesso!",
      })
      
      if (onSave) {
        onSave(precoNumerico)
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao salvar preço:', error)
      
      // Extrair mensagem de erro específica
      let errorMessage = "Erro ao salvar preço. Tente novamente."
      
      if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message
        } else if ('error' in error && typeof error.error === 'string') {
          errorMessage = error.error
        } else if ('details' in error && typeof error.details === 'string') {
          errorMessage = error.details
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
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
                <Input value={formatCurrency(realCostPrice)} disabled className="font-body bg-muted" />
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
                  min={realCostPrice + 0.01}
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
                          precoNumerico > realCostPrice ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {precoNumerico > realCostPrice ? "+" : ""}
                        {calcularMargem(precoNumerico)}%
                      </span>
                    </div>
                    {precoNumerico <= realCostPrice && (
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
              <Button type="submit" disabled={isLoading || precoNumerico <= realCostPrice} className="font-body">
                {isLoading ? "Salvando..." : "Salvar Preço"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
