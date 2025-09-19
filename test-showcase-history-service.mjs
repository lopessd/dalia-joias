// Teste da função getShowcaseHistory usando service key
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eelizogeyrjjrfrximif.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlbGl6b2dleXJqanJmcnhpbWlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTkwMjM4MiwiZXhwIjoyMDcxNDc4MzgyfQ._qr5Y795Rida_GaJa0y4K24ns5wiqmzu6T6f_PMblfc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testShowcaseHistoryWithService() {
  try {
    const profileId = 'f278254b-4704-4230-8c4b-3a767320ec9a' // augustonanuque@gmail.com
    
    console.log('🧪 Testando getShowcaseHistory com service key...')
    console.log('🔍 Profile ID:', profileId)
    
    // Testar a query exata da função
    const { data, error } = await supabase
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
    
    if (error) {
      console.error('❌ Erro na query:', error)
      return
    }
    
    console.log('✅ Dados retornados:', JSON.stringify(data, null, 2))
    console.log('📊 Total de showcases:', data?.length || 0)
    
    if (data && data.length > 0) {
      // Processar os dados como a função faz
      const processedHistory = data
        .filter((showcase) => showcase.inventory_movements && showcase.inventory_movements.length > 0)
        .map((showcase) => {
          const showcaseMovements = showcase.inventory_movements.filter((movement) => 
            movement.product_id && movement.products
          )
          
          const products = showcaseMovements.map((movement) => ({
            product_id: movement.product_id,
            product_name: movement.products.name,
            product_code: movement.products.code,
            quantity: Math.abs(movement.quantity),
            selling_price: movement.products.selling_price
          }))
          
          const total_pieces = products.reduce((sum, product) => sum + product.quantity, 0)
          const total_products = products.length
          const total_value = products.reduce((sum, product) => {
            return sum + (product.quantity * (product.selling_price || 0))
          }, 0)
          
          return {
            id: showcase.id,
            code: showcase.code,
            created_at: showcase.created_at,
            products,
            total_pieces,
            total_products,
            total_value
          }
        })
        .filter((showcase) => showcase.products.length > 0)
      
      console.log('\n📦 Histórico processado:')
      processedHistory.forEach((showcase, index) => {
        console.log(`  ${index + 1}. ${showcase.code} (${showcase.created_at})`)
        console.log(`     - Produtos: ${showcase.total_products}`)
        console.log(`     - Peças: ${showcase.total_pieces}`)
        console.log(`     - Valor: ₲${showcase.total_value.toLocaleString()}`)
        console.log(`     - Detalhes dos produtos:`)
        showcase.products.forEach((product, i) => {
          console.log(`       ${i + 1}. ${product.product_name} (${product.product_code}) - Qtd: ${product.quantity} - Preço: ₲${product.selling_price?.toLocaleString() || 0}`)
        })
      })
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testShowcaseHistoryWithService()