import { supabase } from './supabase'

// Interfaces para distribuidor
export interface CreateDistributorData {
  name: string
  email: string
  phone?: string
  address?: string
  description?: string
  password?: string // opcional, será gerada se não fornecida
}

export interface DistributorProfile {
  id: string
  email: string
  name?: string
  phone?: string
  address?: string
  description?: string
  active: boolean
  created_at: string
  user_created_at: string
}

export interface CreateDistributorResult {
  user: {
    id: string
    email: string
  }
  profile: {
    id: string
    role: string
    active: boolean
    created_at: string
  }
  password: string
}

/**
 * Verificar se email já existe no sistema
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  console.log('🔍 Verificando se email já existe:', email)
  
  // Verificar se existe um usuário com este email na auth.users
  // Como não podemos consultar auth.users diretamente do client, 
  // vamos verificar através de uma tentativa de sign-in que falhará se o usuário não existir
  
  // Alternativa: fazer uma chamada para a API para verificar
  try {
    const response = await fetch('/api/distributors/check-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    
    if (!response.ok) {
      // Se a API não existir ainda, vamos assumir que o email não existe
      console.log('📧 API de verificação não encontrada, assumindo email não existe')
      return false
    }
    
    const result = await response.json()
    const exists = result.exists
    console.log('📧 Email existe?', exists)
    return exists
  } catch (error) {
    console.log('📧 Erro ao verificar email, assumindo não existe:', error)
    return false
  }
}

/**
 * Criar distribuidor via API route
 */
export async function createDistributor(data: CreateDistributorData): Promise<CreateDistributorResult> {
  console.log('🚀 Iniciando criação de distribuidor via API:', data.email)
  
  try {
    // 1. Verificar se email já existe
    const emailExists = await checkEmailExists(data.email)
    if (emailExists) {
      throw new Error('Este email já está sendo usado no sistema')
    }

    // 2. Chamar API route para criar distribuidor
    console.log('� Chamando API route /api/distributors...')
    const response = await fetch('/api/distributors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao criar distribuidor')
    }

    const result = await response.json()
    console.log('✅ Distribuidor criado com sucesso via API!')
    
    return result

  } catch (error) {
    console.error('❌ Erro na criação do distribuidor:', error)
    throw error
  }
}

/**
 * Atualizar distribuidor completo (auth.users + profile)
 */
