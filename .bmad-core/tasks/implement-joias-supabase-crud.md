# Tarefa: Integração CRUD de Joias com Supabase

## Resumo
Integrar completamente o sistema de gerenciamento de joias com o banco Supabase existente, incluindo operações CRUD para produtos e upload de imagens, mantendo a estrutura atual do banco de dados.

> **CRÍTICO**: Não modificar nenhuma estrutura do banco de dados (tabelas, colunas, políticas).

---

## Objetivo
Implementar integração completa entre os componentes de joias e o banco Supabase, permitindo:
- Adicionar joias ao banco
- Editar joias existentes
- Excluir joias do banco
- Gerenciar imagens na tabela `product_photos`
- Carregar categorias do banco dinamicamente

## Estrutura do Banco (Existente - NÃO MODIFICAR)

### Tabela `products`
```sql
- id: bigint (PK, auto-increment)
- code: text (NOT NULL, UNIQUE)
- name: text (NOT NULL)
- cost_price: numeric (NOT NULL)
- selling_price: numeric (NULLABLE)
- category_id: bigint (FK para categories)
- active: boolean (default: true)
- created_at: timestamptz (default: now())
```

### Tabela `product_photos`
```sql
- id: bigint (PK, auto-increment)
- product_id: bigint (FK para products)
- image: text (NOT NULL) -- URL da imagem
- created_at: timestamptz (default: now())
```

### Tabela `categories`
```sql
- id: bigint (PK, auto-increment)
- name: text (NOT NULL, UNIQUE)
- description: text (NULLABLE)
- created_at: timestamptz (default: now())
```

### Políticas RLS (Existente)
- `products`: Admin full access, public read
- `categories`: Admin full access, public read
- `product_photos`: (assumir mesmas regras que products)

---

## Checklist de Requisitos

### Funcionalidades Core
- [ ] Integrar `CreateJoiaDialog` com Supabase (inserir em `products` + `product_photos`)
- [ ] Integrar `EditJoiaDialog` com Supabase (update `products` + gerenciar `product_photos`)
- [ ] Integrar `DeleteJoiaDialog` com Supabase (soft delete ou hard delete)
- [ ] Carregar lista de joias da tabela `products` com join para `categories` e `product_photos`
- [ ] Carregar categorias dinamicamente da tabela `categories`
- [ ] Implementar upload de imagens (Storage ou Base64/URL)

### UX/UI
- [ ] Toast de sucesso/erro para todas as operações
- [ ] Loading states durante operações
- [ ] Validação de formulários
- [ ] Tratamento de erros de rede/permissão

### Técnico
- [ ] Tipos TypeScript para as entidades do banco
- [ ] Funções helper para operações CRUD
- [ ] Otimização de queries (select específico, joins eficientes)
- [ ] Cleanup de recursos após operações

---

## Implementação Detalhada

### 1. Atualizar tipos TypeScript
Editar `lib/supabase.ts` e adicionar:

```typescript
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
}

// Tipos para formulários
export interface CreateProductData {
  code: string
  name: string
  cost_price: number
  selling_price?: number
  category_id?: number
  active?: boolean
}

export interface UpdateProductData {
  code?: string
  name?: string
  cost_price?: number
  selling_price?: number
  category_id?: number
  active?: boolean
}
```

### 2. Criar funções helper de CRUD
Criar arquivo: `lib/products-api.ts`

```typescript
import { supabase } from './supabase'
import type { 
  Product, 
  ProductPhoto, 
  Category, 
  ProductWithDetails, 
  CreateProductData,
  UpdateProductData 
} from './supabase'

// Buscar produtos com detalhes (categoria + fotos)
export async function getProductsWithDetails(): Promise<ProductWithDetails[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, description),
      photos:product_photos(id, image)
    `)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Buscar categorias
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

// Criar produto
export async function createProduct(productData: CreateProductData): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single()

  if (error) throw error
  return data
}

// Adicionar fotos ao produto
export async function addProductPhotos(productId: number, imageUrls: string[]): Promise<ProductPhoto[]> {
  const photoData = imageUrls.map(url => ({
    product_id: productId,
    image: url
  }))

  const { data, error } = await supabase
    .from('product_photos')
    .insert(photoData)
    .select()

  if (error) throw error
  return data || []
}

// Atualizar produto
export async function updateProduct(productId: number, updates: UpdateProductData): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Deletar fotos do produto
export async function deleteProductPhotos(productId: number): Promise<void> {
  const { error } = await supabase
    .from('product_photos')
    .delete()
    .eq('product_id', productId)

  if (error) throw error
}

