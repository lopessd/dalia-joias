# Feature: Edição de Vendas Registradas

## 📋 Visão Geral

Sistema completo para editar comissões de vendas já registradas em mostruários finalizados, permitindo ajustes de comissões sem precisar recriar a venda.

## 🎯 Funcionalidades Implementadas

### 1. **Modal de Edição de Vendas** (`EditShowcaseSaleDialog`)
- ✅ Carrega dados da venda existente automaticamente
- ✅ Exibe todos os produtos vendidos com suas comissões atuais
- ✅ Permite editar comissões de forma individual ou global
- ✅ Recalcula valores de comissão em tempo real
- ✅ Permite editar descrição da venda
- ✅ Valida e salva alterações no banco de dados

### 2. **API de Edição** (`sales-api.ts`)
- ✅ `getShowcaseSale()`: Busca detalhes completos da venda
- ✅ `updateShowcaseSale()`: Atualiza comissões e descrição
- ✅ Interfaces TypeScript para type safety

### 3. **Integração com UI**
- ✅ Nova opção "Editar Venta" no dropdown (apenas para vendas registradas)
- ✅ Posicionada logo abaixo de "Venta Registrada"
- ✅ Ícone Edit (✏️) em azul
- ✅ Sincronização com lista após edição

## 🗄️ Estrutura de Dados

### Interfaces TypeScript

#### `ShowcaseSaleDetails`
```typescript
interface ShowcaseSaleDetails {
  id: number                    // ID da venda
  showcase_id: number           // ID do mostruário
  profile_id: string            // UUID do revendedor
  description?: string          // Descrição da venda
  total_value: number           // Valor total
  created_at: string            // Data de criação
  products: {
    sold_product_id: number     // ID do registro em sold_products
    product_id: number          // ID do produto
    product_name: string        // Nome do produto
    product_code: string        // Código do produto
    quantity: number            // Quantidade vendida
    sold_price: number          // Preço de venda
    commission_percentage: number // Comissão atual
  }[]
}
```

#### `UpdateShowcaseSaleData`
```typescript
interface UpdateShowcaseSaleData {
  sale_id: number               // ID da venda a atualizar
  description?: string          // Nova descrição (opcional)
  products: {
    sold_product_id: number     // ID do produto vendido
    commission_percentage: number // Nova comissão
  }[]
}
```

## 🔄 Fluxo de Funcionamento

### 1. Acesso ao Modal
```
1. Usuario clica no dropdown do card
2. Se mostruário tem venda (has_sale = true)
3. Mostra "Venta Registrada" (desabilitado)
4. Mostra "Editar Venta" (habilitado, azul)
5. Clique abre modal de edição
```

### 2. Carregamento de Dados
```
1. Modal abre e mostra loading
2. Chama getShowcaseSale(sale_id)
3. Busca venda da tabela 'sales'
4. Busca produtos da tabela 'sold_products'
5. Junta dados de produtos da tabela 'products'
6. Popula formulário com dados atuais
7. Detecta se todas comissões são iguais
   └─> Se sim: ativa modo global automaticamente
```

### 3. Edição de Comissões
```
Modo Global:
  └─> Switch ativo
  └─> Campo único de porcentagem
  └─> Aplica mesma % para todos produtos
  └─> Recalcula comissões instantaneamente

Modo Individual:
  └─> Switch desativado
  └─> Campo de % para cada produto
  └─> Permite valores diferentes por produto
  └─> Recalcula comissão de cada item
```

### 4. Salvamento
```
1. Usuário clica "Guardar Cambios"
2. Valida dados (comissões 0-100%)
3. Chama updateShowcaseSale()
4. Atualiza descrição em 'sales' (se alterada)
5. Para cada produto:
   └─> UPDATE sold_products 
   └─> SET commission_percentage = novo_valor
   └─> WHERE id = sold_product_id
6. Toast de sucesso
7. Fecha modal
8. Recarrega lista de mostruários
```

## 📁 Arquivos Criados/Modificados

### Novos Arquivos
- ✅ `components/mostruario/edit-showcase-sale-dialog.tsx` (450+ linhas)

### Arquivos Modificados
- ✅ `lib/sales-api.ts`
  - Adicionado `ShowcaseSaleDetails` interface
  - Adicionado `UpdateShowcaseSaleData` interface
  - Adicionado `getShowcaseSale()` function
  - Adicionado `updateShowcaseSale()` function

