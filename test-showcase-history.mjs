// Teste da função getShowcaseHistory para augustonanuque@gmail.com
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eelizogeyrjjrfrximif.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlbGl6b2dleXJqanJmcnhpbWlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTkwMjM4MiwiZXhwIjoyMDcxNDc4MzgyfQ._qr5Y795Rida_GaJa0y4K24ns5wiqmzu6T6f_PMblfc'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testShowcaseHistory() {
  try {
    console.log('🔍 Verificando usuários no banco...')
    
    // Primeiro, vamos verificar se o usuário existe
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('❌ Erro ao listar usuários:', usersError)
    } else {
      console.log('👥 Usuários encontrados:')
      users.users.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id})`)
      })
    }
    
    const profileId = 'f278254b-4704-4230-8c4b-3a767320ec9a' // augustonanuque@gmail.com
    
    console.log('\n🔍 Testando getShowcaseHistory para profile:', profileId)
    
    // Testar a query exata da função getShowcaseHistory
    const { data, error } = await supabase
      .from('showcase')
      .select(`
        id,
        code,
        created_at,
        inventory_movements!inner(
          product_id,
          quantity,
          products(
            name,
            code,
            selling_price
          )
        )
      `)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Erro na query:', error)
      return
    }
    
    console.log('✅ Dados retornados:', JSON.stringify(data, null, 2))
    console.log('📊 Total de showcases encontrados:', data?.length || 0)
    
    // Testar sem o !inner para comparar
    console.log('\n🔍 Testando sem !inner...')
    const { data: data2, error: error2 } = await supabase
      .from('showcase')
      .select(`
        id,
        code,
        created_at,
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
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
    
    if (error2) {
      console.error('❌ Erro na query sem !inner:', error2)
      return
    }
    
    console.log('✅ Dados sem !inner:', JSON.stringify(data2, null, 2))
    console.log('📊 Total sem !inner:', data2?.length || 0)
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testShowcaseHistory()