// Soft delete produto (marcar como inactive)
export async function deleteProduct(productId: number): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ active: false })
    .eq('id', productId)

  if (error) throw error
}

// Hard delete produto (apenas se necessário)
export async function hardDeleteProduct(productId: number): Promise<void> {
  // Primeiro deletar fotos
  await deleteProductPhotos(productId)
  
  // Depois deletar produto
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) throw error
}
```

### 3. Atualizar `app/admin/joias/page.tsx`
Substituir dados mock por dados reais:

```typescript
// No topo do arquivo
import { useEffect, useState } from 'react'
import { getProductsWithDetails, getCategories } from '@/lib/products-api'
import { useToast } from '@/hooks/use-toast'
import type { ProductWithDetails, Category } from '@/lib/supabase'

// No componente
const [products, setProducts] = useState<ProductWithDetails[]>([])
const [categories, setCategories] = useState<Category[]>([])
const [isLoading, setIsLoading] = useState(true)
const { toast } = useToast()

useEffect(() => {
  loadData()
}, [])

const loadData = async () => {
  try {
    setIsLoading(true)
    const [productsData, categoriesData] = await Promise.all([
      getProductsWithDetails(),
      getCategories()
    ])
    setProducts(productsData)
    setCategories(categoriesData)
  } catch (error) {
    toast({
      title: "Erro",
      description: "Erro ao carregar dados. Tente novamente.",
      variant: "destructive"
    })
  } finally {
    setIsLoading(false)
  }
}

// Função callback para recarregar dados após mudanças
const handleDataChange = () => {
  loadData()
}
```

### 4. Atualizar `CreateJoiaDialog`
Integrar com Supabase:

```typescript
import { createProduct, addProductPhotos } from '@/lib/products-api'
import { useToast } from '@/hooks/use-toast'

// Props devem incluir callback e categorias
interface CreateJoiaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  onSuccess: () => void
}

// No handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)

  try {
    // Validar campos obrigatórios
    if (!formData.code || !formData.name || !formData.cost_price) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      })
      return
    }

    // Criar produto
    const newProduct = await createProduct({
      code: formData.code,
      name: formData.name,
      cost_price: Number(formData.cost_price),
      selling_price: formData.selling_price ? Number(formData.selling_price) : null,
      category_id: formData.category_id ? Number(formData.category_id) : null,
      active: true
    })

    // Adicionar fotos se houver
    if (fotos.length > 0) {
      await addProductPhotos(newProduct.id, fotos)
    }

    toast({
      title: "Sucesso",
      description: "Joia criada com sucesso!",
      variant: "default"
    })

    // Reset form e fechar dialog
    resetForm()
    onOpenChange(false)
    onSuccess() // Callback para recarregar dados

  } catch (error) {
    console.error('Erro ao criar joia:', error)
    toast({
      title: "Erro",
      description: "Erro ao criar joia. Tente novamente.",
      variant: "destructive"
    })
  } finally {
    setIsLoading(false)
  }
}
```

### 5. Atualizar `EditJoiaDialog`
Similar ao create, mas usando `updateProduct`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)

  try {
    // Atualizar produto
    await updateProduct(joia.id, {
      code: formData.code,
      name: formData.name,
      cost_price: Number(formData.cost_price),
      selling_price: formData.selling_price ? Number(formData.selling_price) : null,
      category_id: formData.category_id ? Number(formData.category_id) : null
    })

    // Gerenciar fotos (deletar antigas e adicionar novas se mudaram)
    if (fotosChanged) {
      await deleteProductPhotos(joia.id)
      if (fotos.length > 0) {
        await addProductPhotos(joia.id, fotos)
      }
    }

    toast({
      title: "Sucesso",
      description: "Joia atualizada com sucesso!",
      variant: "default"
    })

    onOpenChange(false)
    onSuccess()

  } catch (error) {
    toast({
      title: "Erro",
      description: "Erro ao atualizar joia. Tente novamente.",
      variant: "destructive"
    })
  } finally {
    setIsLoading(false)
  }
}
```

### 6. Atualizar `DeleteJoiaDialog`
Usar soft delete:

