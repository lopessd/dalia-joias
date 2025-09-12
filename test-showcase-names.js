// Teste para verificar se os nomes dos distribuidores estão aparecendo corretamente
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testShowcaseNames() {
  try {
    console.log('🔍 Testando nomes dos distribuidores nos showcases...')
    
    // 1. Primeiro, vamos ver o que a RPC function retorna
    console.log('\n📋 Testando RPC get_resellers_with_users:')
    const { data: resellers, error: resellersError } = await supabase.rpc('get_resellers_with_users')
    
    if (resellersError) {
      console.error('❌ Erro na RPC:', resellersError)
      return
    }
    
    console.log(`✅ Encontrados ${resellers?.length || 0} distribuidores:`)
    resellers?.forEach(r => {
      console.log(`  - ${r.name} (${r.email}) - ID: ${r.id.slice(0, 8)}`)
    })
    
    // 2. Agora vamos ver os showcases
    console.log('\n🏪 Testando showcases:')
    const { data: showcases, error: showcasesError } = await supabase
      .from('showcase')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (showcasesError) {
      console.error('❌ Erro ao buscar showcases:', showcasesError)
      return
    }
    
    console.log(`✅ Encontrados ${showcases?.length || 0} showcases:`)
    showcases?.forEach(s => {
      const distributor = resellers?.find(r => r.id === s.profile_id)
      const distributorName = distributor?.name || distributor?.email?.split('@')[0] || `Distribuidor ${s.profile_id.slice(0, 8)}`
      
      console.log(`  - ${s.code}: ${distributorName} (profile_id: ${s.profile_id.slice(0, 8)})`)
    })
    
    console.log('\n✅ Teste concluído!')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testShowcaseNames()