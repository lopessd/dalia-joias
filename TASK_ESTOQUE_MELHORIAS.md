# TAREFA: Melhorias no Sistema de Gestão de Estoque de Joias

**Data:** 28 de agosto de 2025  
**Projeto:** Sistema Dalia Joias  
**Branch:** backend-joias  
**PO:** Sarah  

---

## 🎯 OBJETIVO GERAL

Implementar 4 melhorias no sistema de gestão de estoque de joias para aprimorar a experiência do usuário e automatizar processos de controle de estoque.

## 🏗️ ESTRUTURA DO BANCO (NÃO ALTERAR)

**Tabelas Existentes:**
- `products`: id, code, name, cost_price, selling_price, category_id, active, created_at
- `inventory_movements`: id, product_id, quantity, reason, created_at
- `product_photos`: id, product_id, image, created_at
- `categories`: id, name, description, created_at

**Lógica de Estoque Atual:**
```sql
-- Estoque Atual = SOMA de todas as quantities do produto
SELECT COALESCE(SUM(quantity), 0) as current_stock 
FROM inventory_movements 
WHERE product_id = [ID_PRODUTO]
```

---

## 📋 IMPLEMENTAÇÕES REQUERIDAS

### 1. EXIBIR QUANTIDADE EM ESTOQUE NO CARD DE JOIA

**Arquivos:** `components/joias/joia-card.tsx`, `lib/products-api.ts`

**Modificar `lib/products-api.ts` - função `getProductsWithDetails()`:**

```typescript
export async function getProductsWithDetails(): Promise<ProductWithDetails[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, description),
      photos:product_photos(id, image),
      inventory_movements(quantity)
    `)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  
  // Calcular estoque atual para cada produto
  const productsWithStock = data?.map(product => ({
    ...product,
    current_stock: product.inventory_movements?.reduce(
      (total, movement) => total + movement.quantity, 0
    ) || 0
  })) || []

  return productsWithStock
}
```

**Atualizar interface em `lib/supabase.ts`:**
```typescript
export interface ProductWithDetails {
  id: number
  code: string
  name: string
  cost_price: number
  selling_price: number | null
  category_id: number | null
  active: boolean
  created_at: string
  category: Category | null
  photos: ProductPhoto[]
  current_stock: number  // ADICIONAR ESTA LINHA
}
```

**Modificar `components/joias/joia-card.tsx` - adicionar após linha da categoria:**

```tsx
// Localizar esta seção no arquivo (aproximadamente linha 60):
<p className="text-sm text-muted-foreground font-body">Código: {joia.code}</p>
<p className="text-sm text-muted-foreground font-body">{joia.category?.name || 'Sem categoria'}</p>
// ADICIONAR APÓS A LINHA DA CATEGORIA:
<div className="flex items-center gap-1 mt-1">
  <Package className="w-4 h-4 text-muted-foreground" />
  <p className="text-sm text-muted-foreground font-body">
    Estoque: {joia.current_stock || 0} unidades
  </p>
</div>
```

---

### 2. CRIAR MOVIMENTAÇÃO AUTOMÁTICA AO CRIAR NOVA JOIA

**Arquivo:** `lib/products-api.ts`

**Modificar função `createProduct()`:**

```typescript
export async function createProduct(productData: CreateProductData): Promise<Product> {
  // Usar transação para garantir integridade
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single()

  if (productError) throw productError

  // Criar movimentação inicial automática
  const { error: movementError } = await supabase
    .from('inventory_movements')
    .insert([{
      product_id: product.id,
      quantity: 0,
      reason: "Entrada de nova jóia no estoque"
    }])

  if (movementError) {
    // Se falhar a movimentação, reverter o produto (soft delete)
    await supabase
      .from('products')
      .update({ active: false })
      .eq('id', product.id)
    
    throw new Error('Erro ao criar movimentação inicial: ' + movementError.message)
  }

  return product
}
```

---

### 3. FUNCIONALIDADE DE UPLOAD DE IMAGEM

**Arquivos:** `lib/products-api.ts`, `components/joias/create-joia-dialog.tsx`, `components/joias/edit-joia-dialog.tsx`

**3.1. Adicionar funções de upload em `lib/products-api.ts`:**

```typescript
// Adicionar no final do arquivo
export async function uploadProductImage(file: File, productCode: string): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${productCode}_${Date.now()}.${fileExt}`
  const filePath = `${productCode}/${fileName}`

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file)

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

export async function deleteProductImage(imagePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from('product-images')
    .remove([imagePath])

  if (error) throw error
}
```

**3.2. Modificar `components/joias/create-joia-dialog.tsx`:**

Localizar a função `addFoto` (aproximadamente linha 135) e substituir:

```tsx
// SUBSTITUIR ESTA FUNÇÃO:
const addFoto = () => {
  const url = prompt("Digite a URL da imagem:")
  if (url && validateImageUrl(url)) {
    setFotos((prev) => [...prev, url])
  } else if (url) {
    toast({
      title: "URL inválida",
      description: "Por favor, insira uma URL de imagem válida",
      variant: "destructive"
    })
  }
}

// POR ESTA NOVA FUNÇÃO:
const addFoto = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    try {
      setIsLoading(true)
      const imageUrl = await uploadProductImage(file, formData.code || `temp_${Date.now()}`)
      setFotos((prev) => [...prev, imageUrl])
      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso!",
        variant: "default"
      })
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a imagem",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  input.click()
}
```