export async function updateDistributor(
  distributorId: string,
  data: {
    name?: string
    email?: string
    phone?: string
    address?: string
    description?: string
  }
): Promise<{ user: any; profile: any }> {
  console.log('📝 Atualizando distribuidor completo:', distributorId)
  
  try {
    const response = await fetch(`/api/distributors/${distributorId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao atualizar distribuidor')
    }

    const result = await response.json()
    console.log('✅ Distribuidor atualizado com sucesso!')
    
    return result

  } catch (error) {
    console.error('❌ Erro na atualização do distribuidor:', error)
    throw error
  }
}

/**
 * Gerenciar status e senha do distribuidor
 */
export async function manageDistributor(
  distributorId: string,
  action: 'toggle_status' | 'reset_password',
  options: {
    active?: boolean
    newPassword?: string
  } = {}
): Promise<{ profile?: any; passwordReset?: boolean; newPassword?: string }> {
  console.log('🔧 Gerenciando distribuidor:', distributorId, 'ação:', action)
  
  try {
    const response = await fetch(`/api/distributors/${distributorId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        ...options
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao gerenciar distribuidor')
    }

    const result = await response.json()
    console.log('✅ Distribuidor gerenciado com sucesso!')
    
    return result

  } catch (error) {
    console.error('❌ Erro no gerenciamento do distribuidor:', error)
    throw error
  }
}

/**
 * Atualizar perfil do distribuidor (não modifica auth.users) - DEPRECATED
 * Use updateDistributor() para atualizações completas
 */
export async function updateDistributorProfile(
  userId: string, 
  data: Partial<Pick<DistributorProfile, 'address' | 'description' | 'phone'>>
): Promise<void> {
  console.log('📝 Atualizando perfil do distribuidor (DEPRECATED):', userId)
  
  const { error } = await supabase
    .from('profiles')
    .update({
      address: data.address,
      description: data.description,
      // Note: phone não existe na tabela atual, mas preparado para futuro
    })
    .eq('id', userId)
    .eq('role', 'reseller')
    
  if (error) {
    console.error('❌ Erro ao atualizar perfil:', error)
    throw new Error(`Erro ao atualizar perfil: ${error.message}`)
  }
  
  console.log('✅ Perfil atualizado com sucesso')
}

/**
 * Desativar distribuidor (soft delete - active=false)
 */
export async function deactivateDistributor(userId: string): Promise<void> {
  console.log('⏹️ Desativando distribuidor:', userId)
  
  const { error } = await supabase
    .from('profiles')
    .update({ active: false })
    .eq('id', userId)
    .eq('role', 'reseller')
    
  if (error) {
    console.error('❌ Erro ao desativar distribuidor:', error)
    throw new Error(`Erro ao desativar distribuidor: ${error.message}`)
  }
  
  console.log('✅ Distribuidor desativado com sucesso')
}

/**
 * Reativar distribuidor (active=true)
 */
export async function reactivateDistributor(userId: string): Promise<void> {
  console.log('▶️ Reativando distribuidor:', userId)
  
  const { error } = await supabase
    .from('profiles')
    .update({ active: true })
    .eq('id', userId)
    .eq('role', 'reseller')
    
  if (error) {
    console.error('❌ Erro ao reativar distribuidor:', error)
    throw new Error(`Erro ao reativar distribuidor: ${error.message}`)
  }
  
  console.log('✅ Distribuidor reativado com sucesso')
}

/**
 * Listar todos os distribuidores
 */
export async function getDistributors(): Promise<DistributorProfile[]> {
  console.log('📋 Buscando distribuidores...')
  
  // Como não temos acesso direto ao auth.users via query,
  // vamos usar a RPC function existente
  const { data, error } = await supabase.rpc('get_resellers_with_users')
  
  if (error) {
    console.error('❌ Erro ao buscar distribuidores:', error)
    throw new Error(`Erro ao carregar distribuidores: ${error.message}`)
  }
  
  const distributors: DistributorProfile[] = data?.map((item: any) => ({
    id: item.id,
    email: item.email,
    name: item.name,
    phone: item.phone,
    address: item.address,
    description: item.description,
    active: item.active,
    created_at: item.profile_created_at,
    user_created_at: item.user_created_at
  })) || []
  
  console.log(`✅ Encontrados ${distributors.length} distribuidores`)
  return distributors
}

/**
 * Buscar distribuidor específico por ID
 */
export async function getDistributorById(userId: string): Promise<DistributorProfile | null> {
  console.log('🔍 Buscando distribuidor por ID:', userId)
  
  const distributors = await getDistributors()
  const distributor = distributors.find(d => d.id === userId) || null
  
  console.log('📋 Distribuidor encontrado:', !!distributor)
  return distributor
}

/**
 * Exclusão permanente do distribuidor (auth.users + profiles)
 */
export async function permanentDeleteDistributor(distributorId: string): Promise<void> {
  console.log('🗑️ Excluindo distribuidor permanentemente:', distributorId)
  
  try {
    const response = await fetch(`/api/distributors/${distributorId}/permanent-delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao excluir distribuidor permanentemente')
    }

    const result = await response.json()
    console.log('✅ Distribuidor excluído permanentemente com sucesso!')
    
    return result

  } catch (error) {
    console.error('❌ Erro na exclusão permanente do distribuidor:', error)
    throw error
  }
}

/**
 * Obter estatísticas dos distribuidores
 */
export async function getDistributorStats() {
  console.log('📊 Buscando estatísticas de distribuidores...')
  
  const { data, error } = await supabase.rpc('get_reseller_stats')
  
  if (error) {
    console.error('❌ Erro ao buscar estatísticas:', error)
    throw new Error(`Erro ao carregar estatísticas: ${error.message}`)
  }
  
  console.log('✅ Estatísticas obtidas:', data)
  return {
    total_resellers: data?.total_resellers || 0,
    active_resellers: data?.active_resellers || 0,
    inactive_resellers: data?.inactive_resellers || 0
  }
}
