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

// Test route
export async function GET() {
  return NextResponse.json({ message: 'Distributors API funcionando!' })
}

// Função auxiliar para gerar senha aleatória
function generateRandomPassword(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Recebida requisição POST')
    const body = await request.json()
    console.log('📦 API: Body recebido:', JSON.stringify(body, null, 2))
    
    const { name, email, phone, address, description, password } = body
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      )
    }

    console.log('🚀 API: Iniciando criação de distribuidor:', email)
    if (phone) {
      console.log('📞 API: Telefone recebido:', phone, '(será salvo em auth.users.phone e user_metadata)')
    }

    // 1. Gerar senha se não fornecida
    const userPassword = password || generateRandomPassword(8)
    console.log('🔑 API: Senha definida para o usuário')

    // 2. Criar usuário via Supabase Auth Admin
    console.log('👤 API: Criando usuário via Auth Admin...')
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: userPassword,
      email_confirm: true,
      phone: phone?.trim() || null,
      user_metadata: {
        name: name.trim(),
        phone: phone?.trim() || null
      }
    })

    if (authError) {
      console.error('❌ API: Erro ao criar usuário:', authError)
      return NextResponse.json(
        { error: `Erro ao criar conta de usuário: ${authError.message}` },
        { status: 400 }
      )
    }

    if (!authUser?.user) {
      return NextResponse.json(
        { error: 'Usuário não foi criado corretamente' },
        { status: 400 }
      )
    }

    console.log('✅ API: Usuário criado com ID:', authUser.user.id)

    // 3. Criar profile com role='reseller'
    console.log('📝 API: Criando perfil do distribuidor...')
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        role: 'reseller',
        address: address || null,
        description: description || null,
        active: true
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ API: Erro ao criar perfil:', profileError)
      // Tentar limpar o usuário criado
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json(
        { error: `Erro ao criar perfil: ${profileError.message}` },
        { status: 400 }
      )
    }

    console.log('✅ API: Distribuidor criado com sucesso!')

    // 4. Retornar resultado
    const result = {
      user: {
        id: authUser.user.id,
        email: authUser.user.email!
      },
      profile: {
        id: profile.id,
        role: profile.role,
        active: profile.active,
        created_at: profile.created_at
      },
      password: userPassword
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ API: Erro na criação do distribuidor:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro inesperado' },
      { status: 500 }
    )
  }
}
