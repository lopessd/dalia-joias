// Teste de formatação de moeda guarani
function testGuaraniFormatting() {
  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return '₲0'
    return `₲${value.toLocaleString()}`
  }

  console.log('🧪 Testando formatação de moeda guarani:')
  console.log(`  - 0: ${formatCurrency(0)}`)
  console.log(`  - 12222: ${formatCurrency(12222)}`)
  console.log(`  - 150000: ${formatCurrency(150000)}`)
  console.log(`  - 1500000: ${formatCurrency(1500000)}`)
  console.log(`  - undefined: ${formatCurrency(undefined)}`)
  console.log(`  - null: ${formatCurrency(null)}`)
  
  console.log('\n✅ Formato correto: ₲12.222 (sem espaço, sem G duplo)')
}

testGuaraniFormatting()