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
      photos:product_photos(id, image),
      inventory_movements(quantity)
    `)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  
  // Calcular estoque atual para cada produto
  const productsWithStock = data?.map(product => ({
    ...product,
    current_stock: product.inventory_movements?.reduce(
      (total: number, movement: any) => total + movement.quantity, 0
    ) || 0
  })) || []

  return productsWithStock
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
  // Primeiro deletar movimentações de estoque relacionadas
  const { error: movementsError } = await supabase
    .from('inventory_movements')
    .delete()
    .eq('product_id', productId)
  
  if (movementsError) throw movementsError
  
  // Segundo deletar fotos
  await deleteProductPhotos(productId)
  
  // Por último deletar produto
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
    // Verifica se o erro é sobre foreign key constraint
    if (error.message?.includes('inventory_movements')) {
      return 'Não é possível excluir: produto possui movimentações de estoque relacionadas.'
    }
    if (error.message?.includes('category')) {
      return 'Categoria selecionada não existe.'
    }
    return 'Não é possível excluir: produto possui registros relacionados no sistema.'
  }
  if (error.message?.includes('permission denied')) {
    return 'Sem permissão para esta operação. Faça login como administrador.'
  }
  return 'Erro interno. Tente novamente ou contate o suporte.'
}

// Validação de URL de imagem
export function validateImageUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')
}

// Interface para produtos com estoque
export interface ProductWithStock {
  id: string
  code: string
  name: string
  category_id: number
  category_name: string
  sale_price: number
  cost_price: number
  stock_quantity: number
}

export interface ProductSearchResult {
  products: ProductWithStock[]
  total: number
}

// Buscar produtos do revendedor com estoque disponível
export async function getResellerProducts(
  searchTerm?: string,
  limit: number = 50
): Promise<ProductSearchResult> {
  try {
    // Construir a query base
    let query = supabase
      .from('products')
      .select(`
        id,
        code,
        name,
        category_id,
        categories!inner(name),
        selling_price,
        cost_price,
        inventory_movements(quantity)
      `)
      .eq('active', true)

    // Adicionar filtro de busca se fornecido
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.trim()
      query = query.or(`code.ilike.%${term}%,name.ilike.%${term}%,categories.name.ilike.%${term}%`)
    }

    // Executar a query
    const { data, error } = await query
      .order('name')
      .limit(limit)

    if (error) {
      console.error('Error fetching products:', error)
      throw error
    }

    // Processar os dados e calcular estoque
    const products: ProductWithStock[] = (data || []).map((item: any) => {
      // Calcular estoque total somando os movimentos de inventário
      const stockQuantity = item.inventory_movements?.reduce((total: number, movement: any) => {
        return total + (movement.quantity || 0)
      }, 0) || 0

      return {
        id: item.id.toString(),
        code: item.code || '',
        name: item.name || '',
        category_id: item.category_id || 0,
        category_name: item.categories?.name || 'Sem categoria',
        sale_price: parseFloat(item.selling_price || '0'),
        cost_price: parseFloat(item.cost_price || '0'),
        stock_quantity: stockQuantity
      }
    }).filter(product => product.stock_quantity > 0) // Filtrar apenas produtos com estoque

    return {
      products,
      total: products.length
    }
  } catch (error) {
    console.error('Error in getResellerProducts:', error)
    return {
      products: [],
      total: 0
    }
  }
}

// Buscar produto específico por ID com estoque
export async function getProductWithStock(id: string): Promise<ProductWithStock | null> {
  try {
    const query = `
      SELECT 
        p.id, 
        p.code, 
        p.name, 
        p.category_id,
        c.name as category_name,
        p.selling_price as sale_price,
        p.cost_price,
        COALESCE(SUM(im.quantity), 0) as stock_quantity
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory_movements im ON p.id = im.product_id
      WHERE p.id = ${id} AND p.active = true
      GROUP BY p.id, p.code, p.name, p.category_id, c.name, p.selling_price, p.cost_price
    `

    const { data, error } = await supabase.rpc('execute_sql', {
      query: query
    })

    if (error) {
      console.error('Error fetching product:', error)
      throw error
    }

    if (!data || data.length === 0) {
      return null
    }

    const item = data[0]
    return {
      id: item.id.toString(),
      code: item.code,
      name: item.name,
      category_id: item.category_id,
      category_name: item.category_name || 'Sem categoria',
      sale_price: parseFloat(item.sale_price || '0'),
      cost_price: parseFloat(item.cost_price || '0'),
      stock_quantity: parseInt(item.stock_quantity || '0')
    }
  } catch (error) {
    console.error('Error in getProductWithStock:', error)
    return null
  }
}
