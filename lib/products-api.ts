import { supabase } from './supabase'
import type { 
  Product, 
  ProductPhoto, 
  Category, 
  ProductWithDetails, 
  CreateProductData,
  UpdateProductData 
} from './supabase'

// Buscar produtos com detalhes (categoria + fotos)
export async function getProductsWithDetails(): Promise<ProductWithDetails[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, description),
      photos:product_photos(id, image)
    `)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
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

// Criar produto
export async function createProduct(productData: CreateProductData): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single()

  if (error) throw error
  return data
}

// Adicionar fotos ao produto
export async function addProductPhotos(productId: number, imageUrls: string[]): Promise<ProductPhoto[]> {
  const photoData = imageUrls.map(url => ({
    product_id: productId,
    image: url
  }))

  const { data, error } = await supabase
    .from('product_photos')
    .insert(photoData)
    .select()

  if (error) throw error
  return data || []
}

// Atualizar produto
export async function updateProduct(productId: number, updates: UpdateProductData): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Deletar fotos do produto
export async function deleteProductPhotos(productId: number): Promise<void> {
  const { error } = await supabase
    .from('product_photos')
    .delete()
    .eq('product_id', productId)

  if (error) throw error
}

// Soft delete produto (marcar como inactive)
export async function deleteProduct(productId: number): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ active: false })
    .eq('id', productId)

  if (error) throw error
}

// Hard delete produto (apenas se necessário)
export async function hardDeleteProduct(productId: number): Promise<void> {
  // Primeiro deletar fotos
  await deleteProductPhotos(productId)
  
  // Depois deletar produto
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) throw error
}

// Função para tratar erros específicos do Supabase
export function handleSupabaseError(error: any): string {
  if (error.code === '23505') {
    return 'Código do produto já existe. Use um código diferente.'
  }
  if (error.code === '23503') {
    return 'Categoria selecionada não existe.'
  }
  if (error.message?.includes('permission denied')) {
    return 'Sem permissão para esta operação. Faça login como administrador.'
  }
  return 'Erro interno. Tente novamente ou contate o suporte.'
}

// Validação de URL de imagem
export function validateImageUrl(url: string): boolean {
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp)$/i
  return imageExtensions.test(url) || url.includes('placeholder')
}
