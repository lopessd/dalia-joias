# Story 4: Exportação de Mostruários e Vendas para PDF - Instruções para Desenvolvimento

## 📋 Contexto

Implementar funcionalidade de exportação para PDF dos mostruários e suas vendas registradas, seguindo o formato especificado no documento de referência (STORY_4_EXPORTACAO_PDF_MOSTRUARIOS.md).

---

## 🎯 Objetivo

Permitir que administradores exportem mostruários para PDF com todas as informações detalhadas:
- Dados do mostruário (código, datas, status)
- Informações do distribuidor/revendedor
- Lista de produtos enviados com quantidades e valores
- Produtos retornados (se aplicável)
- Produtos vendidos com comissões (se aplicável)
- Resumo financeiro completo

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Relevantes

#### 1. **showcase** (Mostruários)
```sql
- id: bigint (PK)
- code: text (gerado: 'MST-00XXX')
- created_at: timestamptz (data de criação/envio)
- profile_id: uuid (FK -> profiles.id)
```

#### 2. **profiles** (Perfis de Usuários)
```sql
- id: uuid (PK, FK -> auth.users.id)
- role: user_role (enum: 'admin' | 'reseller')
- address: text
- description: text
- active: boolean
- created_at: timestamptz
```

#### 3. **auth.users** (Usuários Supabase Auth)
```sql
- id: uuid (PK)
- email: text
- raw_user_meta_data: jsonb
  - name: string (nome completo do usuário)
```

#### 4. **inventory_movements** (Movimentações de Estoque)
```sql
- id: bigint (PK)
- product_id: bigint (FK -> products.id)
- quantity: integer (negativo = saída/envio, positivo = entrada/retorno)
- reason: text
- showcase_id: bigint (FK -> showcase.id)
- created_at: timestamptz
```

#### 5. **products** (Produtos/Joias)
```sql
- id: bigint (PK)
- code: text (código único)
- name: text
- description: text
- cost_price: numeric (preço de custo)
- selling_price: numeric (preço de venda)
- category_id: bigint (FK -> categories.id)
- active: boolean
- created_at: timestamptz
```

#### 6. **showcase_returns** (Retornos de Mostruários)
```sql
- id: bigint (PK)
- showcase_id: bigint (FK -> showcase.id)
- product_id: bigint (FK -> products.id)
- returned_quantity: integer (quantidade devolvida)
- returned_at: timestamptz (data do retorno)
```

#### 7. **sales** (Vendas)
```sql
- id: bigint (PK)
- profile_id: uuid (FK -> profiles.id)
- showcase_id: bigint (FK -> showcase.id, UNIQUE)
- description: text
- total_value: numeric (valor total da venda)
- created_at: timestamptz
```

#### 8. **sold_products** (Produtos Vendidos)
```sql
- id: bigint (PK)
- sale_id: bigint (FK -> sales.id)
- product_id: bigint (FK -> products.id)
- quantity: integer (quantidade vendida)
- sold_price: numeric (preço de venda unitário)
- commission_percentage: numeric (0-100, comissão do revendedor)
```

---

## 📊 Query SQL Completa para Buscar Dados do PDF

