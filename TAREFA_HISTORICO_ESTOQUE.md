# TAREFA: Implementação do Sistema de Histórico de Estoque Real

## Contexto
O sistema atualmente usa dados mock para o histórico de movimentações. Existe uma tabela `inventory_movements` no banco de dados que registra as movimentações, mas não está sendo utilizada na interface. Esta tarefa implementará a integração completa do histórico real.

## Estrutura Atual do Banco (NÃO ALTERAR)

### Tabela `inventory_movements`
```sql
-- Estrutura existente (NÃO MODIFICAR)
CREATE TABLE inventory_movements (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id BIGINT REFERENCES products(id),
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Dados Existentes:**
- 2 registros na tabela
- `quantity` positivo = entrada, negativo = saída
- Referência direta com `products(id)`

## TAREFAS A IMPLEMENTAR

### 1. Criar API para Movimentações de Estoque

**Arquivo: `lib/inventory-api.ts`** (CRIAR)

```typescript
import { supabase } from './supabase'

export interface InventoryMovement {
  id: number
  product_id: number
  quantity: number
  reason: string
  created_at: string
  // Dados do produto (JOIN)
  product?: {
    id: number
    name: string
    code: string
    cost_price: number
    selling_price?: number | null
    category?: {
      id: number
      name: string
    } | null
  }
}

export interface CreateMovementData {
  product_id: number
  quantity: number
  reason: string
}

