"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Minus, X, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/currency"

// Mock data for available products
const mockProdutos = [
  {
    id: "1",
    codigo: "AN001",
    nome: "Anel de Ouro 18k",
    categoria: "Anéis",
    precoCusto: 350.0,
    precoVenda: 450.0,
    estoque: 5,
  },
  {
    id: "2",
    codigo: "BR001",
    nome: "Brincos de Prata",
    categoria: "Brincos",
    precoCusto: 80.0,
    precoVenda: 120.0,
    estoque: 8,
  },
  {
    id: "3",
    codigo: "CO001",
    nome: "Colar de Pérolas",
    categoria: "Colares",
    precoCusto: 500.0,
    precoVenda: 650.0,
    estoque: 3,
  },
  {
    id: "4",
    codigo: "PU001",
    nome: "Pulseira de Ouro",
    categoria: "Pulseiras",
    precoCusto: 200.0,
    precoVenda: 280.0,
    estoque: 6,
  },
  {
    id: "5",
    codigo: "AN002",
    nome: "Anel de Diamante",
    categoria: "Anéis",
    precoCusto: 1800.0,
    precoVenda: 2100.0,
    estoque: 1,
  },
]

interface Produto {
  id: string
  nome: string
  quantidade: number
  precoUnitario: number
}

interface Venda {
  id: string
  data: string
  valor: number
  quantidadeProdutos: number
  quantidadeJoias: number
  observacoes: string
  produtos: Produto[]
}

interface EditVendaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  venda: Venda
}

export function EditVendaDialog({ open, onOpenChange, venda }: EditVendaDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [produtosSelecionados, setProdutosSelecionados] = useState<Produto[]>([])
  const [observacoes, setObservacoes] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (open && venda) {
      setProdutosSelecionados([...venda.produtos])
      setObservacoes(venda.observacoes)
    }
  }, [open, venda])



  const filteredProdutos = mockProdutos.filter(
    (produto) =>
      (produto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.categoria.toLowerCase().includes(searchTerm.toLowerCase())) &&
      !produtosSelecionados.some((selected) => selected.id === produto.id),
  )

  const adicionarProduto = (produto: any) => {
    setProdutosSelecionados([
      ...produtosSelecionados,
      {
        id: produto.id,
        nome: produto.nome,
        quantidade: 1,
        precoUnitario: produto.precoVenda,
      },
    ])
    setSearchTerm("")
  }

  const removerProduto = (id: string) => {
    setProdutosSelecionados(produtosSelecionados.filter((produto) => produto.id !== id))
  }

  const atualizarQuantidade = (id: string, quantidade: number) => {
    if (quantidade < 1) return
    setProdutosSelecionados(
      produtosSelecionados.map((produto) => (produto.id === id ? { ...produto, quantidade } : produto)),
    )
  }

  const atualizarPreco = (id: string, preco: number) => {
    if (preco < 0) return
    setProdutosSelecionados(
      produtosSelecionados.map((produto) => (produto.id === id ? { ...produto, precoUnitario: preco } : produto)),
    )
  }

  const calcularTotal = () => {
    return produtosSelecionados.reduce((total, produto) => total + produto.quantidade * produto.precoUnitario, 0)
  }

  const calcularQuantidadeTotal = () => {
    return produtosSelecionados.reduce((total, produto) => total + produto.quantidade, 0)
  }

  const handleSubmit = () => {
    if (produtosSelecionados.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um produto para a venda.",
        variant: "destructive",
      })
      return
    }

    // Here you would typically send the data to your API
    console.log("Venda editada:", {
      id: venda.id,
      produtos: produtosSelecionados,
      observacoes,
      valorTotal: calcularTotal(),
      quantidadeTotal: calcularQuantidadeTotal(),
    })

    toast({
      title: "Sucesso",
      description: "Venda atualizada com sucesso!",
    })

    onOpenChange(false)
  }

  const handleClose = () => {
    setProdutosSelecionados([...venda.produtos])
    setObservacoes(venda.observacoes)
    setSearchTerm("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Editar Venda #{venda.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Search */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="search" className="font-body">
                Adicionar Produtos
              </Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Buscar por código, nome ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 font-body"
                />
              </div>
            </div>

            {/* Search Results */}
            {searchTerm && filteredProdutos.length > 0 && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-heading">Produtos Disponíveis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filteredProdutos.map((produto) => (
                      <div
                        key={produto.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                        onClick={() => adicionarProduto(produto)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs font-body">
                              {produto.codigo}
                            </Badge>
                            <span className="text-sm font-body text-foreground">{produto.nome}</span>
                          </div>
                          <p className="text-xs text-muted-foreground font-body">
                            {produto.categoria} • Estoque: {produto.estoque}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-heading text-foreground">{formatCurrency(produto.precoVenda)}</p>
                          <Button size="sm" variant="outline" className="mt-1 bg-transparent">
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Selected Products */}
          {produtosSelecionados.length > 0 && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading">Produtos da Venda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {produtosSelecionados.map((produto) => (
                    <div key={produto.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-body text-foreground">{produto.nome}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => atualizarQuantidade(produto.id, produto.quantidade - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-body">{produto.quantidade}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => atualizarQuantidade(produto.id, produto.quantidade + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          step="0.01"
                          value={produto.precoUnitario}
                          onChange={(e) => atualizarPreco(produto.id, Number.parseFloat(e.target.value) || 0)}
                          className="text-right font-body"
                        />
                      </div>
                      <div className="w-24 text-right">
                        <p className="font-heading text-foreground">
                          {formatCurrency(produto.quantidade * produto.precoUnitario)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removerProduto(produto.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          {produtosSelecionados.length > 0 && (
            <Card className="border-border bg-muted/50">
              <CardHeader>
                <CardTitle className="font-heading">Resumo da Venda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground font-body">Produtos</p>
                    <p className="text-lg font-heading text-foreground">{produtosSelecionados.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground font-body">Quantidade</p>
                    <p className="text-lg font-heading text-foreground">{calcularQuantidadeTotal()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground font-body">Total</p>
                    <p className="text-lg font-heading text-foreground">{formatCurrency(calcularTotal())}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground font-body">Média</p>
                    <p className="text-lg font-heading text-foreground">
                      {formatCurrency(calcularTotal() / calcularQuantidadeTotal())}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observations */}
          <div className="space-y-2">
            <Label htmlFor="observacoes" className="font-body">
              Observações
            </Label>
            <Textarea
              id="observacoes"
              placeholder="Observações sobre a venda (opcional)..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="font-body"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose} className="font-body bg-transparent">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={produtosSelecionados.length === 0} className="font-body">
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
