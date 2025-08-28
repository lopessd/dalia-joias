import { getInventoryMovements, getInventoryStats, createInventoryMovement } from '../lib/inventory-api'

// Teste simples da API de inventory
async function testInventoryAPI() {
  console.log('=== Testando API de Inventory ===')
  
  try {
    // Testar getInventoryMovements
    console.log('\n1. Testando getInventoryMovements...')
    const movements = await getInventoryMovements()
    console.log(`✓ ${movements.length} movimentações encontradas`)
    
    if (movements.length > 0) {
      console.log('Primeira movimentação:', {
        id: movements[0].id,
        quantity: movements[0].quantity,
        reason: movements[0].reason,
        product_name: movements[0].product?.name
      })
    }
    
    // Testar getInventoryStats
    console.log('\n2. Testando getInventoryStats...')
    const stats = await getInventoryStats()
    console.log('✓ Estatísticas:', stats)
    
    console.log('\n✅ Todos os testes passaram!')
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error)
  }
}

// Executar teste
testInventoryAPI()
