import { supabase } from './supabase'
import type { ResellerProfile, ResellerStats } from './supabase'

// Buscar todos os revendedores do banco de dados
export async function getResellers(): Promise<ResellerProfile[]> {
  try {
    console.log('🔍 Buscando revendedores no banco de dados...')
    
    // Usar a função RPC que criamos - ela tem acesso completo aos dados
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_resellers_with_users')
    
    if (rpcError) {
      console.error('❌ Erro no RPC get_resellers_with_users:', rpcError)
      throw rpcError
    }

    if (!rpcData || rpcData.length === 0) {
      console.log('ℹ️ Nenhum revendedor encontrado via RPC')
      return []
    }

    console.log(`✅ Encontrados ${rpcData.length} revendedores via RPC:`, rpcData)
    return rpcData

  } catch (error) {
    console.error('❌ Erro geral ao buscar revendedores:', error)
    throw new Error('Falha ao carregar dados dos revendedores')
  }
}

// Buscar estatísticas dos revendedores
export async function getResellerStats(): Promise<ResellerStats> {
  try {
    console.log('📊 Buscando estatísticas de revendedores...')
    
    // Usar RPC para estatísticas (contorna problemas de RLS)
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_reseller_stats')
    
    if (statsError) {
      console.error('❌ Erro no RPC get_reseller_stats:', statsError)
      throw statsError
    }

    if (!statsData || statsData.length === 0) {
      console.log('ℹ️ Nenhuma estatística encontrada, retornando zeros')
      return {
        total_resellers: 0,
        active_resellers: 0,
        inactive_resellers: 0
      }
    }

    const stats = statsData[0] // RPC retorna array com um objeto
    console.log('✅ Estatísticas obtidas via RPC:', stats)
    
    return {
      total_resellers: stats.total_resellers || 0,
      active_resellers: stats.active_resellers || 0,
      inactive_resellers: stats.inactive_resellers || 0
    }

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas de revendedores:', error)
    throw new Error('Falha ao carregar estatísticas dos revendedores')
  }
}

// Função para tratar erros específicos do Supabase
export function handleSupabaseUserError(error: any): string {
  if (error.message?.includes('permission denied')) {
    return 'Sem permissão para acessar dados dos usuários. Faça login como administrador.'
  }
  if (error.message?.includes('network')) {
    return 'Erro de conexão com o banco de dados. Tente novamente.'
  }
  return 'Erro interno. Tente novamente ou contate o suporte.'
}