```sql
-- Query para obter TODOS os dados necessários para o PDF de um mostruário
SELECT 
  -- Dados do Mostruário
  s.id as showcase_id,
  s.code as showcase_code,
  s.created_at as sent_date,
  
  -- Dados do Distribuidor/Revendedor
  p.id as distributor_id,
  au.raw_user_meta_data->>'name' as distributor_name,
  au.email as distributor_email,
  p.address as distributor_address,
  p.description as distributor_description,
  
  -- Produtos Enviados (movimentações negativas)
  im.id as movement_id,
  im.quantity as sent_quantity, -- será negativo
  im.created_at as movement_date,
  
  -- Dados dos Produtos
  prod.id as product_id,
  prod.code as product_code,
  prod.name as product_name,
  prod.selling_price,
  prod.cost_price,
  prod.description as product_description,
  
  -- Retornos (se houver)
  sr.id as return_id,
  sr.returned_quantity,
  sr.returned_at,
  
  -- Vendas (se houver)
  sale.id as sale_id,
  sale.total_value as sale_total,
  sale.description as sale_description,
  sale.created_at as sale_date,
  
  -- Produtos Vendidos (se houver venda)
  sp.id as sold_product_id,
  sp.quantity as sold_quantity,
  sp.sold_price,
  sp.commission_percentage

FROM showcase s
LEFT JOIN profiles p ON s.profile_id = p.id
LEFT JOIN auth.users au ON p.id = au.id
LEFT JOIN inventory_movements im ON s.id = im.showcase_id AND im.quantity < 0
LEFT JOIN products prod ON im.product_id = prod.id
LEFT JOIN showcase_returns sr ON s.id = sr.showcase_id AND sr.product_id = prod.id
LEFT JOIN sales sale ON s.id = sale.showcase_id
LEFT JOIN sold_products sp ON sale.id = sp.sale_id AND sp.product_id = prod.id
WHERE s.id = $1  -- Parâmetro: ID do mostruário
ORDER BY prod.name;
```

### Exemplo de Dados Retornados

```json
[
  {
    "showcase_id": 6,
    "showcase_code": "MST-00006",
    "sent_date": "2025-09-12T01:48:38.228988Z",
    "distributor_id": "f278254b-4704-4230-8c4b-3a767320ec9a",
    "distributor_name": "Augusto Santos Lopes",
    "distributor_email": "augustonanuque@gmail.com",
    "distributor_address": "Rua Ponte Nova, N°11",
    "movement_id": 39,
    "sent_quantity": -3,
    "product_id": 32,
    "product_code": "0788",
    "product_name": "Bracelete de Ouro para Teste",
    "selling_price": "12222",
    "cost_price": "212.00",
    "returned_quantity": 2,
    "returned_at": "2025-10-24T02:05:28.705321Z",
    "sale_id": 8,
    "sale_total": "12222",
    "sale_description": "Venda do mostruário MST-00006",
    "sale_date": "2025-10-24T02:26:28.498284Z",
    "sold_product_id": 17,
    "sold_quantity": 1,
    "sold_price": "12222.00",
    "commission_percentage": "9"
  }
]
```

---

## 🛠️ Tecnologias Recomendadas

### Opção 1: **jsPDF + autoTable** (Recomendada)
Biblioteca JavaScript para gerar PDFs no lado do cliente.

```bash
pnpm add jspdf jspdf-autotable
pnpm add -D @types/jspdf
```

**Vantagens:**
- ✅ Geração no cliente (sem backend)
- ✅ Suporte a tabelas complexas
- ✅ Customização total do layout
- ✅ Suporte a imagens e fontes
- ✅ Funciona com Next.js

**Uso Básico:**
```typescript
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const doc = new jsPDF()
doc.text('Hello World', 10, 10)
autoTable(doc, { /* config */ })
doc.save('documento.pdf')
```

### Opção 2: **@react-pdf/renderer**
Biblioteca React para criar PDFs declarativamente.

```bash
pnpm add @react-pdf/renderer
```

**Vantagens:**
- ✅ Sintaxe React-like
- ✅ Componentes reutilizáveis
- ✅ Estilos com CSS-in-JS

**Desvantagens:**
- ⚠️ Mais complexo para layouts customizados
- ⚠️ Curva de aprendizado maior

### Opção 3: **Puppeteer/Playwright** (Backend)
Renderizar HTML para PDF usando headless browser.

**Vantagens:**
- ✅ Usa HTML/CSS normais
- ✅ Melhor para layouts complexos

**Desvantagens:**
- ❌ Requer backend/API route
- ❌ Mais pesado (instala browser)
- ❌ Não funciona no cliente

---

## 📝 Arquivos a Serem Criados/Modificados