- ✅ `components/mostruario/mostruario-card.tsx`
  - Import do `EditShowcaseSaleDialog`
  - Import do ícone `Edit`
  - State `isEditSaleDialogOpen`
  - Nova opção no dropdown
  - Renderização do modal

## 🎨 Interface do Usuário

### Dropdown do Card

#### Antes (sem venda):
```
┌─────────────────────┐
│ Ver Detalles        │
│ Finalizar Mostruário│
│ ──────────────────  │
│ Exportar PDF        │
└─────────────────────┘
```

#### Depois (venda registrada):
```
┌─────────────────────┐
│ Ver Detalles        │
│ ──────────────────  │
│ ✓ Venta Registrada  │ ← Desabilitado (cinza)
│ ✏️ Editar Venta     │ ← NOVO! (azul)
│ ──────────────────  │
│ Exportar PDF        │
└─────────────────────┘
```

### Modal de Edição

#### Estrutura:
```
┌─────────────────────────────────────────┐
│ 💵 Editar Venta del Muestrario          │
├─────────────────────────────────────────┤
│                                          │
│ [Estado: Cargando...]  ← Skeleton       │
│                                          │
│ OU após carregar:                        │
│                                          │
│ 📋 Informações do Mostruário            │
│ ┌─────────────────────────────────────┐ │
│ │ Distribuidor: Nome                  │ │
│ │ Código: MST-00006                   │ │
│ │ Productos: 5 piezas                 │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ 🎚️ Comissão Global [Switch]             │
│ ┌─────────────────────────────────────┐ │
│ │ Porcentaje: [15] %                  │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ 📦 Productos Vendidos                   │
│ ┌─────────────────────────────────────┐ │
│ │ Produto A                    3x     │ │
│ │ Unitario: ₲10.000  Total: ₲30.000   │ │
│ │ Comisión: [15] %                    │ │
│ │ 💚 Comisión: ₲4.500                 │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ 📝 Descripción                          │
│ [Venda do mostruário...]                │
│                                          │
│ 💰 RESUMO                               │
│ ┌─────────────────────────────────────┐ │
│ │ Productos: 5 piezas                 │ │
│ │ Valor Total: ₲40.000                │ │
│ │ Comisión: ₲6.000                    │ │
│ └─────────────────────────────────────┘ │
│                                          │
│         [Cancelar] [💾 Guardar Cambios] │
└─────────────────────────────────────────┘
```

## 🔐 Validações

### Frontend
- ✅ Comissão entre 0-100%
- ✅ Recálculo automático ao alterar valores
- ✅ Loading state durante busca e salvamento
- ✅ Desabilita botões durante operações

### Backend
- ✅ Verifica se venda existe antes de buscar
- ✅ Verifica se produtos existem antes de atualizar
- ✅ Transações individuais por produto (rollback automático)
- ✅ CHECK constraints do banco (0-100%)

## 💡 Exemplos de Uso

### Exemplo 1: Editar Comissão Global
```
Situação Atual:
  Produto A: 3x ₲10.000 = ₲30.000 (comissão 10% = ₲3.000)
  Produto B: 2x ₲5.000 = ₲10.000 (comissão 10% = ₲1.000)
  Total comissão: ₲4.000

Admin quer aumentar para 15%:
  1. Ativa comissão global
  2. Define 15%
  3. Sistema recalcula:
     Produto A: ₲30.000 × 15% = ₲4.500
     Produto B: ₲10.000 × 15% = ₲1.500
     Total comissão: ₲6.000
  4. Salva alterações
```

### Exemplo 2: Comissões Individuais
```
Admin quer premiar produto A com mais comissão:
  1. Desativa comissão global
  2. Produto A: define 20%
  3. Produto B: mantém 10%
  4. Sistema recalcula:
     Produto A: ₲30.000 × 20% = ₲6.000
     Produto B: ₲10.000 × 10% = ₲1.000
     Total comissão: ₲7.000
  5. Salva alterações
```

### Exemplo 3: Editar Descrição
```
Descrição atual: "Venda do mostruário MST-00006"
Admin adiciona nota: "Cliente solicitou entrega urgente"
Salva → descrição atualizada no banco
```

## 🔄 Queries SQL Executadas

