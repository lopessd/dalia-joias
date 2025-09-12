// Teste simples da API de showcases
const { supabase } = require('./lib/supabase')

async function testAPI() {
  console.log('🔍 Testando API...')
  
  try {
    // Testar RPC function
    const { data, error } = await supabase.rpc('get_resellers_with_users')
    
    if (error) {
      console.error('❌ Erro:', error)
      return
    }
    
    console.log('✅ Distribuidores encontrados:')
    data?.forEach(d => {
      console.log(`  - ${d.name} (${d.email})`)
    })
    
  } catch (err) {
    console.error('❌ Erro no teste:', err.message)
  }
}

testAPI()