// Buscar movimentações com dados do produto
export async function getInventoryMovements(): Promise<InventoryMovement[]> {
  const { data, error } = await supabase
    .from('inventory_movements')
    .select(`
      *,
      product:products(
        id,
        name,
        code,
        cost_price,
        selling_price,
        category:categories(id, name)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Buscar movimentações com filtros
export async function getInventoryMovementsFiltered(filters: {
  startDate?: string
  endDate?: string
  productId?: number
  type?: 'entrada' | 'saida' | 'todos'
  reason?: string
}): Promise<InventoryMovement[]> {
  let query = supabase
    .from('inventory_movements')
    .select(`
      *,
      product:products(
        id,
        name,
        code,
        cost_price,
        selling_price,
        category:categories(id, name)
      )
    `)

  // Filtros por data
  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate + 'T00:00:00')
  }
  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate + 'T23:59:59')
  }

  // Filtro por produto
  if (filters.productId) {
    query = query.eq('product_id', filters.productId)
  }

  // Filtro por tipo (entrada/saída)
  if (filters.type === 'entrada') {
    query = query.gt('quantity', 0)
  } else if (filters.type === 'saida') {
    query = query.lt('quantity', 0)
  }

  // Filtro por motivo
  if (filters.reason) {
    query = query.ilike('reason', `%${filters.reason}%`)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// Criar nova movimentação
export async function createInventoryMovement(movementData: CreateMovementData): Promise<InventoryMovement> {
  const { data, error } = await supabase
    .from('inventory_movements')
    .insert([movementData])
    .select(`
      *,
      product:products(
        id,
        name,
        code,
        cost_price,
        selling_price,
        category:categories(id, name)
      )
    `)
    .single()

  if (error) throw error
  return data
}

// Buscar estatísticas do histórico
export async function getInventoryStats(): Promise<{
  totalMovements: number
  totalEntries: number
  totalExits: number
  recentMovements: number
}> {
  // Total de movimentações
  const { count: totalMovements } = await supabase
    .from('inventory_movements')
    .select('*', { count: 'exact', head: true })

  // Entradas (quantity > 0)
  const { count: totalEntries } = await supabase
    .from('inventory_movements')
    .select('*', { count: 'exact', head: true })
    .gt('quantity', 0)

  // Saídas (quantity < 0)
  const { count: totalExits } = await supabase
    .from('inventory_movements')
    .select('*', { count: 'exact', head: true })
    .lt('quantity', 0)

  // Movimentações dos últimos 7 dias
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count: recentMovements } = await supabase
    .from('inventory_movements')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo)

  return {
    totalMovements: totalMovements || 0,
    totalEntries: totalEntries || 0,
    totalExits: totalExits || 0,
    recentMovements: recentMovements || 0
  }
}
```

### 2. Atualizar Component do Transaction Card

**Arquivo: `components/joias/transaction-card.tsx`** (MODIFICAR)

```typescript
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, Send, Calendar, Package } from "lucide-react"
import type { InventoryMovement } from "@/lib/inventory-api"

interface TransactionCardProps {
  movement: InventoryMovement
}

export function TransactionCard({ movement }: TransactionCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Determinar tipo baseado na quantidade
  const getMovementType = (quantity: number) => {
    if (quantity > 0) return 'entrada'
    if (quantity < 0) return 'saida'
    return 'neutro'
  }

  const tipo = getMovementType(movement.quantity)
  const quantidadeAbs = Math.abs(movement.quantity)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "entrada":
        return <ArrowUp className="w-4 h-4 text-green-600" />
      case "saida":
        return <ArrowDown className="w-4 h-4 text-red-600" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "entrada":
        return "bg-green-100 text-green-800 border-green-200"
      case "saida":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "entrada":
        return "Entrada"
      case "saida":
        return "Saída"
      default:
        return "Movimentação"
    }
  }

  // Calcular valor baseado na quantidade e preço
  const calcularValor = () => {
    const produto = movement.product
    if (!produto) return 0
    
    const preco = produto.selling_price || produto.cost_price
    return quantidadeAbs * preco
  }

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getTypeIcon(tipo)}
              <h3 className="font-heading text-foreground">
                {movement.product?.name || 'Produto não encontrado'}
              </h3>
              <Badge className={`text-xs font-body ${getTypeColor(tipo)}`}>
                {getTypeText(tipo)}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground font-body mb-2">
              {movement.reason}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(movement.created_at)}
              </div>
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                {quantidadeAbs} un
              </div>
              {movement.product?.code && (
                <div>
                  Código: {movement.product.code}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-lg font-heading text-foreground">
              {formatCurrency(calcularValor())}
            </p>
            {movement.product?.category && (
              <p className="text-xs text-muted-foreground font-body">
                {movement.product.category.name}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 3. Atualizar Página de Joias - Seção Histórico

**Arquivo: `app/admin/joias/page.tsx`** (MODIFICAR APENAS A SEÇÃO HISTÓRICO)

**Substituir as importações:**
```typescript
// ADICIONAR estas importações
import { getInventoryMovements, getInventoryMovementsFiltered, getInventoryStats } from '@/lib/inventory-api'
import type { InventoryMovement } from '@/lib/inventory-api'
```

**Substituir o estado e dados mock:**
```typescript
// REMOVER mockTransactions e usar dados reais
const [movements, setMovements] = useState<InventoryMovement[]>([])
const [historyStats, setHistoryStats] = useState({
  totalMovements: 0,
  totalEntries: 0,
  totalExits: 0,
  recentMovements: 0
})
```

**Atualizar a função loadData:**
```typescript
const loadData = async () => {
  try {
    setIsLoading(true)
    const [productsData, categoriesData, movementsData, statsData] = await Promise.all([
      getProductsWithDetails(),
      getCategories(),
      getInventoryMovements(),
      getInventoryStats()
    ])
    setProducts(productsData)
    setCategories(categoriesData)
    setMovements(movementsData)
    setHistoryStats(statsData)
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
```

**Atualizar filteredTransactions:**
```typescript
// SUBSTITUIR filteredTransactions por:
const filteredMovements = movements.filter((movement) => {
  const matchesMotivo = movement.reason.toLowerCase().includes(transactionFilters.motivo.toLowerCase())
  
  let matchesTipo = true
  if (transactionFilters.tipo === 'entrada') {
    matchesTipo = movement.quantity > 0
  } else if (transactionFilters.tipo === 'saida') {
    matchesTipo = movement.quantity < 0
  }
  
  // Filtros de data
  let matchesDate = true
  if (transactionFilters.dataInicio || transactionFilters.dataFim) {
    const movementDate = new Date(movement.created_at)
    
    if (transactionFilters.dataInicio) {
      const startDate = new Date(transactionFilters.dataInicio)
      matchesDate = matchesDate && movementDate >= startDate
    }
    
    if (transactionFilters.dataFim) {
      const endDate = new Date(transactionFilters.dataFim + 'T23:59:59')
      matchesDate = matchesDate && movementDate <= endDate
    }
  }
  
  return matchesMotivo && matchesTipo && matchesDate
})
```

**Atualizar a seção de cards de estatísticas do histórico:**
```typescript
// ADICIONAR novos cards de estatísticas reais antes dos filtros
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
  <Card className="border-border">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-body text-muted-foreground">Total Movimentações</CardTitle>
      <Package className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-heading text-foreground">{historyStats.totalMovements}</div>
      <p className="text-xs text-muted-foreground font-body">registros</p>
    </CardContent>
  </Card>

  <Card className="border-border">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-body text-muted-foreground">Entradas</CardTitle>
      <ArrowUp className="h-4 w-4 text-green-600" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-heading text-foreground">{historyStats.totalEntries}</div>
      <p className="text-xs text-muted-foreground font-body">movimentações</p>
    </CardContent>
  </Card>

  <Card className="border-border">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-body text-muted-foreground">Saídas</CardTitle>
      <ArrowDown className="h-4 w-4 text-red-600" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-heading text-foreground">{historyStats.totalExits}</div>
      <p className="text-xs text-muted-foreground font-body">movimentações</p>
    </CardContent>
  </Card>

  <Card className="border-border">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-body text-muted-foreground">Últimos 7 dias</CardTitle>
      <TrendingUp className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-heading text-foreground">{historyStats.recentMovements}</div>
      <p className="text-xs text-muted-foreground font-body">movimentações</p>
    </CardContent>
  </Card>
</div>
```

**Atualizar a lista de transações:**
```typescript
{/* Transactions List */}
<div className="space-y-4">
  {filteredMovements.map((movement) => (
    <TransactionCard key={movement.id} movement={movement} />
  ))}
</div>

{filteredMovements.length === 0 && (
  <Card className="border-border">
    <CardContent className="flex flex-col items-center justify-center py-12">
      <Package className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-heading text-foreground mb-2">Nenhuma movimentação encontrada</h3>
      <p className="text-muted-foreground font-body text-center">
        {movements.length === 0 
          ? "Ainda não há movimentações registradas no sistema."
          : "Tente ajustar os filtros para ver as movimentações."
        }
      </p>
    </CardContent>
  </Card>
)}
```

### 4. Integrar Movimentações Reais no Stock Movement Dialog

**Arquivo: `components/joias/stock-movement-dialog.tsx`** (MODIFICAR)

**Atualizar importações:**
```typescript
import { createInventoryMovement } from "@/lib/inventory-api"
import { useToast } from "@/hooks/use-toast"
```

**Modificar a interface e props:**
```typescript
interface StockMovementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  joia: ProductWithDetails // Usar o tipo correto do sistema
  type: "entrada" | "saida" | "envio"
  onSuccess?: () => void // Callback para recarregar dados
}
```

**Atualizar handleSubmit:**
```typescript
const { toast } = useToast()

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)

  try {
    const quantidadeNum = Number.parseInt(quantidade)
    
    // Determinar quantidade final baseada no tipo
    let quantidadeFinal = quantidadeNum
    if (type === "saida" || type === "envio") {
      quantidadeFinal = -quantidadeNum // Negativo para saídas
    }

    await createInventoryMovement({
      product_id: Number(joia.id),
      quantity: quantidadeFinal,
      reason: motivo
    })

    toast({
      title: "Sucesso",
      description: `${type === 'entrada' ? 'Entrada' : type === 'saida' ? 'Saída' : 'Envio'} registrada com sucesso!`,
    })

    onOpenChange(false)
    setQuantidade("")
    setMotivo("")
    
    // Chamar callback para recarregar dados
    if (onSuccess) {
      onSuccess()
    }
    
  } catch (error) {
    console.error('Erro ao registrar movimentação:', error)
    toast({
      title: "Erro",
      description: "Erro ao registrar movimentação. Tente novamente.",
      variant: "destructive"
    })
  } finally {
    setIsLoading(false)
  }
}
```

### 5. Atualizar Subscrições em Tempo Real

**Arquivo: `app/admin/joias/page.tsx`** (ADICIONAR no useEffect)

```typescript
// Adicionar subscrição para inventory_movements no useEffect existente
const channel = supabase
  .channel('public:joias')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
    loadData()
  })
  .on('postgres_changes', { event: '*', schema: 'public', table: 'product_photos' }, () => {
    loadData()
  })
  .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
    loadData()
  })
  .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_movements' }, () => {
    // ADICIONAR: Recarregar quando houver mudanças nas movimentações
    loadData()
  })
  .subscribe()
