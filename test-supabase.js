// Teste simples da integração Supabase
import { getProductsWithDetails, getCategories } from '@/lib/products-api'

async function testSupabaseIntegration() {
  try {
    console.log('🧪 Testando conexão com Supabase...')
    
    // Teste 1: Buscar categorias
    console.log('📋 Carregando categorias...')
    const categories = await getCategories()
    console.log(`✅ ${categories.length} categorias encontradas:`, categories.map(c => c.name))
    
    // Teste 2: Buscar produtos
    console.log('📦 Carregando produtos...')
    const products = await getProductsWithDetails()
    console.log(`✅ ${products.length} produtos encontrados:`)
    products.forEach(p => {
      console.log(`- ${p.name} (${p.code}) - R$ ${p.cost_price}`)
    })
    
    console.log('🎉 Testes completados com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error)
  }
}

testSupabaseIntegration()
