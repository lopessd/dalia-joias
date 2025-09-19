// Teste da função getShowcaseHistory corrigida
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eelizogeyrjjrfrximif.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlbGl6b2dleXJqanJmcnhpbWlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MDIzODIsImV4cCI6MjA3MTQ3ODM4Mn0.AgGDCGfbpioweMa4IrE8O6P2lJ6bAbgFquFnE9CudzM'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Simular a função getShowcaseHistory corrigida
async function getShowcaseHistory(profileId, startDate, endDate) {
  try {
    console.log('🔍 Buscando histórico de mostruários para profile:', profileId)
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('⚠️ Usuário não autenticado, mas continuando para teste...')
      // Para o teste, vamos continuar mesmo sem autenticação
    } else {
      console.log('✅ Usuário autenticado:', user.email)
    }
    
    // Construir query base
    let query = supabase
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
    
    // Aplicar filtros de data se fornecidos
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('❌ Erro ao buscar histórico de mostruários:', error)
      throw error
    }
    
    if (!data) {
      console.log('📭 Nenhum mostruário encontrado')
      return []
    }
    
    console.log('✅ Dados brutos do histórico:', data)
    
    // Processar os dados para o formato esperado
    const processedHistory = data
      .filter((showcase) => showcase.inventory_movements && showcase.inventory_movements.length > 0)
      .map((showcase) => {
        const products = showcase.inventory_movements.map((movement) => ({
          product_id: movement.product_id,
          product_name: movement.products.name,
          product_code: movement.products.code,
          quantity: Math.abs(movement.quantity), // Converter para positivo (quantidade recebida)
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
    
    console.log('✅ Histórico processado:', processedHistory)
    return processedHistory
    
  } catch (error) {
    console.error('❌ Erro na função getShowcaseHistory:', error)
    throw error
  }
}

async function testShowcaseHistoryFixed() {
  try {
    const profileId = 'f278254b-4704-4230-8c4b-3a767320ec9a' // augustonanuque@gmail.com
    
    console.log('🧪 Testando função getShowcaseHistory corrigida...')
    
    const history = await getShowcaseHistory(profileId)
    
    console.log('\n📊 Resultado final:')
    console.log(`  - Total de showcases: ${history.length}`)
    
    if (history.length > 0) {
      console.log('\n📦 Detalhes dos showcases:')
      history.forEach((showcase, index) => {
        console.log(`  ${index + 1}. ${showcase.code} (${showcase.created_at})`)
        console.log(`     - Produtos: ${showcase.total_products}`)
        console.log(`     - Peças: ${showcase.total_pieces}`)
        console.log(`     - Valor: ₲${showcase.total_value.toLocaleString()}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testShowcaseHistoryFixed()