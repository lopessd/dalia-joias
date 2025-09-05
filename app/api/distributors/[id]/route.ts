import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Função para obter cliente Supabase admin de forma segura
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Configuração do Supabase incompleta')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// PUT - Atualizar distribuidor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    console.log('🚀 API: Recebida requisição PUT para distribuidor:', params.id)
    
    const body = await request.json()
    console.log('📦 API: Body recebido:', body)
    
    const { name, email, phone, address, description } = body
    const distributorId = params.id

    // Validar campos obrigatórios
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }
    
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    console.log('🔍 API: Verificando se distribuidor existe...')
    
    // Verificar se o distribuidor existe
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', distributorId)
      .eq('role', 'reseller')
      .single()

    if (profileError || !existingProfile) {
      console.log('❌ API: Distribuidor não encontrado:', profileError)
      return NextResponse.json({ error: 'Distribuidor não encontrado' }, { status: 404 })
    }

    // Verificar se o email já está sendo usado por outro usuário
    if (email) {
      console.log('📧 API: Verificando email duplicado...')
      const { data: existingUser, error: userError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (!userError && existingUser.users) {
        const emailInUse = existingUser.users.find(user => 
          user.email === email.toLowerCase() && user.id !== distributorId
        )
        
        if (emailInUse) {
          console.log('❌ API: Email já está em uso por outro usuário')
          return NextResponse.json({ error: 'Este email já está sendo usado por outro usuário' }, { status: 400 })
        }
      }
    }

    console.log('📝 API: Atualizando dados do usuário...')
    
    // Atualizar dados do usuário no auth.users
    const { data: updatedUser, error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(
      distributorId,
      {
        email: email.toLowerCase(),
        phone: phone?.trim() || null,
        user_metadata: {
          name: name.trim(),
          phone: phone?.trim() || null
        }
      }
    )

    if (updateUserError) {
      console.log('❌ API: Erro ao atualizar usuário:', updateUserError)
      return NextResponse.json({ error: updateUserError.message }, { status: 500 })
    }

    console.log('📝 API: Atualizando perfil do distribuidor...')
    
    // Atualizar dados do perfil
    const { data: updatedProfile, error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({
        address: address?.trim() || null,
        description: description?.trim() || null
      })
      .eq('id', distributorId)
      .select()
      .single()

    if (updateProfileError) {
      console.log('❌ API: Erro ao atualizar perfil:', updateProfileError)
      return NextResponse.json({ error: updateProfileError.message }, { status: 500 })
    }

    console.log('✅ API: Distribuidor atualizado com sucesso!')
    
    return NextResponse.json({
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        name: updatedUser.user.user_metadata?.name,
        phone: updatedUser.user.user_metadata?.phone
      },
      profile: updatedProfile
    })

  } catch (error) {
    console.error('❌ API: Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Gerenciar distribuidor (ativar/desativar, redefinir senha, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    console.log('🚀 API: Recebida requisição PATCH para distribuidor:', params.id)
    
    const body = await request.json()
    console.log('📦 API: Body recebido:', body)
    
    const { action, active, newPassword } = body
    const distributorId = params.id

    console.log('🔍 API: Verificando se distribuidor existe...')
    
    // Verificar se o distribuidor existe
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, active')
      .eq('id', distributorId)
      .eq('role', 'reseller')
      .single()

    if (profileError || !existingProfile) {
      console.log('❌ API: Distribuidor não encontrado:', profileError)
      return NextResponse.json({ error: 'Distribuidor não encontrado' }, { status: 404 })
    }

    let result: any = {}

    // Ação de ativar/desativar perfil
    if (action === 'toggle_status') {
      console.log('🔄 API: Alterando status do distribuidor para:', active)
      
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ active: active })
        .eq('id', distributorId)
        .select()
        .single()

      if (updateError) {
        console.log('❌ API: Erro ao atualizar status:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      result.profile = updatedProfile
      console.log('✅ API: Status atualizado com sucesso!')
    }

    // Ação de gerar nova senha
    if (action === 'reset_password') {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: 'Nova senha deve ter pelo menos 6 caracteres' }, { status: 400 })
      }

      console.log('🔑 API: Gerando nova senha para o distribuidor...')
      
      const { data: updatedUser, error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
        distributorId,
        { password: newPassword }
      )

      if (passwordError) {
        console.log('❌ API: Erro ao atualizar senha:', passwordError)
        return NextResponse.json({ error: passwordError.message }, { status: 500 })
      }

      result.passwordReset = true
      result.newPassword = newPassword
      console.log('✅ API: Senha atualizada com sucesso!')
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ API: Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
