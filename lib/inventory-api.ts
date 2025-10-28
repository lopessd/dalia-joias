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
    description?: string
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
  const { data: movements, error } = await supabase
    .from('inventory_movements')
    .select('id, quantity, created_at')

  if (error) throw error

  const totalMovements = movements?.length || 0
  const totalEntries = movements?.filter(m => m.quantity > 0).length || 0
  const totalExits = movements?.filter(m => m.quantity < 0).length || 0
  
  // Movimentações dos últimos 7 dias
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentMovements = movements?.filter(m => 
    new Date(m.created_at) >= sevenDaysAgo
  ).length || 0

  return {
    totalMovements,
    totalEntries,
    totalExits,
    recentMovements
  }
}

// Interface para joias do distribuidor
// Interface para os dados retornados pela query do Supabase
interface MovementWithProduct {
  id: number
  product_id: number
  quantity: number
  showcase_id: number
  created_at: string
  product: {
    id: number
    code: string
    name: string
    description: string
    cost_price: number
    selling_price: number | null
    category: {
      id: number
      name: string
    } | null
  } | null
}

export interface DistributorJewelry {
  id: number
  code: string
  name: string
  description?: string
  cost_price: number
  selling_price?: number
  resale_price?: number // Preço personalizado do revendedor
  category?: {
    id: number
    name: string
  } | null
  quantity: number // Quantidade total enviada para o distribuidor
  showcases: {
    id: number
    code: string
    created_at: string
    quantity: number // Quantidade enviada neste mostruário específico
  }[]
  photos?: {
    url: string
  }[]
}

// Buscar joias enviadas para um distribuidor específico (apenas mostruários ativos)
export async function getDistributorJewelry(profileId: string): Promise<DistributorJewelry[]> {
  // Primeiro, buscar todos os mostruários do distribuidor
  const { data: allShowcases, error: showcaseError } = await supabase
    .from('showcase')
    .select('id, code, created_at, profile_id')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })

  if (showcaseError) throw showcaseError
  if (!allShowcases || allShowcases.length === 0) return []

  // Identificar mostruários ativos (sem retornos registrados)
  const showcaseIds = allShowcases.map(s => s.id)
  const { data: returnsData, error: returnsError } = await supabase
    .from('showcase_returns')
    .select('showcase_id')
    .in('showcase_id', showcaseIds)

  if (returnsError) {
    console.error('Erro ao buscar retornos:', returnsError)
    throw returnsError
  }

  // Criar conjunto de mostruários finalizados
  const finalizedShowcaseIds = new Set((returnsData || []).map(r => r.showcase_id))

  // Filtrar apenas mostruários ativos
  const activeShowcases = allShowcases.filter(s => !finalizedShowcaseIds.has(s.id))
  const activeShowcaseIds = activeShowcases.map(s => s.id)

  if (activeShowcaseIds.length === 0) return []

  // Buscar movimentos de inventário para mostruários ativos (apenas saídas - quantidade negativa)
  const { data: movements, error: movementError } = await supabase
    .from('inventory_movements')
    .select(`
      id,
      product_id,
      quantity,
      showcase_id,
      created_at,
      product:products(
        id,
        code,
        name,
        description,
        cost_price,
        selling_price,
        category:categories(id, name)
      )
    `)
    .in('showcase_id', activeShowcaseIds)
    .lt('quantity', 0) // Apenas saídas (envios para mostruário)
    .order('created_at', { ascending: false }) as { data: MovementWithProduct[] | null, error: any }

  if (movementError) throw movementError
  if (!movements) return []

  // Buscar vendas do distribuidor para subtrair do estoque
  const productIds = [...new Set(movements.map(m => m.product_id))]
  const { data: salesData, error: salesError } = await supabase
    .from('sold_products')
    .select(`
      product_id,
      quantity,
      sales!inner(profile_id)
    `)
    .eq('sales.profile_id', profileId)
    .in('product_id', productIds)

  if (salesError) {
    console.error('Erro ao buscar vendas:', salesError)
    // Se houver erro na busca de vendas, continuar sem subtrair (estoque = recebido)
  }

  // Criar mapa de vendas por produto
  const salesMap = new Map<number, number>()
  if (salesData) {
    salesData.forEach(sale => {
      const current = salesMap.get(sale.product_id) || 0
      salesMap.set(sale.product_id, current + sale.quantity)
    })
  }

  // Buscar preços personalizados do revendedor
  const { data: pricingData, error: pricingError } = await supabase
    .from('product_pricing')
    .select('product_id, resale_price')
    .eq('profile_id', profileId)
    .in('product_id', productIds)

  if (pricingError) {
    console.error('Erro ao buscar preços personalizados:', pricingError)
  }

  // Criar mapa de preços personalizados
  const pricingMap = new Map<number, number>()
  if (pricingData) {
    pricingData.forEach(pricing => {
      pricingMap.set(pricing.product_id, pricing.resale_price)
    })
  }

  // Agrupar por produto e calcular quantidades (recebidas - vendidas)
  const jewelryMap = new Map<number, DistributorJewelry>()

  movements.forEach(movement => {
    if (!movement.product) return

    const productId = movement.product.id
    const receivedQuantity = Math.abs(movement.quantity) // Quantidade recebida no mostruário
    const soldQuantity = salesMap.get(productId) || 0 // Quantidade já vendida
    const availableQuantity = Math.max(0, receivedQuantity - soldQuantity) // Estoque disponível

    // Só incluir produtos que ainda têm estoque disponível
    if (availableQuantity <= 0) return

    const showcase = activeShowcases.find(s => s.id === movement.showcase_id)
    if (!showcase) return

    if (jewelryMap.has(productId)) {
      const existing = jewelryMap.get(productId)!
      existing.quantity += availableQuantity

      // Verificar se já existe este mostruário na lista
      const existingShowcase = existing.showcases.find(s => s.id === showcase.id)
      if (existingShowcase) {
        existingShowcase.quantity += receivedQuantity // Manter quantidade total recebida
      } else {
        existing.showcases.push({
          id: showcase.id,
          code: showcase.code,
          created_at: showcase.created_at,
          quantity: receivedQuantity
        })
      }
    } else {
      jewelryMap.set(productId, {
        id: movement.product.id,
        code: movement.product.code,
        name: movement.product.name || '',
        description: movement.product.description || '',
        cost_price: movement.product.cost_price,
        selling_price: movement.product.selling_price || undefined,
        resale_price: pricingMap.get(productId), // Preço personalizado do revendedor
        category: movement.product.category || null,
        photos: [], // Inicializar como array vazio por enquanto
        quantity: availableQuantity, // Quantidade disponível (recebida - vendida)
        showcases: [{
          id: showcase.id,
          code: showcase.code,
          created_at: showcase.created_at,
          quantity: receivedQuantity // Quantidade total recebida neste mostruário
        }]
      })
    }
  })

  return Array.from(jewelryMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}
