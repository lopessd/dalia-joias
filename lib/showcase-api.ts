import { supabase } from './supabase'
import type { Database } from './supabase'

// Função para obter o cliente Supabase com contexto de autenticação
function getAuthenticatedSupabase() {
  return supabase
}

type ShowcaseInsert = Database['public']['Tables']['showcase']['Insert']
type InventoryMovementInsert = Database['public']['Tables']['inventory_movements']['Insert']

export interface CreateShowcaseData {
  profile_id: string
  products: {
    product_id: number
    quantity: number
  }[]
}

export interface ShowcaseWithDetails {
  id: number
  code: string
  created_at: string
  profile_id: string
  status: string
  total_pieces?: number
  total_value?: number
  distributor_profile?: {
    id: string
    name?: string
    address?: string
    description?: string
  }
  inventory_movements?: {
    id: number
    quantity: number
    reason: string
    created_at: string
    jewelry?: {
      id: string
      name: string
      code: string
      selling_price?: number
      cost_price: number
    }
  }[]
  movements?: {
    id: number
    quantity: number
    reason: string
    created_at: string
    jewelry?: {
      id: string
      name: string
      code: string
      selling_price?: number
      cost_price: number
    }
  }[]
}

/**
 * Cria um novo mostruário no banco de dados
 */
export async function createShowcase(data: CreateShowcaseData): Promise<ShowcaseWithDetails> {
  try {
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Usuário não autenticado. Faça login novamente.')
    }

    // 1. Criar o showcase
    const { data: showcase, error: showcaseError } = await supabase
      .from('showcase')
      .insert({
        profile_id: data.profile_id
      })
      .select('*')
      .single()

    if (showcaseError) {
      console.error('Erro ao criar showcase:', showcaseError)
      throw new Error(`Erro ao criar mostruário: ${showcaseError.message}`)
    }

    // 2. Criar as movimentações de inventário
    const inventoryMovements: InventoryMovementInsert[] = data.products.map(product => ({
      product_id: product.product_id,
      quantity: -product.quantity, // Negativo porque é saída do estoque
      reason: `Envio para mostruário #${showcase.id}`,
      showcase_id: showcase.id
    }))

    const { error: movementsError } = await supabase
      .from('inventory_movements')
      .insert(inventoryMovements)

    if (movementsError) {
      console.error('Erro ao criar movimentações:', movementsError)
      // Se falhar, tentar reverter o showcase criado
      await supabase.from('showcase').delete().eq('id', showcase.id)
      throw new Error(`Erro ao registrar movimentações: ${movementsError.message}`)
    }

    // 3. Atualizar o estoque dos produtos
    for (const product of data.products) {
      // Buscar o produto atual
      const { data: currentProduct, error: fetchError } = await supabase
        .from('products')
        .select('id, current_stock')
        .eq('id', product.product_id)
        .single()

      if (fetchError) {
        console.error('Erro ao buscar produto:', fetchError)
        continue // Continua com os outros produtos
      }

      // Calcular novo estoque
      const currentStock = currentProduct.current_stock || 0
      const newStock = Math.max(0, currentStock - product.quantity)

      // Atualizar estoque
      const { error: updateError } = await supabase
        .from('products')
        .update({ current_stock: newStock })
        .eq('id', product.product_id)

      if (updateError) {
        console.error('Erro ao atualizar estoque do produto:', updateError)
        // Não falha a operação toda, apenas loga o erro
      }
    }

    return showcase
  } catch (error) {
    console.error('Erro na criação do showcase:', error)
    throw error
  }
}



/**
 * Busca um showcase específico por ID
 */
export async function getShowcaseById(id: number): Promise<ShowcaseWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from('showcase')
      .select(`
        *,
        distributor_profile:profiles(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Não encontrado
      }
      console.error('Erro ao buscar showcase:', error)
      throw new Error(`Erro ao buscar mostruário: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar showcase por ID:', error)
    throw error
  }
}

/**
 * Busca todos os showcases com seus detalhes
 */
export async function getShowcases(): Promise<ShowcaseWithDetails[]> {
  try {
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('showcase')
      .select(`
        *,
        distributor_profile:profiles(*),
        inventory_movements(
          *,
          jewelry:products(*)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar showcases:', error)
      throw new Error(`Erro ao buscar mostruários: ${error.message}`)
    }

    // Buscar nomes dos usuários usando a função RPC
    const profileIds = [...new Set((data || []).map(showcase => showcase.profile_id))]
    
    const userNames: Record<string, string> = {}
    if (profileIds.length > 0) {
      const { data: userNamesData, error: userNamesError } = await supabase
        .rpc('get_user_names', { user_ids: profileIds })
      
      if (!userNamesError && userNamesData) {
        userNamesData.forEach((user: any) => {
          userNames[user.id] = user.name
        })
      }
    }

    // Processar os dados para calcular totais
    const showcasesWithDetails: ShowcaseWithDetails[] = (data || []).map(showcase => {
      const movements = showcase.inventory_movements || []
      const totalPieces = movements.reduce((sum, mov) => sum + Math.abs(mov.quantity), 0)
      const totalValue = movements.reduce((sum, mov) => {
        const jewelry = mov.jewelry
        return sum + (Math.abs(mov.quantity) * (jewelry?.selling_price || jewelry?.cost_price || 0))
      }, 0)

      return {
        ...showcase,
        distributor_profile: {
          ...showcase.distributor_profile,
          name: userNames[showcase.profile_id] || 'N/A'
        },
        total_pieces: totalPieces,
        total_value: totalValue,
        movements
      }
    })

    return showcasesWithDetails
  } catch (error) {
    console.error('Erro ao buscar showcases:', error)
    throw error
  }
}

/**
 * Busca as movimentações de inventário de um showcase
 */
export async function getShowcaseMovements(showcaseId: number) {
  try {
    const { data, error } = await supabase
      .from('inventory_movements')
      .select(`
        *,
        jewelry:products(*)
      `)
      .eq('showcase_id', showcaseId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar movimentações do showcase:', error)
      throw new Error(`Erro ao buscar movimentações: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar movimentações do showcase:', error)
    throw error
  }
}