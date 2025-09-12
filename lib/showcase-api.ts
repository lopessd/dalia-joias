import { supabase } from './supabase'

// Função para obter o cliente Supabase com contexto de autenticação
function getAuthenticatedSupabase() {
  return supabase
}

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
    email?: string
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
    const inventoryMovements = data.products.map(product => ({
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

    // 3. Validar se produtos existem e têm estoque suficiente
    for (const product of data.products) {
      // Buscar o produto atual com seus movimentos de estoque
      const { data: currentProduct, error: fetchError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          inventory_movements(quantity)
        `)
        .eq('id', Number(product.product_id))
        .single()

      if (fetchError) {
        console.error('Erro ao buscar produto:', fetchError)
        throw new Error(`Erro ao buscar produto ${product.product_id}: ${fetchError.message}`)
      }

      // Calcular estoque atual
      const currentStock = currentProduct.inventory_movements?.reduce(
        (total: number, movement: any) => total + movement.quantity, 0
      ) || 0

      // Verificar se há estoque suficiente
      if (currentStock < product.quantity) {
        throw new Error(`Estoque insuficiente para o produto "${currentProduct.name}". Disponível: ${currentStock}, Solicitado: ${product.quantity}`)
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
        distributor_profile:profiles(id, role, active, address, description)
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



    // Buscar todos os distribuidores com nomes reais usando RPC function
    const distributorsMap: Record<string, string> = {}
    
    try {
      const { data: resellers, error: resellersError } = await supabase.rpc('get_resellers_with_users')
      
      if (!resellersError && resellers) {
        resellers.forEach((reseller: any) => {
          if (reseller.name) {
            distributorsMap[reseller.id] = reseller.name
          } else if (reseller.email) {
            distributorsMap[reseller.id] = reseller.email.split('@')[0]
          }
        })
      }
    } catch (error) {
      console.error('Erro ao buscar distribuidores:', error)
    }

    // Resolver nomes dos usuários para os showcases (legacy code para fallback)
    const profileIds = [...new Set((data || []).map(showcase => showcase.profile_id))]
    const userNames: Record<string, string> = {}
    const currentUser = user
    
    if (profileIds.length > 0) {
      // Tentar buscar da tabela profiles primeiro (fallback)
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', profileIds)
        
        if (!profilesError && profilesData) {
          profilesData.forEach((profile: any) => {
            const displayName = profile.name || profile.email
            if (displayName) {
              userNames[profile.id] = displayName
            }
          })
        }
      } catch (error) {
        console.log('Erro ao buscar profiles:', error)
      }
      
      // Para o usuário atual, usar o email se disponível
      if (currentUser && profileIds.includes(currentUser.id) && !userNames[currentUser.id]) {
        userNames[currentUser.id] = currentUser.email || `Usuario ${currentUser.id.slice(0, 8)}`
      }
      
      // Para IDs não resolvidos, criar nomes descritivos
      profileIds.forEach(id => {
        if (!userNames[id]) {
          // Criar um nome mais amigável baseado no UUID
          const shortId = id.slice(0, 8)
          userNames[id] = `Distribuidor ${shortId}`
        }
      })
    }

    // Processar os dados para calcular totais
    const showcasesWithDetails: ShowcaseWithDetails[] = (data || []).map(showcase => {
      const movements = showcase.inventory_movements || []
      const totalPieces = movements.reduce((sum: number, mov: any) => sum + Math.abs(mov.quantity), 0)
      const totalValue = movements.reduce((sum: number, mov: any) => {
        const jewelry = mov.jewelry
        return sum + (Math.abs(mov.quantity) * (jewelry?.selling_price || jewelry?.cost_price || 0))
      }, 0)

      // Usar o nome real do distribuidor do mapa que já foi carregado
      let distributorName = 'N/A'
      
      if (distributorsMap[showcase.profile_id]) {
        distributorName = distributorsMap[showcase.profile_id]
      } else if (userNames[showcase.profile_id]) {
        distributorName = userNames[showcase.profile_id]
      } else {
        // Como último recurso, usar o ID do profile formatado
        distributorName = `Distribuidor ${showcase.profile_id.slice(0, 8)}`
      }

      return {
        ...showcase,
        distributor_profile: {
          ...showcase.distributor_profile,
          name: distributorName
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