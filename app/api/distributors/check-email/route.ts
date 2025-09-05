import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente Admin do Supabase (servidor only)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se usuário existe na auth.users
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) {
      console.error('❌ Erro ao listar usuários:', error)
      return NextResponse.json(
        { error: 'Erro ao verificar email no sistema' },
        { status: 500 }
      )
    }

    const exists = users.users.some(user => user.email?.toLowerCase() === email.toLowerCase())
    
    return NextResponse.json({ exists })
    
  } catch (error) {
    console.error('❌ Erro na verificação de email:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro inesperado' },
      { status: 500 }
    )
  }
}