```typescript
const handleDelete = async () => {
  setIsLoading(true)

  try {
    await deleteProduct(joia.id) // Soft delete (active = false)
    
    toast({
      title: "Sucesso",
      description: "Joia excluída com sucesso!",
      variant: "default"
    })

    onOpenChange(false)
    onSuccess()

  } catch (error) {
    toast({
      title: "Erro",
      description: "Erro ao excluir joia. Tente novamente.",
      variant: "destructive"
    })
  } finally {
    setIsLoading(false)
  }
}
```

### 7. Tratamento de Upload de Imagens
Opções para implementar (escolha UMA):

#### Opção A: Supabase Storage (Recomendado)
```typescript
import { supabase } from '@/lib/supabase'

export async function uploadProductImage(file: File, productCode: string): Promise<string> {
  const fileName = `${productCode}-${Date.now()}-${file.name}`
  const filePath = `products/${fileName}`

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file)

  if (error) throw error

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}
```

#### Opção B: URLs externas
```typescript
// Permitir que usuário cole URLs de imagens
// Validar se URL é válida
const validateImageUrl = (url: string): boolean => {
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp)$/i
  return imageExtensions.test(url) || url.includes('placeholder')
}
```

---

## Tratamento de Erros

### Erros Específicos do Supabase
```typescript
const handleSupabaseError = (error: any): string => {
  if (error.code === '23505') {
    return 'Código do produto já existe. Use um código diferente.'
  }
  if (error.code === '23503') {
    return 'Categoria selecionada não existe.'
  }
  if (error.message?.includes('permission denied')) {
    return 'Sem permissão para esta operação. Faça login como administrador.'
  }
  return 'Erro interno. Tente novamente ou contate o suporte.'
}
```

---

## Testes Manuais Obrigatórios

### Funcionalidades Básicas
1. **Criar joia**:
   - [ ] Com todos os campos preenchidos
   - [ ] Apenas campos obrigatórios
   - [ ] Com imagens
   - [ ] Código duplicado (deve falhar)

2. **Listar joias**:
   - [ ] Carrega produtos do banco
   - [ ] Mostra categorias corretas
   - [ ] Exibe imagens carregadas

3. **Editar joia**:
   - [ ] Atualizar informações básicas
   - [ ] Alterar categoria
   - [ ] Adicionar/remover imagens

4. **Excluir joia**:
   - [ ] Soft delete (não aparece mais na lista)
   - [ ] Confirma exclusão

### Casos de Erro
1. **Sem conexão de rede**
2. **Usuário sem permissão** (RLS)
3. **Campos obrigatórios em branco**
4. **Código duplicado**
5. **Categoria inexistente**

---

## Arquivos a Modificar/Criar

### Criar
- `lib/products-api.ts` (funções CRUD)

### Modificar
- `lib/supabase.ts` (adicionar tipos)
- `app/admin/joias/page.tsx` (carregar dados reais)
- `components/joias/create-joia-dialog.tsx` (integrar Supabase)
- `components/joias/edit-joia-dialog.tsx` (integrar Supabase)  
- `components/joias/delete-joia-dialog.tsx` (integrar Supabase)
- `components/joias/joia-card.tsx` (mapear dados do banco)

### Opcional
- Criar bucket `product-images` no Supabase Storage (se usar upload)

---

## Critérios de Aceitação

### Funcionais
- [ ] CRUD completo funciona com banco Supabase
- [ ] Categorias carregadas dinamicamente
- [ ] Imagens podem ser adicionadas/removidas
- [ ] Toast de feedback em todas as operações
- [ ] Validações impedem dados inválidos
- [ ] Políticas RLS respeitadas

### Técnicos
- [ ] Zero queries N+1 (usar joins adequados)
- [ ] Tipos TypeScript sem erros
- [ ] Loading states em todas as operações async
- [ ] Cleanup adequado de recursos
- [ ] Não alteração do schema do banco

### UX
- [ ] Interface responsiva mantida
- [ ] Mensagens de erro claras
- [ ] Operações não bloqueiam UI desnecessariamente
- [ ] Feedback visual para ações do usuário

---

## Notas Importantes

1. **Não modificar banco**: Use apenas as tabelas e colunas existentes
2. **Performance**: Use `select('*')` apenas quando necessário, prefira campos específicos
3. **Segurança**: Confie nas políticas RLS já configuradas
4. **Upload de imagens**: Se usar Supabase Storage, configure políticas adequadas
5. **Transações**: Para operações que envolvem múltiplas tabelas (produto + fotos), considere usar transações

---

Arquivo gerado automaticamente: `.bmad-core/tasks/implement-joias-supabase-crud.md`