```

## VALIDAÇÕES E TESTES

### Testes com MCP Supabase
1. **Verificar dados existentes:**
   ```sql
   SELECT im.*, p.name, p.code 
   FROM inventory_movements im 
   LEFT JOIN products p ON im.product_id = p.id 
   ORDER BY im.created_at DESC;
   ```

2. **Testar inserção de nova movimentação:**
   ```sql
   INSERT INTO inventory_movements (product_id, quantity, reason) 
   VALUES (4, 5, 'Teste de entrada via sistema');
   ```

3. **Testar filtros de data:**
   ```sql
   SELECT * FROM inventory_movements 
   WHERE created_at >= '2024-08-27T00:00:00'
   AND created_at <= '2024-08-27T23:59:59';
   ```

### Checklist de Implementação
- [x] Criar `lib/inventory-api.ts` com todas as funções
- [x] Atualizar `TransactionCard` para usar dados reais
- [x] Modificar página de joias para carregar movimentações reais
- [x] Adicionar cards de estatísticas baseados em dados reais
- [x] Integrar `StockMovementDialog` com API real
- [x] Adicionar subscrição em tempo real para `inventory_movements`
- [x] Testar todos os filtros (data, tipo, motivo)
- [x] Verificar cálculos de valores nos cards
- [x] Testar criação de novas movimentações
- [x] Validar formatação de datas e valores

### Comportamentos Esperados Após Implementação
1. **Histórico exibe dados reais** da tabela `inventory_movements`
2. **Cards mostram estatísticas reais**: total de movimentações, entradas, saídas, etc.
3. **Filtros funcionam** corretamente com dados do banco
4. **Movimentações são registradas** quando usar o Stock Movement Dialog
5. **Interface atualiza em tempo real** quando há mudanças
6. **Valores são calculados** baseados no preço de venda ou custo do produto
7. **Não há mais dados mock** na seção histórico

### Pontos de Atenção
- Manter a interface existente funcionando durante a implementação
- Preservar todos os filtros e funcionalidades atuais
- Garantir que as validações de quantidade (máximo para saída) continuem funcionando
- Manter compatibilidade com os componentes existentes
- Testar com dados reais antes de remover completamente os dados mock

## ENTREGA
A implementação deve resultar em um sistema de histórico completamente funcional que:
1. Exibe dados reais da tabela `inventory_movements`
2. Permite filtrar por data, tipo e motivo
3. Registra novas movimentações no banco
4. Atualiza em tempo real
5. Remove completamente a dependência de dados mock na seção histórico
