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
      const products: SoldProduct[] = (sale.sold_products || []).map((soldProduct: any) => ({
        id: soldProduct.products?.id?.toString() || soldProduct.id.toString(),
        name: soldProduct.products?.name || 'Produto sem nome',
        quantity: soldProduct.quantity,
        unit_price: Number(soldProduct.sold_price),
        total_price: soldProduct.quantity * Number(soldProduct.sold_price)
      }))

      const totalAmount = products.reduce((sum, p) => sum + p.total_price, 0)

      return {
          id: sale.id.toString(),
          created_at: sale.created_at,
          total_amount: totalAmount,
          notes: sale.description || '',
          profile_id: sale.profile_id,
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

      const totalAmount = products.reduce((sum, p) => sum + p.total_price, 0)

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