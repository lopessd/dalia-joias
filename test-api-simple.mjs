import { getResellers, getResellerStats } from './lib/users-api.js'

async function testAPI() {
  console.log('🧪 Testando APIs de revendedores...')
  
  try {
    console.log('\n1. Testando getResellers()...')
    const resellers = await getResellers()
    console.log('✅ Resellers obtidos:', JSON.stringify(resellers, null, 2))
    
    console.log('\n2. Testando getResellerStats()...')
    const stats = await getResellerStats()
    console.log('✅ Estatísticas obtidas:', JSON.stringify(stats, null, 2))
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testAPI()
