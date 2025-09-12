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
import { Settings } from "lucide-react"
import { createProduct, addProductPhotos, handleSupabaseError } from '@/lib/products-api'
import { ImageUpload } from '@/components/ui/image-upload'
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
    description: "",
    cost_price: "",
    selling_price: "",
  })
  const [fotos, setFotos] = useState<Array<{url: string, path: string, fileName: string}>>([])
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
          title: "Error",
          description: "Complete todos los campos obligatorios",
          variant: "destructive"
        })
        return
      }

      // Criar produto
      const newProduct = await createProduct({
        code: formData.code,
        name: formData.name,
        description: formData.description || null,
        cost_price: Number(formData.cost_price),
        selling_price: formData.selling_price ? Number(formData.selling_price) : null,
        category_id: formData.category_id && formData.category_id !== "0" ? Number(formData.category_id) : null,
        active: true
      })

      // Adicionar fotos se houver
      if (fotos.length > 0) {
        const imageUrls = fotos.map(foto => foto.url)
        await addProductPhotos(newProduct.id, imageUrls)
      }

      toast({
        title: "Éxito",
        description: "¡Joya creada con éxito!",
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
        title: "Error",
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
      description: "",
      cost_price: "",
      selling_price: "",
    })
    setFotos([])
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFotosChange = (newFotos: Array<{url: string, path: string, fileName: string}>) => {
    setFotos(newFotos)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Crear Nueva Joya</DialogTitle>
          <DialogDescription className="font-body">
            Complete los datos de la nueva joya para agregar al inventario.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="joia" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="joia">Datos de la Joya</TabsTrigger>
            <TabsTrigger value="categorias">
              <Settings className="w-4 h-4 mr-2" />
              Gestionar Categorías
            </TabsTrigger>
          </TabsList>

          <TabsContent value="joia" className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="font-body">
                    Código de la Joya *
                  </Label>
                  <Input
                    id="code"
                    placeholder="Ej: AN001"
                    value={formData.code}
                    onChange={(e) => handleInputChange("code", e.target.value)}
                    required
                    className="font-body"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-body">Categoría</Label>
                  <Select value={formData.category_id} onValueChange={(value) => handleInputChange("category_id", value)}>
                    <SelectTrigger className="font-body">
                      <SelectValue placeholder="Seleccione una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Ninguna categoría</SelectItem>
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
                  Nombre *
                </Label>
                <Input
                  id="name"
                  placeholder="Ej: Anillo de Oro 18k"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="font-body"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-body">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  placeholder="Descripción detallada del producto (opcional)"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="font-body"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost_price" className="font-body">
                    Precio de Costo *
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
                    Precio de Venta
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
                <ImageUpload
                  images={fotos}
                  onImagesChange={handleFotosChange}
                  maxImages={4}
                  disabled={isLoading}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="font-body">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="font-body">
                  {isLoading ? "Creando..." : "Crear Joya"}
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
                Cerrar
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
