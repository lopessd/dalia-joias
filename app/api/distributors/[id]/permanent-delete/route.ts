import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('🗑️ PERMANENT-DELETE: Iniciando exclusão permanente do distribuidor:', id)
    
    // Cliente admin do Supabase
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

    // Verificar se o distribuidor existe e é realmente um reseller
    const { data: profile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('id', id)
      .eq('role', 'reseller')
      .single()

    if (profileCheckError || !profile) {
      console.error('❌ PERMANENT-DELETE: Distribuidor não encontrado ou não é reseller:', profileCheckError)
      return NextResponse.json(
        { error: 'Distribuidor não encontrado' },
        { status: 404 }
      )
    }

    console.log('✅ PERMANENT-DELETE: Distribuidor encontrado, prosseguindo com exclusão')

    // 1. Deletar registro da tabela profiles
    console.log('🗑️ PERMANENT-DELETE: Deletando perfil da tabela profiles...')
    const { error: profileDeleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id)

    if (profileDeleteError) {
      console.error('❌ PERMANENT-DELETE: Erro ao deletar perfil:', profileDeleteError)
      return NextResponse.json(
        { error: 'Erro ao deletar perfil do distribuidor' },
        { status: 500 }
      )
    }

    // 2. Deletar usuário da auth.users via Admin API
    console.log('🗑️ PERMANENT-DELETE: Deletando usuário da tabela auth.users...')
    const { error: userDeleteError } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (userDeleteError) {
      console.error('❌ PERMANENT-DELETE: Erro ao deletar usuário:', userDeleteError)
      return NextResponse.json(
        { error: 'Erro ao deletar usuário do sistema de autenticação' },
        { status: 500 }
      )
    }

    console.log('✅ PERMANENT-DELETE: Distribuidor excluído permanentemente com sucesso!')

    return NextResponse.json({ 
      success: true,
      message: 'Distribuidor excluído permanentemente com sucesso'
    })

  } catch (error) {
    console.error('❌ PERMANENT-DELETE: Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
