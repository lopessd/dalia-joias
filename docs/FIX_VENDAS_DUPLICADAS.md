# Fix: Prevenção de Vendas Duplicadas e Abertura Automática do Modal

## 🐛 Problemas Identificados

### 1. Vendas Duplicadas
- **Problema**: Era possível registrar múltiplas vendas para o mesmo mostruário
- **Exemplo**: Mostruário 6 tinha 2 vendas registradas (IDs 7 e 8)
- **Causa**: Falta de validação no frontend e backend

### 2. Modal não Abrindo Automaticamente
- **Problema**: Após finalizar mostruário, o modal de registro de venda não abria
- **Causa**: Falta de sincronização entre callbacks e estados

## ✅ Soluções Implementadas

### 1. Constraint UNIQUE no Banco de Dados

#### Migration: `add_unique_constraint_showcase_sales`

```sql
-- Remove vendas duplicadas (mantém apenas a mais recente)
DELETE FROM sold_products 
WHERE sale_id IN (
  SELECT s1.id FROM sales s1
  WHERE s1.showcase_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM sales s2
    WHERE s2.showcase_id = s1.showcase_id
    AND s2.created_at > s1.created_at
  )
);

DELETE FROM sales 
WHERE showcase_id IS NOT NULL
AND id IN (
  SELECT s1.id FROM sales s1
  WHERE EXISTS (
    SELECT 1 FROM sales s2
    WHERE s2.showcase_id = s1.showcase_id
    AND s2.created_at > s1.created_at
  )
);

-- Adiciona constraint UNIQUE
ALTER TABLE sales 
ADD CONSTRAINT sales_showcase_id_unique 
UNIQUE (showcase_id);
```

**Resultado**: Garante integridade no nível do banco de dados

### 2. Validação no Backend

#### Arquivo: `lib/sales-api.ts`

```typescript
export async function createShowcaseSale(data: CreateShowcaseSaleData): Promise<void> {
  // 1. Verificar se já existe venda
  const { data: existingSale } = await supabase
    .from('sales')
    .select('id')
    .eq('showcase_id', data.showcase_id)
    .maybeSingle()

  if (existingSale) {
    throw new Error('Já existe uma venda registrada para este mostruário.')
  }

  // 2. Criar venda com tratamento de erro de constraint
  const { error: saleError } = await supabase
    .from('sales')
    .insert({ /* dados */ })

  if (saleError?.code === '23505') {
    throw new Error('Já existe uma venda registrada para este mostruário.')
  }
  
  // ... resto do código
}
```

**Validações**:
- ✅ Verificação prévia de venda existente
- ✅ Tratamento de erro de constraint duplicada (23505)
- ✅ Mensagens de erro claras

### 3. Atualização da Interface ShowcaseWithDetails

#### Arquivo: `lib/showcase-api.ts`

```typescript
export interface ShowcaseWithDetails {
  // ... campos existentes
  has_sale?: boolean      // Indica se já tem venda registrada
  sale_id?: number        // ID da venda (se houver)
}

// Na função getShowcases():
const salesMap: Record<number, number> = {}

// Buscar vendas registradas
const { data: salesData } = await supabase
  .from('sales')
  .select('id, showcase_id')
  .in('showcase_id', showcaseIds)

salesData.forEach(sale => {
  if (sale.showcase_id) {
    salesMap[sale.showcase_id] = sale.id
  }
})

// Adicionar aos showcases
return {
  ...showcase,
  has_sale: !!salesMap[showcase.id],
  sale_id: salesMap[showcase.id]
}
```

### 4. Controle de UI no Card

#### Arquivo: `components/mostruario/mostruario-card.tsx`