### Buscar Venda
```sql
-- 1. Buscar dados da venda
SELECT id, showcase_id, profile_id, description, total_value, created_at
FROM sales
WHERE id = 8;

-- 2. Buscar produtos vendidos
SELECT 
  sp.id,
  sp.product_id,
  sp.quantity,
  sp.sold_price,
  sp.commission_percentage,
  p.name,
  p.code
FROM sold_products sp
JOIN products p ON p.id = sp.product_id
WHERE sp.sale_id = 8;
```

### Atualizar Venda
```sql
-- 1. Atualizar descrição (opcional)
UPDATE sales 
SET description = 'Nova descrição'
WHERE id = 8;

-- 2. Atualizar comissão de cada produto
UPDATE sold_products
SET commission_percentage = 15
WHERE id = 17;

UPDATE sold_products
SET commission_percentage = 20
WHERE id = 18;
-- ... para cada produto
```

## 📊 Comparação: Registro vs Edição

| Aspecto | Registro de Venda | Edição de Venda |
|---------|-------------------|-----------------|
| **Quando** | Após finalizar mostruário | Venda já registrada |
| **Dados Carregados** | Calcula do mostruário | Busca do banco |
| **Pode Criar?** | ✅ Sim (se não existe) | ❌ Não (venda já existe) |
| **Pode Editar Produtos?** | ❌ Não (fixos) | ❌ Não (fixos) |
| **Pode Editar Comissões?** | ✅ Sim (define) | ✅ Sim (altera) |
| **Pode Editar Descrição?** | ✅ Sim | ✅ Sim |
| **Botão** | "Registrar Venta" | "Guardar Cambios" |
| **Ícone** | CheckCircle ✓ | Save 💾 |
| **Cor** | Verde | Azul |

## 🎯 Benefícios

1. **Flexibilidade**: Ajustar comissões sem recriar venda
2. **Correção de Erros**: Corrigir porcentagens incorretas
3. **Negociação**: Atualizar comissões após acordo
4. **Histórico**: Mantém registro original (created_at)
5. **Sem Duplicatas**: Edita registro existente, não cria novo
6. **UX Intuitiva**: Modal similar ao de registro
7. **Performance**: Atualiza apenas campos necessários

## 🔍 Diferenças de Implementação

### Registro (RegisterShowcaseSaleDialog)
```typescript
// Calcula produtos do mostruário
const outgoingMovements = mostruario.movements.filter(m => m.quantity < 0)
const soldQty = sentQty - returnedQty

// Cria nova venda
await createShowcaseSale({
  showcase_id,
  products: [...]
})
```

### Edição (EditShowcaseSaleDialog)
```typescript
// Busca dados existentes
const saleData = await getShowcaseSale(mostruario.sale_id)

// Atualiza apenas comissões
await updateShowcaseSale({
  sale_id,
  products: [{ sold_product_id, commission_percentage }]
})
```

## 🛡️ Proteções

```
Tentativa de editar venda inexistente:
  ❌ API retorna erro 404
  ❌ Modal mostra toast de erro
  ❌ Modal fecha automaticamente

Tentativa de definir comissão inválida:
  ❌ Frontend limita 0-100%
  ❌ CHECK constraint no banco rejeita

Erro durante salvamento:
  ❌ Rollback automático (transação)
  ❌ Toast de erro com mensagem
  ❌ Dados permanecem inalterados
```

## 📝 Notas Técnicas

- ✅ Loading skeleton durante busca de dados
- ✅ Desabilita formulário durante salvamento
- ✅ Recálculo em tempo real de comissões
- ✅ Detecta automaticamente modo global
- ✅ Valida comissões no frontend (0-100%)
- ✅ Atualização otimizada (só campos alterados)
- ✅ Callback `onSaleUpdated` recarrega lista
- ✅ Toast informativos para sucesso/erro

## 🚀 Melhorias Futuras (Sugestões)

1. **Histórico de Alterações**: Log de mudanças em comissões
2. **Permissões**: Limitar edição a administradores específicos
3. **Auditoria**: Registrar quem e quando alterou
4. **Limites**: Definir comissão mínima/máxima por produto
5. **Cálculo Automático**: Sugerir comissão baseada em margem
6. **Exportar Relatório**: PDF com detalhes da venda editada

---

**Data de Implementação**: 25 de outubro de 2025
**Status**: ✅ Completo e Funcional
**Impacto**: Médio - Melhora flexibilidade do sistema
