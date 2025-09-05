const { createClient } = require('@supabase/supabase-js')

// Carregar .env.local manualmente
require('dotenv').config({ path: '.env.local' })

console.log('🔍 Testando Supabase Admin API...')
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado')
console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurado' : '❌ Não configurado')

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function testCreateUser() {
  try {
    console.log('👤 Testando criação de usuário...')
    
    const testEmail = `test${Date.now()}@example.com`
    const testPassword = 'Test123456'
    
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    })
    
    if (authError) {
      console.error('❌ Erro ao criar usuário:', authError)
      return
    }
    
    console.log('✅ Usuário criado:', {
      id: authUser.user.id,
      email: authUser.user.email
    })
    
    // Limpar o usuário de teste
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
    console.log('🧹 Usuário de teste removido')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testCreateUser()
