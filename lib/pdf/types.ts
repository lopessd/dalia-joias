export interface ShowcasePDFData {
  // Dados do Mostruário
  showcase_id: number
  showcase_code: string
  sent_date: string
  finished_at?: string
  status: 'entregue' | 'finalizado'
  
  // Dados do Distribuidor
  distributor_id: string
  distributor_name: string
  distributor_email: string
  distributor_phone?: string
  distributor_city?: string
  distributor_address?: string
  
  // Produtos
  products: {
    product_id: number
    product_code: string
    product_name: string
    sent_quantity: number
    returned_quantity?: number
    sold_quantity?: number
    unit_price: number
    total_value: number
    commission_percentage?: number
    commission_value?: number
  }[]
  
  // Venda (se houver)
  has_sale: boolean
  sale_id?: number
  sale_date?: string
  sale_description?: string
  
  // Resumo
  summary: {
    total_sent_pieces: number
    total_returned_pieces: number
    total_sold_pieces: number
    total_showcase_value: number
    total_sales_value: number
    total_commission: number
  }
}
