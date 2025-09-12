import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

console.log('🔧 Inicializando API de Upload...')

// Verificar variáveis de ambiente no momento da importação
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Definida' : '❌ Não encontrada')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Não encontrada')

// Usar a chave anônima que já existe (bucket é público mesmo)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

console.log('SupabaseAdmin criado:', typeof supabaseAdmin)

export async function POST(request: NextRequest) {
  console.log('🚀 === API UPLOAD CHAMADA ===')
  console.log('Method:', request.method)
  console.log('URL:', request.url)
  console.log('Headers:', Object.fromEntries(request.headers.entries()))
  
  // Verificar variáveis de ambiente
  console.log('🔧 VARIÁVEIS DE AMBIENTE:')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Definida' : '❌ Não encontrada')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Definida' : '❌ Não encontrada')
  console.log('supabaseAdmin client:', typeof supabaseAdmin)
  
  try {
    console.log('📤 Iniciando upload...')
    console.log('Tentando importar supabase...')
    
    // Verificar se supabaseAdmin foi inicializado corretamente
    console.log('SupabaseAdmin client:', typeof supabaseAdmin)
    if (!supabaseAdmin) {
      throw new Error('SupabaseAdmin client não inicializado')
    }
    
    console.log('Processando formData...')
    const formData = await request.formData()
    console.log('FormData recebido:', formData)
    
    const file = formData.get('file') as File
    console.log('File extraído:', file)
    
    if (!file) {
      console.log('❌ Nenhum arquivo encontrado')
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    console.log(`📁 Arquivo recebido: ${file.name}, tamanho: ${file.size}, tipo: ${file.type}`)

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      console.log(`❌ Tipo não permitido: ${file.type}`)
      return NextResponse.json(
        { error: `Tipo de arquivo não permitido: ${file.type}. Use apenas JPEG, PNG, WebP ou GIF.` },
        { status: 400 }
      )
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.log(`❌ Arquivo muito grande: ${file.size} bytes`)
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo permitido: 5MB' },
        { status: 400 }
      )
    }

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`
    const filePath = `products/${fileName}`

    console.log(`💾 Salvando como: ${filePath}`)

    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    console.log(`🔄 Arquivo convertido, tamanho: ${arrayBuffer.byteLength} bytes`)

    // Upload para Supabase Storage
    console.log('🚀 Tentando upload para Supabase...')
    console.log('Bucket: product-images')
    console.log('FilePath:', filePath)
    console.log('ArrayBuffer size:', arrayBuffer.byteLength)
    console.log('ContentType:', file.type)
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: '3600'
      })

    console.log('📤 Resultado do upload:')
    console.log('Data:', uploadData)
    console.log('Error:', uploadError)

    if (uploadError) {
      console.error('❌ ERRO DETALHADO no upload do Supabase:')
      console.error('Mensagem:', uploadError.message || 'sem mensagem')
      console.error('Objeto completo:', JSON.stringify(uploadError, null, 2))
      
      return NextResponse.json(
        { 
          error: 'Erro ao fazer upload do arquivo',
          details: uploadError.message || 'Erro desconhecido do Supabase',
          supabaseError: uploadError
        },
        { status: 500 }
      )
    }

    console.log('✅ Upload realizado com sucesso:', uploadData)

    // Obter URL pública da imagem
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filePath)

    console.log('🔗 URL pública gerada:', publicUrl)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath,
      fileName: fileName
    })

  } catch (error) {
    console.error('💥 ERRO CRÍTICO na API de upload:')
    console.error('Tipo do erro:', typeof error)
    console.error('Stack trace:', error)
    console.error('Mensagem:', error instanceof Error ? error.message : 'Erro sem mensagem')
    
    // Garantir que sempre retornamos JSON válido
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : String(error),
        type: typeof error
      },
      { status: 500 }
    )
  }
}

// Endpoint para deletar arquivo
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Iniciando deleção...')
    
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'Caminho do arquivo não fornecido' },
        { status: 400 }
      )
    }

    console.log(`🗑️ Deletando arquivo: ${filePath}`)

    // Deletar arquivo do storage
    const { error: deleteError } = await supabaseAdmin.storage
      .from('product-images')
      .remove([filePath])

    if (deleteError) {
      console.error('❌ Erro ao deletar arquivo:', deleteError)
      return NextResponse.json(
        { 
          error: 'Erro ao deletar arquivo',
          details: deleteError.message 
        },
        { status: 500 }
      )
    }

    console.log('✅ Arquivo deletado com sucesso')

    return NextResponse.json({
      success: true,
      message: 'Arquivo deletado com sucesso'
    })

  } catch (error) {
    console.error('💥 Erro geral na API de deleção:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
