// Teste para verificar se os dados dos mostruários estão sendo carregados corretamente
const { supabase } = require('./lib/supabase')

async function testShowcaseData() {
  try {
    console.log('🔍 Testando dados dos mostruários...')
    
    // Buscar um showcase específico com todos os dados
    const { data: showcases, error: showcasesError } = await supabase
      .from('showcase')
      .select(`
        *,
        inventory_movements(
          *,
          jewelry:products(*)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (showcasesError) {
      console.error('❌ Erro ao buscar showcases:', showcasesError)
      return
    }
    
    if (showcases && showcases.length > 0) {
      const showcase = showcases[0]
      console.log('✅ Showcase encontrado:')
      console.log(`  - ID: ${showcase.id}`)
      console.log(`  - Código: ${showcase.code}`)
      console.log(`  - Profile ID: ${showcase.profile_id}`)
      console.log(`  - Movimentos: ${showcase.inventory_movements?.length || 0}`)
      
      if (showcase.inventory_movements && showcase.inventory_movements.length > 0) {
        console.log('  - Produtos:')
        showcase.inventory_movements.forEach((mov, index) => {
          console.log(`    ${index + 1}. ${mov.jewelry?.name || 'N/A'} - Qtd: ${Math.abs(mov.quantity)} - Preço: ${mov.jewelry?.selling_price || mov.jewelry?.cost_price || 0}`)
        })
        
        const totalPieces = showcase.inventory_movements.reduce((sum, mov) => sum + Math.abs(mov.quantity), 0)
        const totalValue = showcase.inventory_movements.reduce((sum, mov) => 
          sum + (Math.abs(mov.quantity) * (mov.jewelry?.selling_price || mov.jewelry?.cost_price || 0)), 0
        )
        
        console.log(`  - Total de peças: ${totalPieces}`)
        console.log(`  - Valor total: ₲${totalValue.toLocaleString()}`)
      }
    } else {
      console.log('❌ Nenhum showcase encontrado')
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testShowcaseData()