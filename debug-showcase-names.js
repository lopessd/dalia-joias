import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qjpagwdlslwskhcbhigb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcGFnd2Rsc2x3c2toY2JoaWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1NDMxMzYsImV4cCI6MjA1MjExOTEzNn0.BRJ9_z6bvnL4VLQBEhRc1SAZV5XRdLGDDTwJdNEKkms'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugShowcaseNames() {
  try {
    console.log('1. Buscando todos os showcases...')
    const { data: showcases, error: showcaseError } = await supabase
      .from('showcase')
      .select('id, code, profile_id, created_at')
      .order('created_at', { ascending: false })

    if (showcaseError) {
      console.error('Erro ao buscar showcases:', showcaseError)
      return
    }

    console.log('Showcases encontrados:', showcases)

    if (showcases && showcases.length > 0) {
      const profileIds = [...new Set(showcases.map(s => s.profile_id))]
      console.log('\n2. Profile IDs únicos:', profileIds)

      console.log('\n3. Buscando profiles...')
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', profileIds)

      if (profileError) {
        console.error('Erro ao buscar profiles:', profileError)
      } else {
        console.log('Profiles encontrados:', profiles)
      }

      // Teste direto com join
      console.log('\n4. Testando join direto...')
      const { data: joinTest, error: joinError } = await supabase
        .from('showcase')
        .select(`
          id,
          code,
          profile_id,
          distributor_profile:profiles!showcase_profile_id_fkey(id, name, email)
        `)
        .limit(3)

      if (joinError) {
        console.error('Erro no join:', joinError)
      } else {
        console.log('Resultado do join:', JSON.stringify(joinTest, null, 2))
      }
    }

  } catch (error) {
    console.error('Erro geral:', error)
  }
}

debugShowcaseNames()