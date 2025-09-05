// Test script para testar as APIs de revendedores
const { createClient } = require('@supabase/supabase-js')

// Configurar cliente Supabase - usar as mesmas configurações do projeto
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testResellersAPI() {
  console.log('🔍 Testando APIs de Revendedores...')
  
  try {
    // Teste 1: Listar usuários com role=reseller na tabela profiles
    console.log('\n1. Testando query na tabela profiles...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'reseller')
    
    if (profilesError) {
      console.error('❌ Erro na query profiles:', profilesError)
    } else {
      console.log('✅ Profiles encontrados:', profiles.length)
      console.log('Dados:', JSON.stringify(profiles, null, 2))
    }

    // Teste 2: Tentar acessar auth.users via RPC (se disponível)
    console.log('\n2. Testando RPC get_resellers...')
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_resellers')
    
    if (rpcError) {
      console.error('❌ Erro no RPC:', rpcError.message)
    } else {
      console.log('✅ RPC funcionando:', rpcData?.length || 0, 'registros')
    }

    // Teste 3: Listar todas as tabelas disponíveis
    console.log('\n3. Verificando estrutura do banco...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    if (!tablesError && tables) {
      console.log('✅ Tabelas disponíveis:', tables.map(t => t.table_name).join(', '))
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testResellersAPI()
