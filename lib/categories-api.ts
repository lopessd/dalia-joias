import { supabase } from './supabase'
import type { Category } from './supabase'

export interface CreateCategoryData {
  name: string
  description?: string | null
}

export interface UpdateCategoryData {
  name?: string
  description?: string | null
}

// Buscar categorias
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

// Criar categoria
export async function createCategory(categoryData: CreateCategoryData): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert([categoryData])
    .select()
    .single()

  if (error) throw error
  return data
}

// Atualizar categoria
export async function updateCategory(categoryId: number, updates: UpdateCategoryData): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', categoryId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Excluir categoria
export async function deleteCategory(categoryId: number): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)

  if (error) throw error
}

// Função para tratar erros específicos do Supabase para categorias
export function handleCategoryError(error: any): string {
  if (error.code === '23505') {
    return 'Nome de categoria já existe. Use um nome diferente.'
  }
  if (error.code === '23503') {
    return 'Não é possível excluir categoria que possui produtos vinculados.'
  }
  if (error.message?.includes('permission denied')) {
    return 'Sem permissão para esta operação. Faça login como administrador.'
  }
  return 'Erro interno. Tente novamente ou contate o suporte.'
}
