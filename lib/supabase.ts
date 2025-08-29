import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Profile {
  id: string
  role: 'admin' | 'reseller'
  created_at: string
}

export interface UserWithProfile {
  id: string
  email: string
  role: 'admin' | 'reseller'
}

// Tipos das tabelas do banco
export interface Product {
  id: number
  code: string
  name: string
  cost_price: number
  selling_price: number | null
  category_id: number | null
  active: boolean
  created_at: string
}

export interface ProductPhoto {
  id: number
  product_id: number
  image: string
  created_at: string
}

export interface Category {
  id: number
  name: string
  description: string | null
  created_at: string
}

// Tipos compostos para UI
export interface ProductWithDetails {
  id: number
  code: string
  name: string
  cost_price: number
  selling_price: number | null
  active: boolean
  created_at: string
  category: Category | null
  photos: ProductPhoto[]
  current_stock: number  // ADICIONAR ESTA LINHA
}

// Tipos para formulários
export interface CreateProductData {
  code: string
  name: string
  cost_price: number
  selling_price?: number | null
  category_id?: number | null
  active?: boolean
}

export interface UpdateProductData {
  code?: string
  name?: string
  cost_price?: number
  selling_price?: number | null
  category_id?: number | null
  active?: boolean
}