```tsx
{/* Mostra "Registrar Venta" apenas se finalizado E sem venda */}
{mostruario.status === 'finalizado' && !mostruario.has_sale && (
  <DropdownMenuItem onClick={() => setIsRegisterSaleDialogOpen(true)}>
    <TrendingUp className="mr-2 h-4 w-4" />
    Registrar Venta
  </DropdownMenuItem>
)}

{/* Mostra "Venta Registrada" (desabilitado) se já tem venda */}
{mostruario.status === 'finalizado' && mostruario.has_sale && (
  <DropdownMenuItem disabled>
    <CheckCircle className="mr-2 h-4 w-4" />
    Venta Registrada
  </DropdownMenuItem>
)}
```

### 5. Validação no Modal de Registro

#### Arquivo: `components/mostruario/register-showcase-sale-dialog.tsx`

```tsx
// Alerta visual
{mostruario.has_sale && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <AlertCircle className="w-5 h-5 text-red-600" />
    <p>Venta ya registrada</p>
    <p>Este muestrario ya tiene una venta registrada.</p>
  </div>
)}

// Validação no submit
const handleRegisterSale = async () => {
  if (mostruario.has_sale) {
    toast({
      title: "Venda já registrada",
      description: "Este mostruário já possui uma venda registrada.",
      variant: "destructive",
    })
    return
  }
  // ... resto do código
}

// Botão desabilitado
<Button 
  disabled={isLoading || productSales.length === 0 || mostruario.has_sale}
>
  {mostruario.has_sale ? 'Venta ya Registrada' : 'Registrar Venta'}
</Button>
```

### 6. Abertura Automática Corrigida

#### Arquivo: `components/mostruario/finish-showcase-dialog.tsx`

```tsx
const handleFinish = async () => {
  // ... finalizar mostruário
  
  // Calcular produtos vendidos
  const totalNotReturned = productReturns.reduce(
    (sum, p) => sum + (p.sent_quantity - p.returned_quantity), 
    0
  )
  
  onOpenChange(false)
  
  // Atualizar lista e aguardar
  if (onFinished) {
    await onFinished()
  }

  // Abrir modal de venda se houver produtos vendidos
  if (totalNotReturned > 0 && onOpenSaleDialog) {
    setTimeout(() => {
      onOpenSaleDialog()
    }, 500)  // Delay aumentado para garantir atualização
  } else if (totalNotReturned === 0) {
    toast({
      title: "Todos os produtos retornados",
      description: "Não há vendas para registrar.",
    })
  }
}
```

**Melhorias**:
- ✅ Aguarda callback `onFinished` (atualização da lista)
- ✅ Delay aumentado para 500ms
- ✅ Feedback quando não há produtos vendidos
- ✅ Verificação de produtos vendidos antes de abrir modal

## 🔒 Camadas de Proteção

```
┌──────────────────────────────────────────────┐
│ CAMADA 1: Banco de Dados                     │
│ ✅ UNIQUE constraint (sales_showcase_id)     │
│    Impede inserção duplicada                 │
└──────────────────────────────────────────────┘
                    ↑
┌──────────────────────────────────────────────┐
│ CAMADA 2: Backend API                        │
│ ✅ Verificação prévia de venda existente     │
│ ✅ Tratamento de erro de constraint          │
└──────────────────────────────────────────────┘
                    ↑
┌──────────────────────────────────────────────┐
│ CAMADA 3: Validação no Modal                 │
│ ✅ Verificação antes de submit               │
│ ✅ Alerta visual para usuário                │
└──────────────────────────────────────────────┘
                    ↑
┌──────────────────────────────────────────────┐
│ CAMADA 4: Interface (UI)                     │
│ ✅ Opção desabilitada se tem venda           │
│ ✅ Indicador "Venta Registrada"              │
└──────────────────────────────────────────────┘
```

## 📊 Estados do Mostruário

### Fluxo Completo

