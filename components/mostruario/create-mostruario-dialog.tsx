"use client"

import { useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Minus, User, Package, DollarSign, ArrowRight, ArrowLeft } from "lucide-react"

interface CreateMostruarioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Revendedor {
  id: string
  nome: string
  email: string
}

interface Joia {
  id: string
  codigo: string
  nome: string
  categoria: string
  precoVenda: number
  quantidade: number
}

interface ProdutoSelecionado {
  joia: Joia
  quantidade: number
}

const mockRevendedores: Revendedor[] = [
  { id: "R001", nome: "Maria Silva", email: "maria.silva@email.com" },
  { id: "R002", nome: "Ana Costa", email: "ana.costa@email.com" },
  { id: "R003", nome: "Carla Mendes", email: "carla.mendes@email.com" },
  { id: "R004", nome: "Lucia Santos", email: "lucia.santos@email.com" },
]

const mockJoias: Joia[] = [
  {
    id: "J001",
    codigo: "AN001",
    nome: "Anel de Ouro 18k",
    categoria: "Anéis",
    precoVenda: 680.0,
    quantidade: 15,
  },
  {
    id: "J002",
    codigo: "BR002",
    nome: "Brincos de Prata",
    categoria: "Brincos",
    precoVenda: 180.0,
    quantidade: 8,
  },
  {
    id: "J003",
    codigo: "CO003",
    nome: "Colar de Pérolas",
    categoria: "Colares",
    precoVenda: 420.0,
    quantidade: 3,
  },
  {
    id: "J004",
    codigo: "PU004",
    nome: "Pulseira de Ouro",
    categoria: "Pulseiras",
    precoVenda: 520.0,
    quantidade: 6,
  },
]

