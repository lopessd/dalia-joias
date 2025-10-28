import { supabase } from '../supabase'
import { ShowcasePDFData } from './types'

export async function fetchShowcaseDataForPDF(showcaseId: number): Promise<ShowcasePDFData> {
  // Executar a query SQL completa para buscar todos os dados
  const { data: rawData, error } = await supabase.rpc('get_showcase_pdf_data', {
    p_showcase_id: showcaseId
  })

  // Se a RPC não existir, usar queries diretas
  if (error && error.message.includes('function')) {
    console.log('RPC não encontrada, usando queries diretas')
    return await fetchShowcaseDataDirectly(showcaseId)
  }
  
  if (error) {
    console.error('Erro ao buscar dados do mostruário:', error)
    throw new Error(`Erro ao buscar dados: ${error.message}`)
  }
  
  if (!rawData || rawData.length === 0) {
    throw new Error('Mostruário não encontrado')
  }
  
  return processRawData(rawData)
}

async function fetchShowcaseDataDirectly(showcaseId: number): Promise<ShowcasePDFData> {
  // Buscar dados do showcase
  const { data: showcase, error: showcaseError } = await supabase
    .from('showcase')
    .select(`
      id,
      code,
      created_at,
      profile_id
    `)
    .eq('id', showcaseId)
    .single()

  if (showcaseError || !showcase) {
    throw new Error('Mostruário não encontrado')
  }

  // Buscar dados do usuário e perfil usando RPC
  const { data: userProfileData, error: userError } = await supabase
    .rpc('get_user_profile_data', { user_id: showcase.profile_id })
    .single()

  if (userError) {
    console.error('Erro ao buscar dados do usuário:', userError)
  }

  // Extrair dados com tipagem correta
  const user = userProfileData ? {
    email: (userProfileData as any).email || '',
    phone: (userProfileData as any).phone || null,
    raw_user_meta_data: {
      name: (userProfileData as any).user_name || ''
    }
  } : null

  const profile = userProfileData ? {
    address: (userProfileData as any).address || '',
    city: (userProfileData as any).city || 'Pedro Juan Caballero',
    description: (userProfileData as any).description || ''
  } : null

  // Buscar movimentações de saída
  const { data: movements } = await supabase
    .from('inventory_movements')
    .select(`
      id,
      quantity,
      created_at,
      product_id,
      products (
        id,
        code,
        name,
        selling_price,
        cost_price
      )
    `)
    .eq('showcase_id', showcaseId)
    .lt('quantity', 0)

  // Buscar retornos
  const { data: returns } = await supabase
    .from('showcase_returns')
    .select('product_id, returned_quantity, returned_at')
    .eq('showcase_id', showcaseId)

  // Buscar venda
  const { data: sale } = await supabase
    .from('sales')
    .select(`
      id,
      total_value,
      description,
      created_at
    `)
    .eq('showcase_id', showcaseId)
    .maybeSingle()

  // Buscar produtos vendidos
  let soldProducts: any[] = []
  if (sale) {
    const { data: sp } = await supabase
      .from('sold_products')
      .select('product_id, quantity, sold_price, commission_percentage')
      .eq('sale_id', sale.id)
    soldProducts = sp || []
  }

  // Processar dados
  const productsMap = new Map()
  const returnsMap = new Map()
  const soldMap = new Map()

  // Mapear retornos
  returns?.forEach((ret: any) => {
    returnsMap.set(ret.product_id, {
      returned_quantity: ret.returned_quantity,
      returned_at: ret.returned_at
    })
  })

  // Mapear vendidos
  soldProducts.forEach((sp: any) => {
    soldMap.set(sp.product_id, {
      sold_quantity: sp.quantity,
      sold_price: sp.sold_price,
      commission_percentage: sp.commission_percentage
    })
  })

  let totalSalesValue = 0
  let totalCommission = 0

  // Processar movimentos
  movements?.forEach((mov: any) => {
    const product = mov.products
    if (!product) return

    const sentQty = Math.abs(mov.quantity)
    const returnData = returnsMap.get(product.id)
    const soldData = soldMap.get(product.id)
    
    const returnedQty = returnData?.returned_quantity || 0
    const soldQty = soldData?.sold_quantity || 0
    const unitPrice = Number(product.selling_price || product.cost_price || 0)
    const totalValue = sentQty * unitPrice
    const commissionPct = soldData?.commission_percentage || 0
    const soldPrice = soldData?.sold_price || unitPrice
    const commissionValue = soldQty * Number(soldPrice) * (Number(commissionPct) / 100)

    productsMap.set(product.id, {
      product_id: product.id,
      product_code: product.code,
      product_name: product.name,
      sent_quantity: sentQty,
      returned_quantity: returnedQty,
      sold_quantity: soldQty,
      unit_price: unitPrice,
      total_value: totalValue,
      commission_percentage: commissionPct,
      commission_value: commissionValue
    })

    totalSalesValue += soldQty * Number(soldPrice)
    totalCommission += commissionValue
  })

  const products = Array.from(productsMap.values())

  // Calcular resumo
  const totalSentPieces = products.reduce((sum, p) => sum + p.sent_quantity, 0)
  const totalReturnedPieces = products.reduce((sum, p) => sum + (p.returned_quantity || 0), 0)
  const totalSoldPieces = products.reduce((sum, p) => sum + (p.sold_quantity || 0), 0)
  const totalShowcaseValue = products.reduce((sum, p) => sum + p.total_value, 0)

  // Buscar data de finalização (primeiro retorno)
  const finishedAt = returns && returns.length > 0 
    ? returns.sort((a: any, b: any) => new Date(a.returned_at).getTime() - new Date(b.returned_at).getTime())[0].returned_at
    : undefined

  // Extrair cidade do endereço
  let distributorCity = 'Pedro Juan Caballero' // Padrão
  
  // Se a RPC já retornou a cidade, usar diretamente
  if (profile?.city) {
    distributorCity = profile.city
  }
  // Senão, extrair manualmente do endereço
  else if (profile?.address) {
    const address = profile.address.trim()
    
    // Se o endereço contém vírgula, extrair a cidade após a última vírgula
    // Exemplo: "Rua Ponte Nova, N°11, Nanuque - MG" → "Nanuque - MG"
    if (address.includes(',')) {
      const parts = address.split(',')
      const lastPart = parts[parts.length - 1].trim()
      
      // Se a última parte contém traço, pegar a parte antes do traço
      // Exemplo: "Nanuque - MG" → "Nanuque"
      if (lastPart.includes('-')) {
        distributorCity = lastPart.split('-')[0].trim()
      } else {
        distributorCity = lastPart
      }
    } 
    // Se não tem vírgula mas não contém palavras como "rua", considerar como cidade
    else if (!address.toLowerCase().match(/rua|avenida|av\.|rua\.|travessa/)) {
      distributorCity = address
    }
  }

  const pdfData: ShowcasePDFData = {
    showcase_id: showcase.id,
    showcase_code: showcase.code,
    sent_date: showcase.created_at,
    finished_at: finishedAt,
    status: finishedAt ? 'finalizado' : 'entregue',
    
    distributor_id: showcase.profile_id,
    distributor_name: user?.raw_user_meta_data?.name || 'N/A',
    distributor_email: user?.email || 'N/A',
    distributor_phone: user?.phone || undefined,
    distributor_city: distributorCity,
    distributor_address: profile?.address,
    
    products: products,
    
    has_sale: !!sale,
    sale_id: sale?.id,
    sale_date: sale?.created_at,
    sale_description: sale?.description,
    
    summary: {
      total_sent_pieces: totalSentPieces,
      total_returned_pieces: totalReturnedPieces,
      total_sold_pieces: totalSoldPieces,
      total_showcase_value: totalShowcaseValue,
      total_sales_value: totalSalesValue,
      total_commission: totalCommission
    }
  }

  return pdfData
}

