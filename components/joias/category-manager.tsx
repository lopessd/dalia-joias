"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Edit2, Trash2, Folder } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  handleCategoryError,
  type CreateCategoryData,
  type UpdateCategoryData 
} from "@/lib/categories-api"
import type { Category } from "@/lib/supabase"

interface CategoryManagerProps {
  categories: Category[]
  onCategoriesChange: () => void
}

export function CategoryManager({ categories, onCategoriesChange }: CategoryManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const [createForm, setCreateForm] = useState<CreateCategoryData>({
    name: "",
    description: ""
  })

  const [editForm, setEditForm] = useState<UpdateCategoryData>({
    name: "",
    description: ""
  })

  const resetCreateForm = () => {
    setCreateForm({
      name: "",
      description: ""
    })
  }

  const resetEditForm = () => {
    setEditForm({
      name: "",
      description: ""
    })
  }

  const handleCreate = async () => {
    if (!createForm.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      await createCategory({
        name: createForm.name.trim(),
        description: createForm.description?.trim() || null
      })

      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!",
        variant: "default"
      })

      setIsCreateDialogOpen(false)
      resetCreateForm()
      onCategoriesChange()

    } catch (error: any) {
      console.error('Erro ao criar categoria:', error)
      const errorMessage = handleCategoryError(error)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedCategory || !editForm.name?.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      await updateCategory(selectedCategory.id, {
        name: editForm.name.trim(),
        description: editForm.description?.trim() || null
      })

      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!",
        variant: "default"
      })

      setIsEditDialogOpen(false)
      setSelectedCategory(null)
      resetEditForm()
      onCategoriesChange()

    } catch (error: any) {
      console.error('Erro ao atualizar categoria:', error)
      const errorMessage = handleCategoryError(error)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCategory) return

    setIsLoading(true)
    try {
      await deleteCategory(selectedCategory.id)

      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso!",
        variant: "default"
      })

      setIsDeleteDialogOpen(false)
      setSelectedCategory(null)
      onCategoriesChange()

    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error)
      const errorMessage = handleCategoryError(error)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category)
    setEditForm({
      name: category.name,
      description: category.description || ""
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Gerenciar Categorias</h3>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          size="sm"
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Lista de Categorias */}
      <div className="max-h-40 overflow-y-auto space-y-2">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma categoria cadastrada
          </p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Folder className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{category.name}</p>
                  {category.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(category)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openDeleteDialog(category)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog Criar Categoria */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Nova Categoria</DialogTitle>
            <DialogDescription>
              Adicione uma nova categoria para organizar suas joias.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Nome *</Label>
              <Input
                id="create-name"
                placeholder="Ex: Anéis"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm(prev => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">Descrição</Label>
              <Textarea
                id="create-description"
                placeholder="Descrição opcional da categoria..."
                value={createForm.description || ""}
                onChange={(e) =>
                  setCreateForm(prev => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                resetCreateForm()
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Categoria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Categoria */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
            <DialogDescription>
              Atualize os dados da categoria.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                placeholder="Ex: Anéis"
                value={editForm.name || ""}
                onChange={(e) =>
                  setEditForm(prev => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                placeholder="Descrição opcional da categoria..."
                value={editForm.description || ""}
                onChange={(e) =>
                  setEditForm(prev => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setSelectedCategory(null)
                resetEditForm()
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{selectedCategory?.name}"?
              Esta ação não pode ser desfeita e pode afetar produtos vinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setSelectedCategory(null)
              }}
              disabled={isLoading}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
