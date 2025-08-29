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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, Settings } from "lucide-react"
import { updateProduct, deleteProductPhotos, addProductPhotos, getCategories, handleSupabaseError, validateImageUrl } from '@/lib/products-api'
import { getCategories as getCategoriesApi } from '@/lib/categories-api'
import { useToast } from '@/hooks/use-toast'
import { CategoryManager } from './category-manager'
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ProductWithDetails, Category } from '@/lib/supabase'

interface EditJoiaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  joia: ProductWithDetails
  onSuccess?: () => void
}

export function EditJoiaDialog({ open, onOpenChange, joia, onSuccess }: EditJoiaDialogProps) {
  const [formData, setFormData] = useState({
    code: "",
    category_id: "",
    name: "",
    cost_price: "",
    selling_price: "",
  })
  const [fotos, setFotos] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [localCategories, setLocalCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [fotosChanged, setFotosChanged] = useState(false)
  const { toast } = useToast()

  // Função para recarregar categorias
  const handleCategoriesChange = async () => {
    try {
      const updatedCategories = await getCategoriesApi()
      setCategories(updatedCategories)
      setLocalCategories(updatedCategories)
      if (onSuccess) onSuccess() // Também atualiza as categorias na página principal
    } catch (error) {
      console.error('Erro ao recarregar categorias:', error)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (joia) {
      setFormData({
        code: joia.code,
        category_id: joia.category?.id.toString() || "0",
        name: joia.name,
        cost_price: joia.cost_price.toString(),
        selling_price: joia.selling_price?.toString() || "",
      })
      setFotos(joia.photos.map(p => p.image))
      setFotosChanged(false)
    }
  }, [joia])

  const loadCategories = async () => {
    try {
      const categoriesData = await getCategories()
      setCategories(categoriesData)
      setLocalCategories(categoriesData)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
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

      // Atualizar produto
      await updateProduct(joia.id, {
        code: formData.code,
        name: formData.name,
        cost_price: Number(formData.cost_price),
        selling_price: formData.selling_price ? Number(formData.selling_price) : null,
        category_id: formData.category_id === "0" ? null : Number(formData.category_id)
      })

      // Gerenciar fotos (deletar antigas e adicionar novas se mudaram)
      if (fotosChanged) {
        await deleteProductPhotos(joia.id)
        if (fotos.length > 0) {
          await addProductPhotos(joia.id, fotos)
        }
      }

      toast({
        title: "Sucesso",
        description: "Joia atualizada com sucesso!",
        variant: "default"
      })

      onOpenChange(false)
      if (onSuccess) onSuccess()

    } catch (error: any) {
      console.error('Erro ao atualizar joia:', error)
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addFoto = () => {
    const url = prompt("Digite a URL da imagem:")
    if (url && validateImageUrl(url)) {
      setFotos((prev) => [...prev, url])
      setFotosChanged(true)
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
    setFotosChanged(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Editar Joia</DialogTitle>
          <DialogDescription className="font-body">
            Edite os dados da joia. Código não pode ser alterado.
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
                    Código da Joia
                  </Label>
                  <Input id="code" value={formData.code} disabled className="font-body bg-muted" />
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
                  <Label htmlFor="precoCusto" className="font-body">
                    Preço de Custo *
                  </Label>
                  <Input
                    id="precoCusto"
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
                  <Label htmlFor="precoVenda" className="font-body">
                    Preço de Venda *
                  </Label>
                  <Input
                    id="precoVenda"
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