### 1. **Nova API Route** (Opção Backend)
📁 `app/api/mostruarios/[id]/pdf/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateShowcasePDF } from '@/lib/pdf-generator'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const showcaseId = parseInt(params.id)
    
    // Buscar dados do mostruário
    const data = await fetchShowcaseDataForPDF(showcaseId)
    
    // Gerar PDF
    const pdfBuffer = await generateShowcasePDF(data)
    
    // Retornar PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="mostruario-${data.code}.pdf"`
      }
    })
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    return NextResponse.json({ error: 'Erro ao gerar PDF' }, { status: 500 })
  }
}
```

### 2. **Biblioteca de Geração de PDF** (Cliente)
📁 `lib/pdf/showcase-pdf-generator.ts`

```typescript
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ShowcasePDFData } from './types'

export async function generateShowcasePDF(data: ShowcasePDFData): Promise<void> {
  const doc = new jsPDF()
  
  // Configurações
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 20
  let yPos = margin
  
  // === CABEÇALHO ===
  doc.setFontSize(20)
  doc.text('MOSTRUÁRIO DE JOIAS', pageWidth / 2, yPos, { align: 'center' })
  yPos += 10
  
  doc.setFontSize(16)
  doc.text(data.showcase_code, pageWidth / 2, yPos, { align: 'center' })
  yPos += 15
  
  // === INFORMAÇÕES DO MOSTRUÁRIO ===
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('Informações do Mostruário', margin, yPos)
  yPos += 7
  
  doc.setFont(undefined, 'normal')
  doc.setFontSize(10)
  doc.text(`Código: ${data.showcase_code}`, margin, yPos)
  yPos += 6
  doc.text(`Data de Envio: ${formatDate(data.sent_date)}`, margin, yPos)
  yPos += 6
  
  if (data.finished_at) {
    doc.text(`Data de Finalização: ${formatDate(data.finished_at)}`, margin, yPos)
    yPos += 6
  }
  
  doc.text(`Status: ${data.status === 'finalizado' ? 'Finalizado' : 'Entregue'}`, margin, yPos)
  yPos += 10
  
  // === DADOS DO DISTRIBUIDOR ===
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('Distribuidor/Revendedor', margin, yPos)
  yPos += 7
  
  doc.setFont(undefined, 'normal')
  doc.setFontSize(10)
  doc.text(`Nome: ${data.distributor_name}`, margin, yPos)
  yPos += 6
  doc.text(`Email: ${data.distributor_email}`, margin, yPos)
  yPos += 6
  
  if (data.distributor_address) {
    doc.text(`Endereço: ${data.distributor_address}`, margin, yPos)
    yPos += 6
  }
  yPos += 5
  
  // === TABELA DE PRODUTOS ===
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('Produtos Enviados', margin, yPos)
  yPos += 7
  
  // Preparar dados da tabela
  const tableData = data.products.map(p => [
    p.product_code,
    p.product_name,
    p.sent_quantity.toString(),
    p.returned_quantity?.toString() || '0',
    p.sold_quantity?.toString() || '0',
    formatCurrency(p.unit_price),
    formatCurrency(p.total_value)
  ])
  
  autoTable(doc, {
    startY: yPos,
    head: [['Código', 'Produto', 'Enviado', 'Devolvido', 'Vendido', 'Preço Unit.', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 30, halign: 'right' },
      6: { cellWidth: 30, halign: 'right' }
    }
  })
  
  yPos = (doc as any).lastAutoTable.finalY + 10
  
  // === RESUMO FINANCEIRO ===
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('Resumo Financeiro', margin, yPos)
  yPos += 7
  
  doc.setFont(undefined, 'normal')
  doc.setFontSize(10)
  
  const summaryData = [
    ['Total de Peças Enviadas:', data.summary.total_sent_pieces.toString()],
    ['Total de Peças Devolvidas:', data.summary.total_returned_pieces.toString()],
    ['Total de Peças Vendidas:', data.summary.total_sold_pieces.toString()],
    ['Valor Total do Mostruário:', formatCurrency(data.summary.total_showcase_value)],
  ]
  
  if (data.has_sale) {
    summaryData.push(
      ['Valor Total de Vendas:', formatCurrency(data.summary.total_sales_value)],
      ['Comissão Total:', formatCurrency(data.summary.total_commission)]
    )
  }
  
  autoTable(doc, {
    startY: yPos,
    body: summaryData,
    theme: 'plain',
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 40, halign: 'right' }
    }
  })
  
  // === RODAPÉ ===
  const footerY = pageHeight - 15
  doc.setFontSize(8)
  doc.setTextColor(128)
  doc.text(`Gerado em: ${formatDateTime(new Date())}`, margin, footerY)
  doc.text('Sistema Dalia Joias', pageWidth - margin, footerY, { align: 'right' })
  
  // Salvar PDF
  doc.save(`mostruario-${data.showcase_code}.pdf`)
}

