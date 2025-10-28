import { supabase } from './supabase'

// Interfaces baseadas na estrutura real do banco
export interface Sale {
  id: string
  created_at: string
  description?: string
  profile_id: string
}

export interface SoldProduct {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  category_id?: string
  created_at: string
}

export interface SaleWithProducts {
  id: string
  created_at: string
  total_amount: number
  notes?: string
  reseller_id: string
  products: {
    id: string
    name: string
    quantity: number
    unit_price: number
    total_price: number
  }[]
}

export interface SalesSummary {
  total_sales: number
  total_amount: number
  average_sale: number
  total_products: number
}

// Função para buscar vendas do revendedor
export async function getResellerSales(resellerId: string): Promise<SaleWithProducts[]> {
  try {
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select(`
        id,
        created_at,
        description,
        profile_id,
        sold_products (
          id,
          quantity,
          sold_price,
          products (
            id,
            name,
            code
          )
        )
      `)
      .eq('profile_id', resellerId)
      .order('created_at', { ascending: false })

    if (salesError) {
      console.error('Erro ao buscar vendas:', salesError)
      return []
    }

    if (!sales || sales.length === 0) {
      return []
    }

    // Transformar os dados para o formato esperado
    const salesWithProducts = sales.map((sale) => {
      const products = (sale.sold_products || []).map((soldProduct: any) => ({
        id: soldProduct.products?.id?.toString() || soldProduct.id.toString(),
        name: soldProduct.products?.name || 'Produto sem nome',
        quantity: soldProduct.quantity,
        unit_price: Number(soldProduct.sold_price),
        total_price: soldProduct.quantity * Number(soldProduct.sold_price)
      }))

      const totalAmount = products.reduce((sum: number, p: any) => sum + p.total_price, 0)

      return {
          id: sale.id.toString(),
          created_at: sale.created_at,
          total_amount: totalAmount,
          notes: sale.description || '',
          reseller_id: sale.profile_id,
          products: products
        }
    })

    return salesWithProducts
  } catch (error) {
    console.error('Erro na função getResellerSales:', error)
    return []
  }
}

// Função para buscar resumo de vendas do revendedor
export async function getResellerSalesSummary(resellerId: string): Promise<SalesSummary> {
  try {
    const sales = await getResellerSales(resellerId)
    
    const totalSales = sales.length
    const totalAmount = sales.reduce((sum, sale) => sum + sale.total_amount, 0)
    const averageSale = totalSales > 0 ? totalAmount / totalSales : 0
    const totalProducts = sales.reduce((sum, sale) => sum + sale.products.length, 0)

    return {
      total_sales: totalSales,
      total_amount: totalAmount,
      average_sale: averageSale,
      total_products: totalProducts
    }
  } catch (error) {
    console.error('Erro na função getResellerSalesSummary:', error)
    return {
      total_sales: 0,
      total_amount: 0,
      average_sale: 0,
      total_products: 0
    }
  }
}

// Função para criar uma nova venda
export async function createSale(resellerId: string, description?: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('sales')
      .insert({
        profile_id: resellerId,
        description: description || null
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar venda:', error)
      return null
    }

    return data.id
  } catch (error) {
    console.error('Erro na função createSale:', error)
    return null
  }
}

// Interface para criar venda de mostruário
export interface CreateShowcaseSaleData {
  showcase_id: number
  profile_id: string
  description?: string
  products: {
    product_id: number
    quantity: number
    sold_price: number
    commission_percentage: number
  }[]
}

// Interface para detalhes da venda de mostruário
export interface ShowcaseSaleDetails {
  id: number
  showcase_id: number
  profile_id: string
  description?: string
  total_value: number
  created_at: string
  products: {
    sold_product_id: number
    product_id: number
    product_name: string
    product_code: string
    quantity: number
    sold_price: number
    commission_percentage: number
  }[]
}

// Interface para atualizar venda
export interface UpdateShowcaseSaleData {
  sale_id: number
  description?: string
  products: {
    sold_product_id: number
    commission_percentage: number
  }[]
}

// Função para criar venda de mostruário com produtos e comissões
export async function createShowcaseSale(data: CreateShowcaseSaleData): Promise<void> {
  try {
    // Verificar se já existe venda para este mostruário
    const { data: existingSale, error: checkError } = await supabase
      .from('sales')
      .select('id')
      .eq('showcase_id', data.showcase_id)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar venda existente:', checkError)
      throw new Error(`Erro ao verificar venda: ${checkError.message}`)
    }

    if (existingSale) {
      throw new Error('Já existe uma venda registrada para este mostruário. Não é possível criar venda duplicada.')
    }

    // Calcular valor total da venda
    const totalValue = data.products.reduce((sum, p) => sum + (p.quantity * p.sold_price), 0)

    // 1. Criar a venda
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        profile_id: data.profile_id,
        showcase_id: data.showcase_id,
        description: data.description || null,
        total_value: totalValue
      })
      .select()
      .single()

    if (saleError) {
      console.error('Erro ao criar venda:', saleError)
      
      // Verificar se é erro de constraint de duplicata
      if (saleError.code === '23505' || saleError.message.includes('sales_showcase_id_unique')) {
        throw new Error('Já existe uma venda registrada para este mostruário.')
      }
      
      throw new Error(`Erro ao criar venda: ${saleError.message}`)
    }

    // 2. Criar produtos vendidos com comissões
    const soldProducts = data.products.map(p => ({
      sale_id: sale.id,
      product_id: p.product_id,
      quantity: p.quantity,
      sold_price: p.sold_price,
      commission_percentage: p.commission_percentage
    }))

    const { error: productsError } = await supabase
      .from('sold_products')
      .insert(soldProducts)

    if (productsError) {
      console.error('Erro ao adicionar produtos à venda:', productsError)
      throw new Error(`Erro ao adicionar produtos: ${productsError.message}`)
    }

  } catch (error) {
    console.error('Erro na função createShowcaseSale:', error)
    throw error
  }
}

