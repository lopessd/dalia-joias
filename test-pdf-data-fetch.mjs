// Test script to validate PDF data fetching
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testPDFDataFetch() {
  console.log('🧪 Testando busca de dados para PDF...\n')
  
  const showcaseId = 6
  
  try {
    // 1. Buscar dados do showcase
    console.log('1️⃣ Buscando dados do showcase...')
    const { data: showcase, error: showcaseError } = await supabase
      .from('showcase')
      .select('id, code, created_at, profile_id')
      .eq('id', showcaseId)
      .single()
    
    if (showcaseError || !showcase) {
      console.error('❌ Erro ao buscar showcase:', showcaseError)
      return
    }
    
    console.log('✅ Showcase encontrado:', {
      id: showcase.id,
      code: showcase.code,
      profile_id: showcase.profile_id
    })
    
    // 2. Buscar dados do usuário usando RPC
    console.log('\n2️⃣ Buscando dados do usuário via RPC...')
    const { data: userProfileData, error: userError } = await supabase
      .rpc('get_user_profile_data', { user_id: showcase.profile_id })
      .single()
    
    if (userError) {
      console.error('❌ Erro ao buscar dados do usuário:', userError)
      return
    }
    
    console.log('✅ Dados do usuário encontrados:', {
      email: userProfileData.email,
      phone: userProfileData.phone,
      name: userProfileData.user_name,
      address: userProfileData.address,
      description: userProfileData.description
    })
    
    // 3. Processar cidade
    console.log('\n3️⃣ Processando cidade...')
    const address = userProfileData.address
    const distributorCity = address && !address.includes(',') && !address.toLowerCase().includes('rua')
      ? address
      : 'Pedro Juan Caballero'
    
    console.log('✅ Cidade detectada:', distributorCity)
    
    // 4. Formatar telefone
    console.log('\n4️⃣ Formatando telefone...')
    const phone = userProfileData.phone
    let phoneFormatted = '+595 985 673 005' // Padrão
    
    if (phone) {
      if (phone.startsWith('+')) {
        phoneFormatted = phone
      } else if (phone.startsWith('55')) {
        phoneFormatted = `+${phone}`
      } else if (phone.startsWith('595')) {
        phoneFormatted = `+${phone}`
      } else {
        phoneFormatted = `+595 ${phone}`
      }
    }
    
    console.log('✅ Telefone formatado:', phoneFormatted)
    
    // 5. Resumo final
    console.log('\n📄 DADOS PARA O PDF:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Anexo de Piezas Consignadas No: ${showcase.code}`)
    console.log(`C.I: ${showcase.profile_id.slice(0, 10)}`)
    console.log(`Cliente: ${userProfileData.user_name || 'N/A'}`)
    console.log(`Correo: ${userProfileData.email || 'N/A'}`)
    console.log(`Fecha: ${new Date(showcase.created_at).toLocaleDateString('es-PY')}`)
    console.log(`Ciudad: ${distributorCity}`)
    console.log(`Teléfono: ${phoneFormatted}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    console.log('\n✅ Teste concluído com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testPDFDataFetch()