// Funções auxiliares
function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatCurrency(value: number): string {
  return `₲${value.toLocaleString('es-PY')}`
}
```

### 3. **Interfaces TypeScript**
📁 `lib/pdf/types.ts`

```typescript
export interface ShowcasePDFData {
  // Dados do Mostruário
  showcase_id: number
  showcase_code: string
  sent_date: string
  finished_at?: string
  status: 'entregue' | 'finalizado'
  
  // Dados do Distribuidor
  distributor_id: string
  distributor_name: string
  distributor_email: string
  distributor_address?: string
  
  // Produtos
  products: {
    product_id: number
    product_code: string
    product_name: string
    sent_quantity: number
    returned_quantity?: number
    sold_quantity?: number
    unit_price: number
    total_value: number
    commission_percentage?: number
    commission_value?: number
  }[]
  
  // Venda (se houver)
  has_sale: boolean
  sale_id?: number
  sale_date?: string
  sale_description?: string
  
  // Resumo
  summary: {
    total_sent_pieces: number
    total_returned_pieces: number
    total_sold_pieces: number
    total_showcase_value: number
    total_sales_value: number
    total_commission: number
  }
}
```

### 4. **Função de Fetch de Dados**
📁 `lib/pdf/fetch-showcase-pdf-data.ts`

```typescript
import { supabase } from '../supabase'
import { ShowcasePDFData } from './types'