export function CreateMostruarioDialog({ open, onOpenChange }: CreateMostruarioDialogProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedRevendedor, setSelectedRevendedor] = useState<Revendedor | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [produtosSelecionados, setProdutosSelecionados] = useState<ProdutoSelecionado[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const filteredJoias = mockJoias.filter(
    (joia) =>
      joia.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      joia.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      joia.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleSelectRevendedor = (revendedorId: string) => {
    const revendedor = mockRevendedores.find((r) => r.id === revendedorId)
    setSelectedRevendedor(revendedor || null)
  }

  const handleSelectJoia = (joia: Joia) => {
    const existingIndex = produtosSelecionados.findIndex((p) => p.joia.id === joia.id)
    if (existingIndex >= 0) {
      // If already selected, increase quantity
      const newProdutos = [...produtosSelecionados]
      if (newProdutos[existingIndex].quantidade < joia.quantidade) {
        newProdutos[existingIndex].quantidade += 1
        setProdutosSelecionados(newProdutos)
      }
    } else {
      // Add new product
      setProdutosSelecionados([...produtosSelecionados, { joia, quantidade: 1 }])
    }
  }

  const handleQuantityChange = (joiaId: string, delta: number) => {
    setProdutosSelecionados(
      (prev) =>
        prev
          .map((produto) => {
            if (produto.joia.id === joiaId) {
              const newQuantity = produto.quantidade + delta
              if (newQuantity <= 0) return null
              if (newQuantity > produto.joia.quantidade) return produto
              return { ...produto, quantidade: newQuantity }
            }
            return produto
          })
          .filter(Boolean) as ProdutoSelecionado[],
    )
  }

  const getTotalPecas = () => {
    return produtosSelecionados.reduce((sum, produto) => sum + produto.quantidade, 0)
  }

  const getTotalValor = () => {
    return produtosSelecionados.reduce((sum, produto) => sum + produto.quantidade * produto.joia.precoVenda, 0)
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    // Generate automatic code
    const codigo = `MST-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`

    const mostruarioData = {
      codigo,
      revendedorId: selectedRevendedor?.id,
      revendedorNome: selectedRevendedor?.nome,
      produtos: produtosSelecionados.map((p) => ({
        joiaId: p.joia.id,
        joiaNome: p.joia.nome,
        quantidade: p.quantidade,
        precoVenda: p.joia.precoVenda,
      })),
      quantidadePecas: getTotalPecas(),
      quantidadeProdutos: produtosSelecionados.length,
      valorTotal: getTotalValor(),
    }

    // Simulate API call
    setTimeout(() => {
      console.log("Mostruário criado:", mostruarioData)
      setIsLoading(false)
      onOpenChange(false)
      // Reset form
      setCurrentStep(1)
      setSelectedRevendedor(null)
      setSearchTerm("")
      setProdutosSelecionados([])
    }, 1000)
  }

  const handleClose = () => {
    onOpenChange(false)
    setCurrentStep(1)
    setSelectedRevendedor(null)
    setSearchTerm("")
    setProdutosSelecionados([])
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-heading text-foreground mb-4">Escolha o Revendedor</h3>
        <div className="space-y-2">
          <Label className="font-body">Revendedor *</Label>
          <Select onValueChange={handleSelectRevendedor}>
            <SelectTrigger className="font-body">
              <SelectValue placeholder="Selecione um revendedor" />
            </SelectTrigger>
            <SelectContent>
              {mockRevendedores.map((revendedor) => (
                <SelectItem key={revendedor.id} value={revendedor.id}>
                  {revendedor.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedRevendedor && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-heading text-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Revendedor Selecionado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-body text-foreground">{selectedRevendedor.nome}</p>
              <p className="text-sm text-muted-foreground font-body">{selectedRevendedor.email}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-heading text-foreground mb-4">Escolha os Produtos</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search" className="font-body">
              Buscar Produtos
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search"
                placeholder="Código, nome ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-body"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredJoias.map((joia) => (
              <Card
                key={joia.id}
                className="border-border cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSelectJoia(joia)}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-heading text-sm text-foreground">{joia.nome}</h4>
                        <Badge variant="outline" className="text-xs font-body">
                          {joia.categoria}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-body">Código: {joia.codigo}</p>
                      <p className="text-xs text-muted-foreground font-body">Estoque: {joia.quantidade}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-heading text-foreground">{formatCurrency(joia.precoVenda)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-heading text-foreground mb-4">Lista de Produtos Selecionados</h3>
        {produtosSelecionados.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground font-body">Nenhum produto selecionado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {produtosSelecionados.map((produto) => (
              <Card key={produto.joia.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-heading text-sm text-foreground">{produto.joia.nome}</h4>
                      <p className="text-xs text-muted-foreground font-body">Código: {produto.joia.codigo}</p>
                      <p className="text-xs text-muted-foreground font-body">
                        {formatCurrency(produto.joia.precoVenda)} cada
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(produto.joia.id, -1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-heading text-foreground w-8 text-center">{produto.quantidade}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(produto.joia.id, 1)}
                        disabled={produto.quantidade >= produto.joia.quantidade}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-heading text-foreground mb-4">Resumo Final</h3>

        {/* Revendedor Info */}
        <Card className="border-border mb-4">
          <CardHeader>
            <CardTitle className="font-heading text-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Revendedor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-body text-foreground">{selectedRevendedor?.nome}</p>
            <p className="text-sm text-muted-foreground font-body">{selectedRevendedor?.email}</p>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card className="border-border">
            <CardContent className="p-4 text-center">
              <Package className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-lg font-heading text-foreground">{getTotalPecas()}</p>
              <p className="text-xs text-muted-foreground font-body">Total de Peças</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 text-center">
              <Package className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-lg font-heading text-foreground">{produtosSelecionados.length}</p>
              <p className="text-xs text-muted-foreground font-body">Produtos</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-lg font-heading text-foreground">{formatCurrency(getTotalValor())}</p>
              <p className="text-xs text-muted-foreground font-body">Valor Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Products List */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-heading text-foreground">Produtos do Mostruário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {produtosSelecionados.map((produto) => (
                <div key={produto.joia.id} className="flex justify-between items-center py-2 border-b border-border">
                  <div className="flex-1">
                    <p className="font-body text-foreground">{produto.joia.nome}</p>
                    <p className="text-xs text-muted-foreground font-body">Código: {produto.joia.codigo}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-foreground">{produto.quantidade}x</p>
                    <p className="text-xs text-muted-foreground font-body">
                      {formatCurrency(produto.quantidade * produto.joia.precoVenda)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Criar Novo Mostruário</DialogTitle>
          <DialogDescription className="font-body">
            Passo {currentStep} de 4: {currentStep === 1 && "Escolha o revendedor"}
            {currentStep === 2 && "Selecione os produtos"}
            {currentStep === 3 && "Ajuste as quantidades"}
            {currentStep === 4 && "Confirme os dados"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} className="gap-2 font-body">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="font-body bg-transparent">
                Cancelar
              </Button>
              {currentStep < 4 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={
                    (currentStep === 1 && !selectedRevendedor) ||
                    (currentStep === 3 && produtosSelecionados.length === 0)
                  }
                  className="gap-2 font-body"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading} className="font-body">
                  {isLoading ? "Criando..." : "Confirmar Mostruário"}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