// Função para buscar detalhes de uma venda de mostruário
export async function getShowcaseSale(saleId: number): Promise<ShowcaseSaleDetails> {
  try {
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select(`
        id,
        showcase_id,
        profile_id,
        description,
        total_value,
        created_at
      `)
      .eq('id', saleId)
      .single()

    if (saleError) {
      console.error('Erro ao buscar venda:', saleError)
      throw new Error(`Erro ao buscar venda: ${saleError.message}`)
    }

    // Buscar produtos vendidos
    const { data: products, error: productsError } = await supabase
      .from('sold_products')
      .select(`
        id,
        product_id,
        quantity,
        sold_price,
        commission_percentage,
        products (
          name,
          code
        )
      `)
      .eq('sale_id', saleId)

    if (productsError) {
      console.error('Erro ao buscar produtos da venda:', productsError)
      throw new Error(`Erro ao buscar produtos: ${productsError.message}`)
    }

    // Formatar resposta
    return {
      id: sale.id,
      showcase_id: sale.showcase_id,
      profile_id: sale.profile_id,
      description: sale.description,
      total_value: Number(sale.total_value),
      created_at: sale.created_at,
      products: products.map((p: any) => ({
        sold_product_id: p.id,
        product_id: p.product_id,
        product_name: p.products?.name || 'Produto desconhecido',
        product_code: p.products?.code || 'N/A',
        quantity: p.quantity,
        sold_price: Number(p.sold_price),
        commission_percentage: Number(p.commission_percentage || 0)
      }))
    }
  } catch (error) {
    console.error('Erro na função getShowcaseSale:', error)
    throw error
  }
}

// Função para atualizar comissões de uma venda
export async function updateShowcaseSale(data: UpdateShowcaseSaleData): Promise<void> {
  try {
    // 1. Atualizar descrição da venda (se fornecida)
    if (data.description !== undefined) {
      const { error: saleError } = await supabase
        .from('sales')
        .update({ description: data.description })
        .eq('id', data.sale_id)

      if (saleError) {
        console.error('Erro ao atualizar venda:', saleError)
        throw new Error(`Erro ao atualizar venda: ${saleError.message}`)
      }
    }

    // 2. Atualizar comissões dos produtos
    for (const product of data.products) {
      const { error: productError } = await supabase
        .from('sold_products')
        .update({
          commission_percentage: product.commission_percentage
        })
        .eq('id', product.sold_product_id)

      if (productError) {
        console.error('Erro ao atualizar produto:', productError)
        throw new Error(`Erro ao atualizar comissão do produto: ${productError.message}`)
      }
    }

  } catch (error) {
    console.error('Erro na função updateShowcaseSale:', error)
    throw error
  }
}

// Função para adicionar produtos a uma venda
export async function addProductsToSale(
  saleId: string,
  products: { productId: string; quantity: number; unitPrice: number }[]
): Promise<boolean> {
  try {
    const soldProducts = products.map(p => ({
      sale_id: saleId,
      product_id: p.productId,
      quantity: p.quantity,
      unit_price: p.unitPrice,
      total_price: p.quantity * p.unitPrice
    }))

    const { error } = await supabase
      .from('sold_products')
      .insert(soldProducts)

    if (error) {
      console.error('Erro ao adicionar produtos à venda:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro na função addProductsToSale:', error)
    return false
  }
}

// Função para buscar vendas por período
export async function getResellerSalesByPeriod(
  resellerId: string,
  startDate: string,
  endDate: string
): Promise<SaleWithProducts[]> {
  try {
    const { data: sales, error } = await supabase
      .from('sales')
      .select('*')
      .eq('profile_id', resellerId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar vendas por período:', error)
      return []
    }

    // Transformar os dados para o formato esperado
    const salesWithProducts = (sales || []).map((sale) => {
      const products = (sale.sold_products || []).map((soldProduct: any) => ({
        id: soldProduct.product_id,
        name: soldProduct.products?.name || 'Produto não encontrado',
        quantity: soldProduct.quantity,
        unit_price: soldProduct.unit_price,
        total_price: soldProduct.total_price
      }))

      const totalAmount = products.reduce((sum: number, p: any) => sum + p.total_price, 0)

      return {
        id: sale.id,
        created_at: sale.created_at,
        total_amount: totalAmount,
        notes: sale.description,
        reseller_id: sale.profile_id,
        products
      }
    })

    return salesWithProducts
  } catch (error) {
    console.error('Erro na função getResellerSalesByPeriod:', error)
    return []
  }
}