export async function fetchShowcaseDataForPDF(showcaseId: number): Promise<ShowcasePDFData> {
  // Executar a query SQL completa
  const { data: rawData, error } = await supabase.rpc('get_showcase_pdf_data', {
    p_showcase_id: showcaseId
  })
  
  if (error) {
    console.error('Erro ao buscar dados do mostruário:', error)
    throw new Error(`Erro ao buscar dados: ${error.message}`)
  }
  
  if (!rawData || rawData.length === 0) {
    throw new Error('Mostruário não encontrado')
  }
  
  // Processar dados brutos em estrutura organizada
  const firstRow = rawData[0]
  
  // Agrupar produtos
  const productsMap = new Map()
  let totalSalesValue = 0
  let totalCommission = 0
  
  rawData.forEach((row: any) => {
    if (!productsMap.has(row.product_id)) {
      const sentQty = Math.abs(row.sent_quantity || 0)
      const returnedQty = row.returned_quantity || 0
      const soldQty = row.sold_quantity || 0
      const unitPrice = Number(row.selling_price || row.cost_price || 0)
      const totalValue = sentQty * unitPrice
      const commissionPct = Number(row.commission_percentage || 0)
      const commissionValue = soldQty * unitPrice * (commissionPct / 100)
      
      productsMap.set(row.product_id, {
        product_id: row.product_id,
        product_code: row.product_code,
        product_name: row.product_name,
        sent_quantity: sentQty,
        returned_quantity: returnedQty,
        sold_quantity: soldQty,
        unit_price: unitPrice,
        total_value: totalValue,
        commission_percentage: commissionPct,
        commission_value: commissionValue
      })
      
      totalSalesValue += soldQty * Number(row.sold_price || 0)
      totalCommission += commissionValue
    }
  })
  
  const products = Array.from(productsMap.values())
  
  // Calcular resumo
  const totalSentPieces = products.reduce((sum, p) => sum + p.sent_quantity, 0)
  const totalReturnedPieces = products.reduce((sum, p) => sum + (p.returned_quantity || 0), 0)
  const totalSoldPieces = products.reduce((sum, p) => sum + (p.sold_quantity || 0), 0)
  const totalShowcaseValue = products.reduce((sum, p) => sum + p.total_value, 0)
  
  // Montar objeto final
  const pdfData: ShowcasePDFData = {
    showcase_id: firstRow.showcase_id,
    showcase_code: firstRow.showcase_code,
    sent_date: firstRow.sent_date,
    finished_at: firstRow.returned_at,
    status: firstRow.sale_id ? 'finalizado' : 'entregue',
    
    distributor_id: firstRow.distributor_id,
    distributor_name: firstRow.distributor_name || 'N/A',
    distributor_email: firstRow.distributor_email || 'N/A',
    distributor_address: firstRow.distributor_address,
    
    products: products,
    
    has_sale: !!firstRow.sale_id,
    sale_id: firstRow.sale_id,
    sale_date: firstRow.sale_date,
    sale_description: firstRow.sale_description,
    
    summary: {
      total_sent_pieces: totalSentPieces,
      total_returned_pieces: totalReturnedPieces,
      total_sold_pieces: totalSoldPieces,
      total_showcase_value: totalShowcaseValue,
      total_sales_value: totalSalesValue,
      total_commission: totalCommission
    }
  }
  
  return pdfData
}
```

### 5. **Modificar Card de Mostruário**
📁 `components/mostruario/mostruario-card.tsx`

Modificar a função `handleExportPDF`:

```typescript
const handleExportPDF = async () => {
  try {
    // Mostrar loading
    const loadingToast = toast.loading('Gerando PDF...')
    
    // Buscar dados
    const data = await fetchShowcaseDataForPDF(mostruario.id)
    
    // Gerar PDF
    await generateShowcasePDF(data)
    
    // Remover loading
    toast.dismiss(loadingToast)
    toast.success(`PDF do mostruário ${mostruario.code} gerado com sucesso!`)
  } catch (error) {
    console.error('Erro ao exportar PDF:', error)
    toast.error('Erro ao gerar PDF. Tente novamente.')
  }
}
```

---

## 🎨 Layout do PDF (Conforme Documento de Referência)

### Estrutura Visual

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│              MOSTRUÁRIO DE JOIAS                       │
│                   MST-00006                            │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Informações do Mostruário                            │
│  ─────────────────────────                            │
│  Código: MST-00006                                    │
│  Data de Envio: 12/09/2025                            │
│  Data de Finalização: 24/10/2025                      │
│  Status: Finalizado                                   │
│                                                        │
│  Distribuidor/Revendedor                              │
│  ────────────────────────                             │
│  Nome: Augusto Santos Lopes                           │
│  Email: augustonanuque@gmail.com                      │
│  Endereço: Rua Ponte Nova, N°11                       │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Produtos Enviados                                    │
│  ─────────────────                                    │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ Cód  │ Produto      │ Env│Dev│Ven│ Unit│Tot│    │
│  ├──────────────────────────────────────────────┤    │
│  │ 0788 │ Bracelete... │ 3  │ 2 │ 1 │₲12K │₲37K│    │
│  │ 0789 │ Anel...      │ 5  │ 3 │ 2 │₲5K  │₲25K│    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Resumo Financeiro                                    │
│  ─────────────────                                    │
│                                                        │
│  Total de Peças Enviadas:        8                   │
│  Total de Peças Devolvidas:      5                   │
│  Total de Peças Vendidas:        3                   │
│  Valor Total do Mostruário:      ₲62.000             │
│  Valor Total de Vendas:          ₲24.444             │
│  Comissão Total (9%):            ₲2.200              │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Gerado em: 27/10/2025 14:30    Sistema Dalia Joias  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Estilos e Cores

- **Cabeçalho**: Fonte grande (20pt), centralizado, azul escuro
- **Código**: Fonte média (16pt), centralizado, cinza
- **Seções**: Fonte 12pt, negrito, margem superior
- **Texto**: Fonte 10pt, normal
- **Tabela**: 
  - Cabeçalho: Fundo azul (#2980B9), texto branco
  - Corpo: Fonte 8-9pt, linhas zebradas (opcional)
  - Bordas: Grid completo
- **Resumo**: Texto alinhado à esquerda, valores à direita
- **Rodapé**: Fonte 8pt, cinza claro

---

## ✅ Checklist de Implementação

### Fase 1: Setup Inicial
- [ ] Instalar dependências (`jspdf`, `jspdf-autotable`)
- [ ] Criar pasta `lib/pdf/`
- [ ] Criar interface `ShowcasePDFData` em `types.ts`
- [ ] Testar geração de PDF básico

### Fase 2: Fetch de Dados
- [ ] Implementar `fetchShowcaseDataForPDF()`
- [ ] Testar query SQL no Supabase
- [ ] Validar estrutura de dados retornada
- [ ] Tratar erros e casos edge (mostruário sem produtos, sem venda, etc.)

### Fase 3: Geração de PDF
- [ ] Implementar cabeçalho do PDF
- [ ] Adicionar seção de informações do mostruário
- [ ] Adicionar dados do distribuidor
- [ ] Criar tabela de produtos com `autoTable`
- [ ] Implementar resumo financeiro
- [ ] Adicionar rodapé com data/hora
- [ ] Testar formatação de moeda guarani (₲)

### Fase 4: Integração UI
- [ ] Modificar `handleExportPDF` no `mostruario-card.tsx`
- [ ] Adicionar loading state (toast/spinner)
- [ ] Tratar erros com mensagens amigáveis
- [ ] Testar download do PDF no navegador

### Fase 5: Testes
- [ ] Testar com mostruário "Entregue" (sem retornos/vendas)
- [ ] Testar com mostruário "Finalizado" (com retornos, sem venda)
- [ ] Testar com mostruário "Finalizado" (com venda completa)
- [ ] Testar com múltiplos produtos (5+)
- [ ] Testar com nomes longos de produtos
- [ ] Validar cálculos de totais e comissões
- [ ] Verificar responsividade do PDF (margens, quebras de página)

### Fase 6: Refinamentos
- [ ] Adicionar logo da empresa (se disponível)
- [ ] Melhorar tipografia e espaçamento
- [ ] Adicionar cores conforme identidade visual
- [ ] Otimizar tamanho do arquivo PDF
- [ ] Adicionar metadados ao PDF (título, autor, etc.)

---

## 🧪 Casos de Teste

### Teste 1: Mostruário Entregue (Sem Retornos)
```
Mostruário: MST-00001
Status: Entregue
Produtos: 3 joias (5 peças total)
Retornos: 0
Vendas: Não

