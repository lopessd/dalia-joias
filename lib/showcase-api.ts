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
  status: 'entregue' | 'finalizado'  // Status calculado baseado em retornos
  total_pieces?: number
  total_value?: number
  has_returns?: boolean  // Indica se tem retornos registrados
  has_sale?: boolean  // Indica se já tem venda registrada
  sale_id?: number  // ID da venda registrada (se houver)
  finished_at?: string  // Data de finalização (data do primeiro retorno)
  showcase_returns?: {
    product_id: number
    returned_quantity: number
    returned_at?: string
  }[]
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

    // Buscar informações de retornos separadamente
    const showcaseIds = (data || []).map(s => s.id)
    
    // Criar mapa de retornos por showcase_id
    const returnsMap: Record<number, { product_id: number; returned_quantity: number; returned_at?: string }[]> = {}
    const finishedAtMap: Record<number, string> = {}
    const salesMap: Record<number, number> = {} // showcase_id -> sale_id
    
    // Só buscar retornos se houver showcases
    if (showcaseIds.length > 0) {
      const { data: returnsData, error: returnsError } = await supabase
        .from('showcase_returns')
        .select('showcase_id, product_id, returned_quantity, returned_at')
        .in('showcase_id', showcaseIds)
        .order('returned_at', { ascending: true })

      if (returnsError) {
        console.error('Erro ao buscar retornos:', returnsError)
        // Não falhar a operação, apenas continuar sem dados de retorno
      }

      if (returnsData) {
        returnsData.forEach(ret => {
          if (!returnsMap[ret.showcase_id]) {
            returnsMap[ret.showcase_id] = []
            // Primeiro retorno = data de finalização
            if (ret.returned_at && !finishedAtMap[ret.showcase_id]) {
              finishedAtMap[ret.showcase_id] = ret.returned_at
            }
          }
          returnsMap[ret.showcase_id].push({ 
            product_id: ret.product_id,
            returned_quantity: ret.returned_quantity,
            returned_at: ret.returned_at
          })
        })
      }

      // Buscar vendas registradas para estes mostruários
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('id, showcase_id')
        .in('showcase_id', showcaseIds)
        .not('showcase_id', 'is', null)

      if (!salesError && salesData) {
        salesData.forEach(sale => {
          if (sale.showcase_id) {
            salesMap[sale.showcase_id] = sale.id
          }
        })
      }
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
      // Contar apenas as saídas (quantidade negativa = envio) para o total de peças enviadas
      const outgoingMovements = movements.filter((mov: any) => mov.quantity < 0)
      const totalPieces = outgoingMovements.reduce((sum: number, mov: any) => sum + Math.abs(mov.quantity), 0)
      const totalValue = outgoingMovements.reduce((sum: number, mov: any) => {
        const jewelry = mov.jewelry
        return sum + (Math.abs(mov.quantity) * (jewelry?.selling_price || jewelry?.cost_price || 0))
      }, 0)

      // Determinar status baseado em retornos usando o mapa
      const showcaseReturns = returnsMap[showcase.id] || []
      const hasReturns = showcaseReturns.length > 0
      const status: 'entregue' | 'finalizado' = hasReturns ? 'finalizado' : 'entregue'

      // Verificar se tem venda registrada
      const hasSale = !!salesMap[showcase.id]
      const saleId = salesMap[showcase.id]

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
        status,
        has_returns: hasReturns,
        has_sale: hasSale,
        sale_id: saleId,
        finished_at: finishedAtMap[showcase.id],
        showcase_returns: showcaseReturns,
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

export interface ShowcaseReturn {
  product_id: number
  returned_quantity: number
}

/**
 * Finaliza um mostruário registrando os retornos de produtos
 */
export async function finishShowcase(showcaseId: number, returns: ShowcaseReturn[]): Promise<void> {
  try {
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Usuário não autenticado')
    }

    // Verificar se o showcase existe
    const { data: showcase, error: showcaseError } = await supabase
      .from('showcase')
      .select('id, code')
      .eq('id', showcaseId)
      .single()

    if (showcaseError || !showcase) {
      throw new Error('Mostruário não encontrado')
    }

    // 1. Registrar os retornos na tabela showcase_returns
    const returnsToInsert = returns
      .filter(ret => ret.returned_quantity > 0)
      .map(ret => ({
        showcase_id: showcaseId,
        product_id: ret.product_id,
        returned_quantity: ret.returned_quantity
      }))

    if (returnsToInsert.length > 0) {
      const { error: returnsError } = await supabase
        .from('showcase_returns')
        .insert(returnsToInsert)

      if (returnsError) {
        console.error('Erro ao registrar retornos:', returnsError)
        throw new Error(`Erro ao registrar retornos: ${returnsError.message}`)
      }

      // 2. Criar movimentações de inventário para os retornos (entrada no estoque)
      const inventoryMovements = returnsToInsert.map(ret => ({
        product_id: ret.product_id,
        quantity: ret.returned_quantity, // Positivo porque é entrada no estoque
        reason: `Retorno do mostruário ${showcase.code}`,
        showcase_id: showcaseId
      }))

      const { error: movementsError } = await supabase
        .from('inventory_movements')
        .insert(inventoryMovements)

      if (movementsError) {
        console.error('Erro ao criar movimentações de retorno:', movementsError)
        throw new Error(`Erro ao registrar movimentações de retorno: ${movementsError.message}`)
      }
    }

    console.log(`Mostruário ${showcase.code} finalizado com sucesso`)
  } catch (error) {
    console.error('Erro ao finalizar showcase:', error)
    throw error
  }
}