// Vamos verificar a estrutura dos dados do banco de dados
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qjpagwdlslwskhcbhigb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcGFnd2Rsc2x3c2toY2JoaWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1NDMxMzYsImV4cCI6MjA1MjExOTEzNn0.BRJ9_z6bvnL4VLQBEhRc1SAZV5XRdLGDDTwJdNEKkms'

console.log('Criando cliente Supabase...')
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkDatabase() {
  try {
    console.log('Verificando conexão com Supabase...')
    
    // Primeiro, vamos ver a estrutura da tabela profiles
    console.log('\n=== TESTANDO PROFILES ===')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    
    if (profilesError) {
      console.error('Erro profiles:', profilesError)
    } else {
      console.log('Profiles (amostra):', profiles)
    }

    // Agora vamos testar a tabela showcase
    console.log('\n=== TESTANDO SHOWCASE ===')
    const { data: showcases, error: showcaseError } = await supabase
      .from('showcase')
      .select('*')
      .limit(3)
    
    if (showcaseError) {
      console.error('Erro showcase:', showcaseError)
    } else {
      console.log('Showcases (amostra):', showcases)
    }

  } catch (error) {
    console.error('Erro geral:', error)
  }
}

checkDatabase()