Resultado Esperado:
- Tabela mostra apenas "Enviado"
- Colunas "Devolvido" e "Vendido" = 0
- Resumo sem seção de vendas/comissões
```

### Teste 2: Mostruário Finalizado (Sem Venda)
```
Mostruário: MST-00002
Status: Finalizado
Produtos: 4 joias (8 peças enviadas, 6 devolvidas)
Retornos: Sim
Vendas: Não

Resultado Esperado:
- Tabela mostra "Enviado" e "Devolvido"
- Coluna "Vendido" calculada (enviado - devolvido)
- Resumo sem seção de comissões
```

### Teste 3: Mostruário Finalizado (Com Venda)
```
Mostruário: MST-00006
Status: Finalizado
Produtos: 1 joia (3 enviadas, 2 devolvidas, 1 vendida)
Retornos: Sim
Vendas: Sim (comissão 9%)

Resultado Esperado:
- Tabela completa com todas as colunas
- Resumo com valor de venda e comissão
- Comissão calculada: 1 × ₲12.222 × 9% = ₲1.100
```

### Teste 4: Múltiplos Produtos
```
Mostruário: MST-00007
Produtos: 10+ joias

Resultado Esperado:
- Tabela se ajusta automaticamente
- Quebra de página se necessário
- Todos os produtos listados
```

---

## 🚨 Tratamento de Erros

### Erro 1: Mostruário Não Encontrado
```typescript
if (!data || data.length === 0) {
  toast.error('Mostruário não encontrado')
  return
}
```

### Erro 2: Falha na Query
```typescript
if (error) {
  console.error('Erro na query:', error)
  toast.error('Erro ao buscar dados do banco de dados')
  return
}
```

### Erro 3: Falha na Geração do PDF
```typescript
try {
  await generateShowcasePDF(data)
} catch (error) {
  console.error('Erro ao gerar PDF:', error)
  toast.error('Erro ao criar arquivo PDF. Verifique os dados e tente novamente.')
}
```

### Erro 4: Dados Inválidos
```typescript
if (!data.showcase_code || !data.distributor_name) {
  toast.error('Dados do mostruário incompletos')
  return
}
```

---

## 📚 Recursos Adicionais

### Documentação
- **jsPDF**: https://github.com/parallax/jsPDF
- **jsPDF autoTable**: https://github.com/simonbengtsson/jsPDF-AutoTable
- **Supabase TypeScript**: https://supabase.com/docs/reference/javascript

### Exemplos de Código
```typescript
// Adicionar logo ao PDF
const imgData = 'data:image/png;base64,...'
doc.addImage(imgData, 'PNG', margin, yPos, 40, 20)

