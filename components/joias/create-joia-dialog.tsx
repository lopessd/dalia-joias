"use client"

import React from "react"

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
import { Upload, X, Settings } from "lucide-react"
import { createProduct, addProductPhotos, handleSupabaseError, validateImageUrl } from '@/lib/products-api'
import { getCategories } from '@/lib/categories-api'
import { useToast } from '@/hooks/use-toast'
import { CategoryManager } from './category-manager'
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Category } from '@/lib/supabase'

interface CreateJoiaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  onSuccess: () => void
}

export function CreateJoiaDialog({ open, onOpenChange, categories, onSuccess }: CreateJoiaDialogProps) {
  const [localCategories, setLocalCategories] = useState<Category[]>(categories)
  const [formData, setFormData] = useState({
    code: "",
    category_id: "0",
    name: "",
    cost_price: "",
    selling_price: "",
  })
  const [fotos, setFotos] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Atualizar categorias locais quando as props mudarem
  useEffect(() => {
    setLocalCategories(categories)
  }, [categories])

  // Função para recarregar categorias
  const handleCategoriesChange = async () => {
    try {
      const updatedCategories = await getCategories()
      setLocalCategories(updatedCategories)
      onSuccess() // Também atualiza as categorias na página principal
    } catch (error) {
      console.error('Erro ao recarregar categorias:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validar campos obrigatórios
      if (!formData.code || !formData.name || !formData.cost_price) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive"
        })
        return
      }

      // Criar produto
      const newProduct = await createProduct({
        code: formData.code,
        name: formData.name,
        cost_price: Number(formData.cost_price),
        selling_price: formData.selling_price ? Number(formData.selling_price) : null,
        category_id: formData.category_id && formData.category_id !== "0" ? Number(formData.category_id) : null,
        active: true
      })

      // Adicionar fotos se houver
      if (fotos.length > 0) {
        await addProductPhotos(newProduct.id, fotos)
      }

      toast({
        title: "Sucesso",
        description: "Joia criada com sucesso!",
        variant: "default"
      })

      // Reset form e fechar dialog
      resetForm()
      onOpenChange(false)
      onSuccess() // Callback para recarregar dados

    } catch (error: any) {
      console.error('Erro ao criar joia:', error)
      const errorMessage = handleSupabaseError(error)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      code: "",
      category_id: "0",
      name: "",
      cost_price: "",
      selling_price: "",
    })
    setFotos([])
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addFoto = () => {
    const url = prompt("Digite a URL da imagem:")
    if (url && validateImageUrl(url)) {
      setFotos((prev) => [...prev, url])
    } else if (url) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL de imagem válida",
        variant: "destructive"
      })
    }
  }

  const removeFoto = (index: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Criar Nova Joia</DialogTitle>
          <DialogDescription className="font-body">
            Preencha os dados da nova joia para adicionar ao estoque.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="joia" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="joia">Dados da Joia</TabsTrigger>
            <TabsTrigger value="categorias">
              <Settings className="w-4 h-4 mr-2" />
              Gerenciar Categorias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="joia" className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="font-body">
                    Código da Joia *
                  </Label>
                  <Input
                    id="code"
                    placeholder="Ex: AN001"
                    value={formData.code}
                    onChange={(e) => handleInputChange("code", e.target.value)}
                    required
                    className="font-body"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-body">Categoria</Label>
                  <Select value={formData.category_id} onValueChange={(value) => handleInputChange("category_id", value)}>
                    <SelectTrigger className="font-body">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Nenhuma categoria</SelectItem>
                      {localCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="font-body">
                  Nome *
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: Anel de Ouro 18k"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="font-body"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost_price" className="font-body">
                    Preço de Custo *
                  </Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.cost_price}
                    onChange={(e) => handleInputChange("cost_price", e.target.value)}
                    required
                    className="font-body"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selling_price" className="font-body">
                    Preço de Venda
                  </Label>
                  <Input
                    id="selling_price"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.selling_price}
                    onChange={(e) => handleInputChange("selling_price", e.target.value)}
                    className="font-body"
                  />
                </div>
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
                <p className="text-xs text-muted-foreground font-body">Adicione até 4 fotos da joia</p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="font-body">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="font-body">
                  {isLoading ? "Criando..." : "Criar Joia"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="categorias" className="mt-6">
            <CategoryManager 
              categories={localCategories} 
              onCategoriesChange={handleCategoriesChange} 
            />
            <Separator className="my-4" />
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                className="font-body"
              >
                Fechar
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