```
┌─────────────┐
│  ENTREGUE   │
└──────┬──────┘
       │
       │ Admin clica "Finalizar"
       ▼
┌─────────────────────┐
│ FINALIZANDO         │
│ - Registra devoluções│
└──────┬──────────────┘
       │
       │ Tem produtos vendidos?
       ├───────────────────────┐
       │ SIM                   │ NÃO
       ▼                       ▼
┌─────────────┐         ┌──────────────┐
│ FINALIZADO  │         │ FINALIZADO   │
│ has_sale=NO │         │ 100% devolvido│
│             │         └──────────────┘
│ [Abre Modal]│
│ Registro    │
│ de Venda    │
└──────┬──────┘
       │
       │ Admin registra venda
       ▼
┌─────────────┐
│ FINALIZADO  │
│ has_sale=YES│
│ sale_id=X   │
│             │
│ ❌ Bloqueado│
│ para nova   │
│ venda       │
└─────────────┘
```

## 🧪 Testes de Validação

### Teste 1: Tentar Criar Venda Duplicada via API
```typescript
// Primeira venda - deve funcionar
await createShowcaseSale({ showcase_id: 6, ... })
// ✅ Sucesso

// Segunda tentativa - deve falhar
await createShowcaseSale({ showcase_id: 6, ... })
// ❌ Erro: "Já existe uma venda registrada"
```

### Teste 2: Tentar Inserir Direto no Banco
```sql
INSERT INTO sales (showcase_id, profile_id, total_value) 
VALUES (6, 'uuid', 1000);
-- ❌ Erro: duplicate key value violates unique constraint
```

### Teste 3: UI com Venda Existente
- ✅ Dropdown mostra "Venta Registrada" (desabilitado)
- ✅ Modal mostra alerta vermelho
- ✅ Botão "Registrar" desabilitado

### Teste 4: Abertura Automática
- ✅ Finalizar mostruário com produtos vendidos → modal abre
- ✅ Finalizar mostruário 100% devolvido → modal não abre, toast informativo

## 📈 Dados de Validação

### Antes da Correção
```sql
-- Mostruário 6 tinha 2 vendas
SELECT * FROM sales WHERE showcase_id = 6;
-- Resultado:
-- id=7, created_at=2025-10-24 02:05:58
-- id=8, created_at=2025-10-24 02:26:28
```

### Após a Correção
```sql
-- Mostruário 6 tem apenas 1 venda (mais recente)
SELECT * FROM sales WHERE showcase_id = 6;
-- Resultado:
-- id=8, created_at=2025-10-24 02:26:28

-- Constraint ativa
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name = 'sales' AND constraint_type = 'UNIQUE';
-- Resultado:
-- sales_showcase_id_unique ✅
```

## 🎯 Benefícios

1. **Integridade de Dados**: Impossível criar vendas duplicadas
2. **Experiência do Usuário**: Feedback claro sobre estado da venda
3. **Prevenção de Erros**: Múltiplas camadas de validação
4. **Performance**: Constraint no banco é a solução mais eficiente
5. **Manutenibilidade**: Código claro e bem documentado

## 🔄 Fluxo de Trabalho Correto

```
1. Admin finaliza mostruário
   └─> Registra devoluções
   
2. Sistema calcula vendidos
   └─> enviados - devolvidos = vendidos
   
3. Se vendidos > 0:
   └─> Modal abre automaticamente
   
4. Admin configura comissões
   └─> Global ou individual
   
5. Admin confirma registro
   └─> Sistema verifica duplicatas
   
6. Se não tem venda:
   └─> Cria venda e produtos
   └─> Define has_sale = true
   
7. Se já tem venda:
   └─> Bloqueia e mostra erro
   └─> UI desabilita opção
```

## 📝 Notas Importantes

- ✅ Migration executada com sucesso
- ✅ Venda duplicada (ID 7) foi removida automaticamente
- ✅ Constraint `sales_showcase_id_unique` ativa
- ✅ Todos os arquivos atualizados sem erros
- ✅ Interface reflete estado correto do mostruário

---

**Data da Correção**: 24 de outubro de 2025
**Status**: ✅ Implementado e Validado
**Impacto**: Alto - Previne dados incorretos no sistema