// Adicionar quebra de página
if (yPos > pageHeight - 50) {
  doc.addPage()
  yPos = margin
}

// Customizar cores da tabela
autoTable(doc, {
  headStyles: {
    fillColor: [41, 128, 185],  // RGB
    textColor: [255, 255, 255]
  },
  alternateRowStyles: {
    fillColor: [245, 245, 245]
  }
})

// Adicionar metadados
doc.setProperties({
  title: `Mostruário ${data.showcase_code}`,
  subject: 'Relatório de Mostruário',
  author: 'Sistema Dalia Joias',
  creator: 'Dalia Joias PDF Generator'
})
```

---

## 🎯 Critérios de Aceitação (Definition of Done)

- [ ] PDF é gerado com sucesso para todos os tipos de mostruário
- [ ] Layout segue o documento de referência
- [ ] Todos os dados estão corretos e formatados
- [ ] Valores monetários usam formato guarani (₲)
- [ ] Datas formatadas em pt-BR
- [ ] Cálculos de totais e comissões estão corretos
- [ ] Tratamento de erros implementado
- [ ] Loading state visível durante geração
- [ ] PDF baixa automaticamente com nome descritivo
- [ ] Funciona em todos os navegadores modernos
- [ ] Código está documentado com comentários
- [ ] Não há console.errors ou warnings
- [ ] Performance aceitável (geração < 2 segundos)

---

## 💡 Melhorias Futuras (Opcional)

1. **Múltiplos Formatos**: Adicionar exportação para Excel/CSV
2. **Email**: Enviar PDF por email diretamente
3. **Personalização**: Permitir admin customizar logo e cores
4. **Histórico**: Salvar PDFs gerados no Supabase Storage
5. **Lote**: Exportar múltiplos mostruários em ZIP
6. **Template**: Criar templates de PDF diferentes
7. **Gráficos**: Adicionar visualizações gráficas (recharts)
8. **Assinatura Digital**: Adicionar QR code de verificação

---

**Data**: 27 de outubro de 2025  
**Prioridade**: Alta  
**Estimativa**: 8-12 horas  
**Complexidade**: Média
