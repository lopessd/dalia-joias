# Fluxo de Registro de Vendas de Mostruário

## 📊 Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────────┐
│                    PÁGINA DE MOSTRUÁRIOS (Admin)                 │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Mostruário 1 │  │ Mostruário 2 │  │ Mostruário 3 │          │
│  │  Entregue    │  │  Finalizado  │  │  Entregue    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘          │
│         │                  │                                      │
│         ▼                  ▼                                      │
│    [Finalizar]      [Ver Detalhes]                              │
│                     [Registrar Venta] ◄── Nova opção            │
│                     [Exportar PDF]                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
    ┌───────────────────────┐   ┌───────────────────────┐
    │ FINALIZAR MOSTRUÁRIO  │   │ REGISTRAR VENDA       │
    │                       │   │   (Manual)            │
    ├───────────────────────┤   ├───────────────────────┤
    │ 1. Inserir devoluções │   │ 1. Abrir modal        │
    │ 2. Calcular vendidos  │   │ 2. Configurar venda   │
    │ 3. Confirmar          │   │ 3. Registrar          │
    └───────────┬───────────┘   └───────────────────────┘
                │
                │ Tem produtos vendidos?
                │
                ▼
         ┌─────────────┐
         │     SIM     │
         └──────┬──────┘
                │
                │ Abre automaticamente
                ▼
    ┌────────────────────────────────┐
    │  MODAL: REGISTRAR VENTA        │
    ├────────────────────────────────┤
    │                                │
    │  📋 Informações do Mostruário  │
    │  - Distribuidor                │
    │  - Código                      │
    │  - Produtos vendidos           │
    │                                │
    │  🎚️ Controle de Comissão       │
    │  ┌──────────────────────────┐  │
    │  │ [ ] Comissão Global      │  │
    │  │                          │  │
    │  │ Porcentaje: [15%]        │  │
    │  └──────────────────────────┘  │
    │                                │
    │  📦 Lista de Produtos          │
    │  ┌──────────────────────────┐  │
    │  │ Produto A                │  │
    │  │ Vendido: 3x × ₲10.000    │  │
    │  │ Comisión: [15%] ₲4.500   │  │
    │  └──────────────────────────┘  │
    │  ┌──────────────────────────┐  │
    │  │ Produto B                │  │
    │  │ Vendido: 2x × ₲5.000     │  │
    │  │ Comisión: [15%] ₲1.500   │  │
    │  └──────────────────────────┘  │
    │                                │
    │  📝 Descripción (opcional)     │
    │  [Venda do mostruário...]      │
    │                                │
    │  💰 RESUMO                     │
    │  ┌──────────────────────────┐  │
    │  │ Productos: 5 piezas      │  │
    │  │ Valor Total: ₲40.000     │  │
    │  │ Comisión: ₲6.000         │  │
    │  └──────────────────────────┘  │
    │                                │
    │  [Cancelar] [Registrar Venta] │
    └────────────┬───────────────────┘
                 │
                 │ Confirmar
                 ▼
    ┌────────────────────────────────┐
    │   SALVAR NO BANCO DE DADOS     │
    ├────────────────────────────────┤
    │                                │
    │  1️⃣ Criar registro em 'sales'  │
    │     - showcase_id              │
    │     - profile_id               │
    │     - total_value              │
    │     - description              │
    │                                │
    │  2️⃣ Criar registros em         │
    │     'sold_products'            │
    │     Para cada produto:         │
    │     - product_id               │
    │     - quantity                 │
    │     - sold_price               │
    │     - commission_percentage    │
    │                                │
    └────────────┬───────────────────┘
                 │
                 │ Sucesso
                 ▼
    ┌────────────────────────────────┐
    │  ✅ VENDA REGISTRADA           │
    │                                │
    │  - Toast de confirmação        │
    │  - Atualizar lista             │
    │  - Fechar modal                │
    └────────────────────────────────┘
```

## 🔄 Estados do Mostruário

```
┌─────────────┐
│  ENTREGUE   │  ← Mostruário enviado ao distribuidor
└──────┬──────┘
       │
       │ Admin finaliza
       │ registra devoluções
       ▼
┌─────────────┐
│ FINALIZADO  │  ← Pode registrar venda
└──────┬──────┘
       │
       │ Admin registra venda
       │ (opcional, múltiplas vezes)
       ▼
┌─────────────┐
│  COM VENDA  │  ← Tem registro em 'sales'
└─────────────┘
```

## 💾 Estrutura de Dados

```
showcase (id: 8, code: "MST-00008")
    ├── profile_id: "uuid-distribuidor"
    ├── status: "finalizado" (calculado)
    │
    ├── inventory_movements (envios)
    │   ├── product_id: 1, quantity: -5 (enviado 5)
    │   ├── product_id: 2, quantity: -3 (enviado 3)
    │   └── product_id: 3, quantity: -2 (enviado 2)
    │
    ├── showcase_returns (devoluções)
    │   ├── product_id: 1, returned_quantity: 2
    │   └── product_id: 3, returned_quantity: 2
    │
    └── sales (vendas registradas)
        ├── id: 123
        ├── total_value: 40000
        │
        └── sold_products
            ├── product_id: 1, quantity: 3, commission: 15%
            │   (5 enviado - 2 devolvido = 3 vendido)
            └── product_id: 2, quantity: 3, commission: 15%
                (3 enviado - 0 devolvido = 3 vendido)
            
            (Produto 3 não aparece, pois foi 100% devolvido)
```

## 🎯 Cálculo de Vendas

```javascript
// Para cada produto no mostruário:
const sentQty = Math.abs(inventory_movement.quantity)        // Ex: 5
const returnedQty = showcase_return?.returned_quantity || 0  // Ex: 2
const soldQty = sentQty - returnedQty                        // Ex: 3

// Se soldQty > 0, produto é incluído na venda
```

## 🔐 Permissões

```
┌──────────────┐
│    ADMIN     │
├──────────────┤
│ ✅ Criar      │
│ ✅ Finalizar  │
│ ✅ Registrar  │
│    Venda     │
└──────────────┘

┌──────────────┐
│ REVENDEDOR   │
├──────────────┤
│ ✅ Ver        │
│    Histórico │
│ ❌ Registrar  │
│    Venda     │
└──────────────┘
```

## 📱 Interface Responsiva

```
Desktop (≥768px):
┌─────────────────────────────────────┐
│ [Grid 3 colunas de cards]           │
│ ┌─────┐ ┌─────┐ ┌─────┐            │
│ │Card │ │Card │ │Card │            │
│ │  1  │ │  2  │ │  3  │            │
│ └─────┘ └─────┘ └─────┘            │
└─────────────────────────────────────┘

Mobile (<768px):
┌───────────────┐
│ [1 coluna]    │
│ ┌───────────┐ │
│ │   Card 1  │ │
│ └───────────┘ │
│ ┌───────────┐ │
│ │   Card 2  │ │
│ └───────────┘ │
│ ┌───────────┐ │
│ │   Card 3  │ │
│ └───────────┘ │
└───────────────┘
```

---

**Legenda**:
- ┌─┐ : Container/Card
- ├─┤ : Separador
- └─┘ : Fim do container
- │   : Conexão vertical
- ─   : Conexão horizontal
- ▼   : Fluxo/Direção
- [ ] : Switch/Checkbox
- [x] : Estado ativo