function processRawData(rawData: any[]): ShowcasePDFData {
  const firstRow = rawData[0]
  
  // Agrupar produtos
  const productsMap = new Map()
  let totalSalesValue = 0
  let totalCommission = 0
  
  rawData.forEach((row: any) => {
    if (!productsMap.has(row.product_id)) {
      const sentQty = Math.abs(row.sent_quantity || 0)
      const returnedQty = row.returned_quantity || 0
      const soldQty = row.sold_quantity || 0
      const unitPrice = Number(row.selling_price || row.cost_price || 0)
      const totalValue = sentQty * unitPrice
      const commissionPct = Number(row.commission_percentage || 0)
      const commissionValue = soldQty * Number(row.sold_price || unitPrice) * (commissionPct / 100)
      
      productsMap.set(row.product_id, {
        product_id: row.product_id,
        product_code: row.product_code,
        product_name: row.product_name,
        sent_quantity: sentQty,
        returned_quantity: returnedQty,
        sold_quantity: soldQty,
        unit_price: unitPrice,
        total_value: totalValue,
        commission_percentage: commissionPct,
        commission_value: commissionValue
      })
      
      totalSalesValue += soldQty * Number(row.sold_price || 0)
      totalCommission += commissionValue
    }
  })
  
  const products = Array.from(productsMap.values())
  
  // Calcular resumo
  const totalSentPieces = products.reduce((sum, p) => sum + p.sent_quantity, 0)
  const totalReturnedPieces = products.reduce((sum, p) => sum + (p.returned_quantity || 0), 0)
  const totalSoldPieces = products.reduce((sum, p) => sum + (p.sold_quantity || 0), 0)
  const totalShowcaseValue = products.reduce((sum, p) => sum + p.total_value, 0)
  
  const pdfData: ShowcasePDFData = {
    showcase_id: firstRow.showcase_id,
    showcase_code: firstRow.showcase_code,
    sent_date: firstRow.sent_date,
    finished_at: firstRow.returned_at,
    status: firstRow.sale_id ? 'finalizado' : 'entregue',
    
    distributor_id: firstRow.distributor_id,
    distributor_name: firstRow.distributor_name || 'N/A',
    distributor_email: firstRow.distributor_email || 'N/A',
    distributor_phone: firstRow.distributor_phone || undefined,
    distributor_city: firstRow.distributor_city || 'Pedro Juan Caballero',
    distributor_address: firstRow.distributor_address,
    
    products: products,
    
    has_sale: !!firstRow.sale_id,
    sale_id: firstRow.sale_id,
    sale_date: firstRow.sale_date,
    sale_description: firstRow.sale_description,
    
    summary: {
      total_sent_pieces: totalSentPieces,
      total_returned_pieces: totalReturnedPieces,
      total_sold_pieces: totalSoldPieces,
      total_showcase_value: totalShowcaseValue,
      total_sales_value: totalSalesValue,
      total_commission: totalCommission
    }
  }
  
  return pdfData
}
