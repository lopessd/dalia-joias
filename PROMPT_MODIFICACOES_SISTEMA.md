# PROMPT DE DESENVOLVIMENTO - Sistema de Gestão de Joias

## 🎯 CONTEXTO E OBJETIVO

Implementar três modificações específicas no sistema de gestão de joias, mantendo a estrutura do banco de dados intacta:

1. **Botão de Limpar Filtros** na aba Histórico
2. **Remoção de itens** do dropdown das joias (Entrada, Saída, Envio)  
3. **Nova opção "Gerenciar Estoque"** com modal para registrar movimentações

## 📊 ESTRUTURA DO BANCO (NÃO ALTERAR)

### Tabela `inventory_movements` - REFERÊNCIA
```sql
CREATE TABLE inventory_movements (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id BIGINT REFERENCES products(id),
  quantity INTEGER NOT NULL, -- Positivo=Entrada, Negativo=Saída
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Dados Existentes Confirmados:**
- 4 registros na tabela
- Sistema já integrado com a API `inventory-api.ts`
- Relacionamento funcional com `products`

---

## 🎯 MODIFICAÇÃO 1: Botão "Limpar Filtros" na Aba Histórico

### **Arquivo:** `app/admin/joias/page.tsx`

**LOCALIZAÇÃO:** Seção de filtros do histórico (linha ~370-430)

**IMPLEMENTAÇÃO:**

1. **Adicionar o botão** no final da seção de filtros:
```tsx
// Localizar a div com grid-cols-1 md:grid-cols-4 e adicionar uma coluna extra
<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
  {/* Filtros existentes permanecem iguais */}
  
  {/* NOVO: Botão Limpar Filtros */}
  <div className="space-y-2">
    <Label className="font-body">Ações</Label>
    <Button
      variant="outline"
      onClick={clearAllFilters}
      className="w-full font-body gap-2"
      disabled={!hasActiveFilters()}
    >
      <X className="w-4 h-4" />
      Limpar Filtros
    </Button>
  </div>
</div>
```

2. **Adicionar funções de controle:**
```tsx
// Adicionar junto com os outros estados
const clearAllFilters = () => {
  setTransactionFilters({
    dataInicio: "",
    dataFim: "",
    motivo: "",
    tipo: "todos",
  })
}

const hasActiveFilters = () => {
  return (
    transactionFilters.dataInicio !== "" ||
    transactionFilters.dataFim !== "" ||
    transactionFilters.motivo !== "" ||
    transactionFilters.tipo !== "todos"
  )
}
```

3. **Importação necessária:**
```tsx
import { X } from "lucide-react" // Adicionar aos imports existentes
```

---

## 🎯 MODIFICAÇÃO 2: Remover Itens do Dropdown das Joias

### **Arquivo:** `components/joias/joia-card.tsx`

**LOCALIZAÇÃO:** DropdownMenu (linha ~70-90)

**AÇÃO:** Remover completamente estes 3 itens:
```tsx
// REMOVER ESTES 3 DropdownMenuItem:
<DropdownMenuItem onClick={() => handleStockMovement("entrada")} className="font-body">
  <Plus className="mr-2 h-4 w-4" />
  Entrada
</DropdownMenuItem>
<DropdownMenuItem onClick={() => handleStockMovement("saida")} className="font-body">
  <Minus className="mr-2 h-4 w-4" />
  Saída
</DropdownMenuItem>
<DropdownMenuItem onClick={() => handleStockMovement("envio")} className="font-body">
  <Send className="mr-2 h-4 w-4" />
  Envio
</DropdownMenuItem>
```

**RESULTADO:** O dropdown deve conter apenas:
- ✅ Editar Joia
- ✅ **Gerenciar Estoque** (nova opção - ver Modificação 3)
- ✅ Excluir

---

## 🎯 MODIFICAÇÃO 3: Nova Opção "Gerenciar Estoque" com Modal

### **A. Modificar `components/joias/joia-card.tsx`**

1. **Adicionar novo estado:**
```tsx
const [isStockManagementDialogOpen, setIsStockManagementDialogOpen] = useState(false)
```

2. **Substituir os 3 itens removidos por:**
```tsx
<DropdownMenuItem 
  onClick={() => setIsStockManagementDialogOpen(true)} 
  className="font-body"
>
  <Package className="mr-2 h-4 w-4" />
  Gerenciar Estoque
</DropdownMenuItem>
```

3. **Adicionar o componente do modal antes do fechamento:**
```tsx
<StockManagementDialog
  open={isStockManagementDialogOpen}
  onOpenChange={setIsStockManagementDialogOpen}
  joia={joia}
  onSuccess={onDataChange}
/>
```

4. **Importações necessárias:**
```tsx
import { Package } from "lucide-react" // Adicionar aos imports
```

### **B. Criar `components/joias/stock-management-dialog.tsx`**

**ARQUIVO COMPLETAMENTE NOVO:**

```tsx
"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Package } from "lucide-react"
import { createInventoryMovement } from "@/lib/inventory-api"
import { useToast } from "@/hooks/use-toast"
import type { ProductWithDetails } from "@/lib/supabase"

interface StockManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  joia: ProductWithDetails
  onSuccess?: () => void
}

