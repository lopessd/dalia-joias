import { supabase } from './supabase'

export interface ShowcaseHistoryItem {
  id: number
  code: string
  created_at: string
  status: 'entregue' | 'finalizado'
  products: {
    product_id: number
    product_name: string
    product_code: string
    quantity: number
    selling_price: number | null
  }[]
  total_pieces: number
  total_products: number
  total_value: number
}

export interface ShowcaseHistoryStats {
  total_showcases: number
  total_pieces: number
  total_value: number
}

/**
 * Busca o histórico de mostruários recebidos pelo revendedor logado
 */
export async function getShowcaseHistory(
  profileId: string,
  startDate?: string,
  endDate?: string,
  distributorId?: string
): Promise<ShowcaseHistoryItem[]> {
  try {
    console.log('🔍 Buscando histórico de mostruários para profile:', profileId)
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Usuário não autenticado:', authError)
      throw new Error('Usuário não autenticado. Faça login novamente.')
    }
    
    console.log('✅ Usuário autenticado:', user.email)
    
    // Construir query base
    let query = supabase
      .from('showcase')
      .select(`
        id,
        code,
        created_at,
        showcase_returns(id),
        inventory_movements(
          product_id,
          quantity,
          products(
            name,
            code,
            selling_price
          )
        )
      `)
      .order('created_at', { ascending: false })
    
    // Aplicar filtro por distribuidor se fornecido, senão usar profileId
    if (distributorId) {
      console.log('👤 Filtro por distribuidor:', distributorId)
      query = query.eq('profile_id', distributorId)
    } else {
      query = query.eq('profile_id', profileId)
    }
    
    // Aplicar filtros de data se fornecidos
    if (startDate) {
      // Converter data de início para o início do dia no fuso horário local
      const startDateTime = `${startDate}T00:00:00-03:00`
      console.log('📅 Filtro data início:', startDateTime)
      query = query.gte('created_at', startDateTime)
    }
    if (endDate) {
      // Converter data de fim para o final do dia no fuso horário local
      const endDateTime = `${endDate}T23:59:59-03:00`
      console.log('📅 Filtro data fim:', endDateTime)
      query = query.lte('created_at', endDateTime)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('❌ Erro ao buscar histórico de mostruários:', error)
      throw error
    }
    
    if (!data || data.length === 0) {
      console.log('📭 Nenhum mostruário encontrado')
      return []
    }
    
    console.log('✅ Dados brutos do histórico:', data)
    
    // Processar os dados para o formato esperado
    const processedHistory: ShowcaseHistoryItem[] = data
      .filter((showcase: any) => showcase.inventory_movements && showcase.inventory_movements.length > 0)
      .map((showcase: any) => {
        // Filtrar apenas movimentações relacionadas ao showcase (com showcase_id)
        const showcaseMovements = showcase.inventory_movements.filter((movement: any) => 
          movement.product_id && movement.products
        )
        
        const products = showcaseMovements.map((movement: any) => ({
          product_id: movement.product_id,
          product_name: movement.products.name,
          product_code: movement.products.code,
          quantity: Math.abs(movement.quantity), // Converter para positivo (quantidade recebida)
          selling_price: movement.products.selling_price
        }))
        
        const total_pieces = products.reduce((sum: number, product: any) => sum + product.quantity, 0)
        const total_products = products.length
        const total_value = products.reduce((sum: number, product: any) => {
          return sum + (product.quantity * (product.selling_price || 0))
        }, 0)

        // Determinar status baseado em retornos
        const hasReturns = (showcase.showcase_returns || []).length > 0
        const status: 'entregue' | 'finalizado' = hasReturns ? 'finalizado' : 'entregue'
      
        return {
          id: showcase.id,
          code: showcase.code,
          created_at: showcase.created_at,
          status,
          products,
          total_pieces,
          total_products,
          total_value
        }
      })
      .filter((showcase: ShowcaseHistoryItem) => showcase.products.length > 0) // Só retornar showcases com produtos
      .filter((showcase: ShowcaseHistoryItem) => showcase.status === 'entregue') // Só mostrar mostruários ativos (não finalizados)
    
    console.log('✅ Histórico processado:', processedHistory)
    return processedHistory
    
  } catch (error) {
    console.error('❌ Erro na função getShowcaseHistory:', error)
    throw error
  }
}

/**
 * Busca estatísticas do histórico de mostruários do revendedor
 */
export async function getShowcaseHistoryStats(
  profileId: string,
  startDate?: string,
  endDate?: string,
  distributorId?: string
): Promise<ShowcaseHistoryStats> {
  try {
    console.log('📊 Buscando estatísticas do histórico para profile:', profileId)
    
    const history = await getShowcaseHistory(profileId, startDate, endDate, distributorId)
    
    const stats: ShowcaseHistoryStats = {
      total_showcases: history.length,
      total_pieces: history.reduce((sum, item) => sum + item.total_pieces, 0),
      total_value: history.reduce((sum, item) => sum + item.total_value, 0)
    }
    
    console.log('✅ Estatísticas calculadas:', stats)
    return stats
    
  } catch (error) {
    console.error('❌ Erro ao calcular estatísticas:', error)
    throw error
  }
}

/**
 * Função para lidar com erros do Supabase
 */
export function handleShowcaseHistoryError(error: any): string {
  console.error('❌ Erro no histórico de mostruários:', error)
  
  if (error?.message?.includes('JWT')) {
    return 'Sessão expirada. Faça login novamente.'
  }
  
  if (error?.message?.includes('RLS')) {
    return 'Você não tem permissão para acessar estes dados.'
  }
  
  if (error?.message?.includes('network')) {
    return 'Erro de conexão. Verifique sua internet.'
  }
  
  return error?.message || 'Erro desconhecido ao carregar histórico de recebimentos.'
}