// Teste direto das funções API
const { createClient } = require('@supabase/supabase-js')

// Definir variáveis diretamente para teste
const supabaseUrl = 'https://eelizogeyrjjrfrximif.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlbGl6b2dleXJqanJmcnhpbWlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MDIzODIsImV4cCI6MjA3MTQ3ODM4Mn0.AgGDCGfbpioweMa4IrE8O6P2lJ6bAbgFquFnE9CudzM'

console.log('🔧 Configurações:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDirectAPI() {
  console.log('🧪 Testando chamada direta das APIs...')
  
  try {
    // Teste 1: Buscar profiles diretamente
    console.log('\n1. Testando consulta em profiles...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, role, address, description, active, created_at')
      .eq('role', 'reseller')
    
    if (profilesError) {
      console.error('❌ Erro em profiles:', profilesError)
    } else {
      console.log('✅ Profiles encontrados:', profiles.length)
      console.log('Dados:', JSON.stringify(profiles, null, 2))
    }

    // Teste 2: Tentar a função RPC que criamos
    console.log('\n2. Testando RPC get_resellers_with_users...')
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_resellers_with_users')
    
    if (rpcError) {
      console.error('❌ Erro no RPC:', rpcError)
    } else {
      console.log('✅ RPC funcionando! Dados:', JSON.stringify(rpcData, null, 2))
    }

    // Teste 3: Testar RPC de estatísticas
    console.log('\n3. Testando RPC get_reseller_stats...')
    const { data: rpcStatsData, error: rpcStatsError } = await supabase
      .rpc('get_reseller_stats')
    
    if (rpcStatsError) {
      console.error('❌ Erro no RPC de stats:', rpcStatsError)
    } else {
      console.log('✅ RPC Stats funcionando! Dados:', JSON.stringify(rpcStatsData, null, 2))
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testDirectAPI()