export function StockManagementDialog({ 
  open, 
  onOpenChange, 
  joia, 
  onSuccess 
}: StockManagementDialogProps) {
  const [movementType, setMovementType] = useState<"entrada" | "saida">("entrada")
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const resetForm = () => {
    setMovementType("entrada")
    setQuantity("")
    setReason("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const quantityNumber = parseInt(quantity)
      
      // Validações
      if (quantityNumber <= 0) {
        throw new Error("Quantidade deve ser maior que zero")
      }

      // Determinar quantidade final baseada no tipo
      const finalQuantity = movementType === "entrada" ? quantityNumber : -quantityNumber

      await createInventoryMovement({
        product_id: Number(joia.id),
        quantity: finalQuantity,
        reason: reason
      })

      toast({
        title: "Sucesso!",
        description: `${movementType === "entrada" ? "Entrada" : "Saída"} registrada com sucesso.`,
      })

      onOpenChange(false)
      resetForm()
      
      if (onSuccess) {
        onSuccess()
      }
      
    } catch (error: any) {
      console.error('Erro ao registrar movimentação:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar movimentação. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Package className="w-5 h-5" />
            Gerenciar Estoque
          </DialogTitle>
          <DialogDescription className="font-body">
            Registre uma entrada ou saída de estoque para este produto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações do Produto */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h4 className="font-heading text-sm text-foreground">{joia.name}</h4>
                <p className="text-xs text-muted-foreground font-body">
                  Código: {joia.code}
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  Categoria: {joia.category?.name || 'Sem categoria'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tipo de Movimentação */}
          <div className="space-y-3">
            <Label className="font-body font-medium">Tipo de Movimentação *</Label>
            <RadioGroup
              value={movementType}
              onValueChange={(value: "entrada" | "saida") => setMovementType(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="entrada" id="entrada" />
                <Label htmlFor="entrada" className="font-body flex items-center gap-2 cursor-pointer">
                  <ArrowUp className="w-4 h-4 text-green-600" />
                  Entrada de Estoque
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="saida" id="saida" />
                <Label htmlFor="saida" className="font-body flex items-center gap-2 cursor-pointer">
                  <ArrowDown className="w-4 h-4 text-red-600" />
                  Saída de Estoque
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Quantidade */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="font-body font-medium">
              Quantidade *
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="Digite a quantidade"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="font-body"
            />
            <p className="text-xs text-muted-foreground font-body">
              Informe a quantidade de peças para {movementType === "entrada" ? "entrada" : "saída"}
            </p>
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="font-body font-medium">
              Motivo da Movimentação *
            </Label>
            <Textarea
              id="reason"
              placeholder={`Descreva o motivo da ${movementType}...`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              className="font-body"
            />
            <p className="text-xs text-muted-foreground font-body">
              Ex: Compra de fornecedor, Venda, Perda, Devolução, etc.
            </p>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="font-body"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="font-body"
            >
              {isLoading ? "Registrando..." : `Registrar ${movementType === "entrada" ? "Entrada" : "Saída"}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### **C. Atualizar Importação em `joia-card.tsx`**

```tsx
// Adicionar aos imports existentes
import { StockManagementDialog } from "./stock-management-dialog"
```

---

## 🧪 VALIDAÇÃO E TESTES

### **Testes Funcionais Necessários:**

1. **Botão Limpar Filtros:**
   - ✅ Aplicar filtros diversos e verificar se o botão limpa todos
   - ✅ Verificar se botão fica desabilitado quando não há filtros ativos
   - ✅ Confirmar que a lista de movimentações atualiza corretamente

2. **Dropdown Modificado:**
   - ✅ Verificar que Entrada, Saída e Envio foram removidos
   - ✅ Confirmar que "Gerenciar Estoque" aparece
   - ✅ Testar clique para abrir modal

3. **Modal Gerenciar Estoque:**
   - ✅ Testar alternância entre Entrada/Saída
   - ✅ Validar campos obrigatórios (quantidade > 0, motivo preenchido)
   - ✅ Confirmar registro no banco via MCP Supabase
   - ✅ Verificar atualização da interface após registro

### **Consulta SQL para Validar Registros:**
```sql
SELECT im.*, p.name as product_name, p.code as product_code 
FROM inventory_movements im 
JOIN products p ON im.product_id = p.id 
ORDER BY im.created_at DESC LIMIT 5;
```

### **Comportamentos Esperados:**

1. **Entrada:** `quantity` positivo no banco
2. **Saída:** `quantity` negativo no banco  
3. **Interface atualiza** em tempo real após cada movimentação
4. **Filtros funcionam** corretamente com novo botão de limpar
5. **Modal fecha** e limpa campos após registro bem-sucedido

---

## ⚠️ PONTOS DE ATENÇÃO

1. **Não alterar** estrutura do banco `inventory_movements`
2. **Manter** toda API existente em `inventory-api.ts`
3. **Preservar** funcionalidades existentes do histórico
4. **Testar** integração em tempo real com Supabase
5. **Validar** que remoção dos itens do dropdown não quebra outras funcionalidades

---

## 📦 ENTREGÁVEIS

✅ **3 arquivos modificados:**
- `app/admin/joias/page.tsx` (botão limpar filtros)
- `components/joias/joia-card.tsx` (dropdown modificado)

✅ **1 arquivo novo:**
- `components/joias/stock-management-dialog.tsx` (modal completo)

✅ **Funcionalidades implementadas:**
- Botão "Limpar Filtros" funcional
- Dropdown simplificado com "Gerenciar Estoque"  
- Modal completo para registrar movimentações
- Integração total com banco existente

---

## 🚀 RESULTADO FINAL

Após implementação:
1. **Usuário pode limpar** filtros facilmente com um clique
2. **Interface mais limpa** no dropdown das joias
3. **Modal intuitivo** para gerenciar estoque
4. **Registros precisos** na tabela `inventory_movements`
5. **Sistema mantém** toda funcionalidade existente
