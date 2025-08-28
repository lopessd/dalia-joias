import { supabase } from './supabase'

export interface InventoryMovement {
  id: number
  product_id: number
  quantity: number
  reason: string
  created_at: string
  // Dados do produto (JOIN)
  product?: {
    id: number
    name: string
    code: string
    cost_price: number
    selling_price?: number | null
    category?: {
      id: number
      name: string
    } | null
  }
}

export interface CreateMovementData {
  product_id: number
  quantity: number
  reason: string
}

// Buscar movimentações com dados do produto
export async function getInventoryMovements(): Promise<InventoryMovement[]> {
  const { data, error } = await supabase
    .from('inventory_movements')
    .select(`
      *,
      product:products(
        id,
        name,
        code,
        cost_price,
        selling_price,
        category:categories(id, name)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Buscar movimentações com filtros
export async function getInventoryMovementsFiltered(filters: {
  startDate?: string
  endDate?: string
  productId?: number
  type?: 'entrada' | 'saida' | 'todos'
  reason?: string
}): Promise<InventoryMovement[]> {
  let query = supabase
    .from('inventory_movements')
    .select(`
      *,
      product:products(
        id,
        name,
        code,
        cost_price,
        selling_price,
        category:categories(id, name)
      )
    `)

  // Filtros por data
  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate + 'T00:00:00')
  }
  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate + 'T23:59:59')
  }

  // Filtro por produto
  if (filters.productId) {
    query = query.eq('product_id', filters.productId)
  }

  // Filtro por tipo (entrada/saída)
  if (filters.type === 'entrada') {
    query = query.gt('quantity', 0)
  } else if (filters.type === 'saida') {
    query = query.lt('quantity', 0)
  }

  // Filtro por motivo
  if (filters.reason) {
    query = query.ilike('reason', `%${filters.reason}%`)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// Criar nova movimentação
export async function createInventoryMovement(movementData: CreateMovementData): Promise<InventoryMovement> {
  const { data, error } = await supabase
    .from('inventory_movements')
    .insert([movementData])
    .select(`
      *,
      product:products(
        id,
        name,
        code,
        cost_price,
        selling_price,
        category:categories(id, name)
      )
    `)
    .single()

  if (error) throw error
  return data
}

// Buscar estatísticas do histórico
export async function getInventoryStats(): Promise<{
  totalMovements: number
  totalEntries: number
  totalExits: number
  recentMovements: number
}> {
  // Total de movimentações
  const { count: totalMovements } = await supabase
    .from('inventory_movements')
    .select('*', { count: 'exact', head: true })

  // Entradas (quantity > 0)
  const { count: totalEntries } = await supabase
    .from('inventory_movements')
    .select('*', { count: 'exact', head: true })
    .gt('quantity', 0)

  // Saídas (quantity < 0)
  const { count: totalExits } = await supabase
    .from('inventory_movements')
    .select('*', { count: 'exact', head: true })
    .lt('quantity', 0)

  // Movimentações dos últimos 7 dias
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count: recentMovements } = await supabase
    .from('inventory_movements')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo)

  return {
    totalMovements: totalMovements || 0,
    totalEntries: totalEntries || 0,
    totalExits: totalExits || 0,
    recentMovements: recentMovements || 0
  }
}