**Importar função no início do arquivo:**
```tsx
import { uploadProductImage, createProduct, addProductPhotos, handleSupabaseError, validateImageUrl } from '@/lib/products-api'
```

**3.3. Aplicar mesmas modificações em `components/joias/edit-joia-dialog.tsx`:**
- Substituir função `addFoto` pela mesma implementação
- Adicionar import do `uploadProductImage`

---

### 4. ABRIR MODAL DE GERENCIAMENTO APÓS CRIAR JOIA

**Arquivos:** `components/joias/create-joia-dialog.tsx`, `app/admin/joias/page.tsx`

**4.1. Modificar props em `components/joias/create-joia-dialog.tsx`:**

```tsx
// Modificar interface no início do arquivo:
interface CreateJoiaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  onSuccess: () => void
  onOpenStockManagement?: (joia: ProductWithDetails) => void  // ADICIONAR ESTA LINHA
}

// Atualizar função component:
export function CreateJoiaDialog({ 
  open, 
  onOpenChange, 
  categories, 
  onSuccess,
  onOpenStockManagement  // ADICIONAR ESTE PARÂMETRO
}: CreateJoiaDialogProps) {
```

**Modificar função `handleSubmit` após sucesso da criação (aproximadamente linha 85):**

```tsx
// Localizar esta seção:
toast({
  title: "Sucesso",
  description: "Joia criada com sucesso!",
  variant: "default"
})

// Reset form e fechar dialog
resetForm()
onOpenChange(false)
onSuccess() // Callback para recarregar dados

// ADICIONAR APÓS onSuccess():
// Abrir modal de gerenciamento de estoque se callback fornecido
if (onOpenStockManagement) {
  // Buscar dados completos da joia recém-criada
  setTimeout(() => {
    onOpenStockManagement({
      ...newProduct,
      category: categories.find(c => c.id === newProduct.category_id) || null,
      photos: fotos.map((url, index) => ({ id: index, product_id: newProduct.id, image: url, created_at: new Date().toISOString() })),
      current_stock: 0
    })
  }, 100)
}
```

**4.2. Modificar o componente pai `app/admin/joias/page.tsx`:**

```tsx
// Adicionar state para controlar modal de estoque
const [stockManagementJoia, setStockManagementJoia] = useState<ProductWithDetails | null>(null)
const [isStockManagementOpen, setIsStockManagementOpen] = useState(false)

// Função para abrir gerenciamento de estoque
const handleOpenStockManagement = (joia: ProductWithDetails) => {
  setStockManagementJoia(joia)
  setIsStockManagementOpen(true)
}

// Modificar componente CreateJoiaDialog:
<CreateJoiaDialog
  open={isCreateDialogOpen}
  onOpenChange={setIsCreateDialogOpen}
  categories={categories}
  onSuccess={loadData}
  onOpenStockManagement={handleOpenStockManagement}  // ADICIONAR ESTA LINHA
/>

// Adicionar modal de gerenciamento após CreateJoiaDialog:
{stockManagementJoia && (
  <StockManagementDialog
    open={isStockManagementOpen}
    onOpenChange={setIsStockManagementOpen}
    joia={stockManagementJoia}
    onSuccess={loadData}
  />
)}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [x] **1.1** Modificar `getProductsWithDetails()` em `lib/products-api.ts`
- [x] **1.2** Atualizar interface `ProductWithDetails` em `lib/supabase.ts`
- [x] **1.3** Adicionar exibição de estoque em `joia-card.tsx`
- [ ] **2.1** Modificar `createProduct()` para criar movimentação automática
- [ ] **3.1** Adicionar funções de upload em `lib/products-api.ts`
- [ ] **3.2** Verificar/criar bucket `product-images` no Supabase Storage
- [ ] **3.3** Modificar `addFoto()` em `create-joia-dialog.tsx`
- [ ] **3.4** Modificar `addFoto()` em `edit-joia-dialog.tsx`
- [ ] **4.1** Adicionar prop `onOpenStockManagement` em `create-joia-dialog.tsx`
- [ ] **4.2** Modificar componente pai para orquestrar modais
- [ ] **4.3** Testar fluxo completo: Criar → Gerenciar Estoque

---

## 🧪 CRITÉRIOS DE TESTE

1. **Card de Joia:** Verificar se exibe estoque correto com ícone Package
2. **Nova Joia:** Confirmar criação de movimentação automática com quantity=0
3. **Upload:** Testar upload real de imagens nos modais criar/editar
4. **Fluxo Modal:** Verificar abertura automática do gerenciamento após criar joia
5. **Integridade:** Testar rollback se movimentação falhar na criação

---

## 🔧 CONFIGURAÇÕES NECESSÁRIAS

**Supabase Storage:**
- Verificar bucket `product-images` existe
- Se não existe, criar com configuração pública
- Configurar RLS policies para upload/acesso

**Comandos para testar bucket:**
```bash
# Testar se bucket existe via console Supabase ou código:
const { data: buckets } = await supabase.storage.listBuckets()
console.log('Buckets disponíveis:', buckets)
```

---

## 🚨 PONTOS DE ATENÇÃO

1. **NÃO ALTERAR** estrutura do banco de dados
2. **MANTER** compatibilidade com funcionalidades existentes  
3. **USAR** transações para operações críticas (criar produto + movimentação)
4. **TESTAR** todos os cenários de erro e rollback
5. **VALIDAR** tipos TypeScript após modificações nas interfaces

---

**Desenvolvedor responsável:** _______________  
**Data de início:** _______________  
**Prazo estimado:** _______________  
**Status:** 🔄 Aguardando desenvolvimento
