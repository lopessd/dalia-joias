# Feature: Registro de Vendas de Mostruário

## 📋 Visão Geral

Sistema completo para registrar vendas após a finalização de mostruários, permitindo configuração de comissões por produto de forma individual ou global.

## 🎯 Funcionalidades Implementadas

### 1. **Modal de Registro de Vendas** (`RegisterShowcaseSaleDialog`)
- ✅ Interface intuitiva para registrar vendas de mostruários finalizados
- ✅ Cálculo automático de produtos vendidos (enviados - devolvidos)
- ✅ Configuração de comissão global ou individual por produto
- ✅ Exibição de resumo com totais de venda e comissões
- ✅ Validação de dados e feedback ao usuário

### 2. **API de Vendas** (`createShowcaseSale`)
- ✅ Função para criar venda vinculada ao mostruário
- ✅ Registro de produtos vendidos com comissões individuais
- ✅ Cálculo automático do valor total da venda
- ✅ Transações atômicas para garantir integridade dos dados

### 3. **Integração com Cards de Mostruário**
- ✅ Opção "Registrar Venta" no menu dropdown (apenas mostruários finalizados)
- ✅ Abertura automática do modal após finalizar mostruário (se houver produtos vendidos)
- ✅ Sincronização de estados entre diálogos

## 🗄️ Estrutura de Banco de Dados

### Tabelas Utilizadas

#### `sales`
```sql
- id: bigint (PK)
- created_at: timestamp
- profile_id: uuid (FK -> profiles)
- showcase_id: bigint (FK -> showcase)
- description: text (nullable)
- total_value: numeric (≥ 0)
```

#### `sold_products`
```sql
- id: bigint (PK)
- sale_id: bigint (FK -> sales)
- product_id: bigint (FK -> products)
- quantity: integer (> 0)
- sold_price: numeric (≥ 0)
- commission_percentage: numeric (0-100, nullable)
```

### Relacionamentos
- `sales.showcase_id` → `showcase.id` (venda originada de mostruário)
- `sales.profile_id` → `profiles.id` (revendedor)
- `sold_products.sale_id` → `sales.id` (produtos da venda)
- `sold_products.product_id` → `products.id` (produto vendido)

## 🔄 Fluxo de Funcionamento

### 1. Finalização do Mostruário
```
1. Admin finaliza mostruário
2. Registra devoluções de produtos
3. Sistema calcula produtos vendidos (não devolvidos)
4. Se houver produtos vendidos → Abre modal de registro de venda automaticamente
```

### 2. Registro de Venda
```
1. Modal carrega produtos vendidos automaticamente
2. Admin escolhe modo de comissão:
   - Global: mesma % para todos os produtos
   - Individual: % diferente por produto
3. Sistema calcula:
   - Valor total da venda
   - Comissão total do revendedor
4. Admin confirma e registra venda
5. Dados salvos no banco:
   - Registro em 'sales'
   - Registros em 'sold_products' com comissões
```

### 3. Acesso Manual
```
1. Admin acessa card de mostruário finalizado
2. Clica no menu dropdown (⋮)
3. Seleciona "Registrar Venta"
4. Modal abre com produtos vendidos
```

## 📁 Arquivos Criados/Modificados

### Novos Arquivos
- ✅ `components/mostruario/register-showcase-sale-dialog.tsx` (348 linhas)

### Arquivos Modificados
- ✅ `lib/sales-api.ts` (adicionado `createShowcaseSale`)
- ✅ `components/mostruario/mostruario-card.tsx` (integração com modal)
- ✅ `components/mostruario/finish-showcase-dialog.tsx` (abertura automática)

## 🎨 Interface do Usuário

### Modal de Registro de Vendas

#### Cabeçalho
- Título: "Registrar Venta del Muestrario"
- Descrição com código do mostruário

#### Informações do Mostruário
- Distribuidor
- Código do mostruário
- Total de produtos vendidos

#### Controle de Comissão Global
- Switch para ativar/desativar comissão global
- Input para porcentagem (0-100%)
- Visual destacado em azul

#### Lista de Produtos
Para cada produto vendido:
- Nome e código do produto
- Quantidade vendida
- Preço unitário e total
- Campo de comissão individual (se modo individual ativo)
- Valor da comissão calculado automaticamente

#### Descrição
- Campo de texto opcional para notas sobre a venda

#### Resumo
- Total de produtos
- Valor total da venda
- Comissão total do distribuidor

#### Ações
- Botão "Cancelar"
- Botão "Registrar Venta" (desabilitado se não houver produtos)

## 🔐 Validações

### Frontend
- ✅ Comissão entre 0-100%
- ✅ Pelo menos 1 produto vendido
- ✅ Valores numéricos válidos

### Backend
- ✅ CHECK constraints no banco (quantity > 0, sold_price ≥ 0)
- ✅ CHECK constraint em commission_percentage (0-100)
- ✅ Foreign key constraints garantem integridade referencial

## 💡 Exemplos de Uso

### Exemplo 1: Mostruário com vendas parciais
```
Mostruário MST-00008
- Produto A: enviado 5, devolvido 2 → vendido 3
- Produto B: enviado 3, devolvido 0 → vendido 3
- Produto C: enviado 2, devolvido 2 → vendido 0

Modal mostra apenas Produto A e B (produtos com venda > 0)
```

### Exemplo 2: Comissão Global
```
Comissão global: 15%

Produto A: ₲10.000 × 3 = ₲30.000 → Comissão: ₲4.500 (15%)
Produto B: ₲5.000 × 3 = ₲15.000 → Comissão: ₲2.250 (15%)

Total venda: ₲45.000
Comissão total: ₲6.750
```

### Exemplo 3: Comissão Individual
```
Produto A: ₲30.000 → Comissão: 20% = ₲6.000
Produto B: ₲15.000 → Comissão: 10% = ₲1.500

Total venda: ₲45.000
Comissão total: ₲7.500
```

## 🎯 Próximos Passos (Sugestões)

1. **Relatório de Vendas**: Dashboard com vendas por mostruário
2. **Histórico de Comissões**: Visualização de comissões por revendedor
3. **Exportação PDF**: Gerar comprovante de venda
4. **Notificações**: Avisar revendedor sobre registro de venda
5. **Edição de Vendas**: Permitir ajustes em vendas registradas

## 🐛 Tratamento de Erros

- ✅ Erros de API exibidos com toast
- ✅ Validação de formulário em tempo real
- ✅ Loading states durante operações assíncronas
- ✅ Rollback automático em caso de falha na transação

## 📊 Dados Salvos

### Tabela `sales`
```typescript
{
  profile_id: "uuid-do-revendedor",
  showcase_id: 8,
  description: "Venda do mostruário MST-00008 - Nome do Distribuidor",
  total_value: 45000
}
```

### Tabela `sold_products`
```typescript
[
  {
    sale_id: 123,
    product_id: 1,
    quantity: 3,
    sold_price: 10000,
    commission_percentage: 15
  },
  {
    sale_id: 123,
    product_id: 2,
    quantity: 3,
    sold_price: 5000,
    commission_percentage: 15
  }
]
```

## ✅ Checklist de Implementação

- [x] Criar modal RegisterShowcaseSaleDialog
- [x] Criar função createShowcaseSale na API
- [x] Adicionar opção no dropdown do card
- [x] Integrar abertura automática após finalização
- [x] Validar cálculos de comissão
- [x] Testar fluxo completo
- [x] Documentar feature

---

**Data de Implementação**: 23 de outubro de 2025
**Status**: ✅ Completo e Funcional
