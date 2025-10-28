"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { MoreVertical, FileText, Eye, Calendar, Package, User, DollarSign, CheckCircle, TrendingUp, Edit } from "lucide-react"
import { ViewMostruarioDialog } from "./view-mostruario-dialog"
import { FinishShowcaseDialog } from "./finish-showcase-dialog"
import { RegisterShowcaseSaleDialog } from "./register-showcase-sale-dialog"
import { EditShowcaseSaleDialog } from "./edit-showcase-sale-dialog"
import { fetchShowcaseDataForPDF } from "@/lib/pdf/fetch-showcase-pdf-data"
import { generateShowcasePDF } from "@/lib/pdf/showcase-pdf-generator"
import { toast } from "sonner"
import type { ShowcaseWithDetails } from "@/lib/showcase-api"

interface MostruarioCardProps {
  mostruario: ShowcaseWithDetails
  onShowcaseFinished?: () => void
}

export function MostruarioCard({ mostruario, onShowcaseFinished }: MostruarioCardProps) {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false)
  const [isRegisterSaleDialogOpen, setIsRegisterSaleDialogOpen] = useState(false)
  const [isEditSaleDialogOpen, setIsEditSaleDialogOpen] = useState(false)

  const formatCurrency = (value: number) => {
    return `₲${value.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PY")
  }

  const getStatusColor = (status: 'entregue' | 'finalizado') => {
    return status === 'entregue' 
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : "bg-green-100 text-green-800 border-green-200"
  }

  const getStatusText = (status: 'entregue' | 'finalizado') => {
    return status === 'entregue' ? 'Entregue' : 'Finalizado'
  }

  // Filtrar apenas movimentos de saída (envios) - quantidade negativa
  const outgoingMovements = (mostruario.movements || []).filter(m => m.quantity < 0)
  
  // Calcular total de peças devolvidas
  const totalReturnedPieces = mostruario.status === 'finalizado' 
    ? (mostruario.showcase_returns || []).reduce((sum, ret) => sum + (ret.returned_quantity || 0), 0)
    : 0

  const handleExportPDF = async () => {
    try {
      // Mostrar loading
      toast.loading('Gerando PDF...', { id: 'pdf-generation' })
      
      // Buscar dados
      const data = await fetchShowcaseDataForPDF(mostruario.id)
      
      // Gerar PDF
      await generateShowcasePDF(data)
      
      // Remover loading e mostrar sucesso
      toast.success(`PDF do mostruário ${mostruario.code} gerado com sucesso!`, { id: 'pdf-generation' })
    } catch (error) {
      console.error('Erro ao exportar PDF:', error)
      toast.error('Erro ao gerar PDF. Tente novamente.', { id: 'pdf-generation' })
    }
  }

  return (
    <>
      <Card className="border-border hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-heading text-foreground text-lg">{mostruario.code}</h3>
                <Badge className={`text-xs font-body ${getStatusColor(mostruario.status)}`}>
                  {getStatusText(mostruario.status)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-body mb-2">
                <User className="w-3 h-3" />
                {mostruario.distributor_profile?.name || 'Distribuidor N/A'}
              </div>
              
              {/* Cards de datas - responsivos */}
              <div className={`grid gap-2 mt-3 ${mostruario.status === 'finalizado' && mostruario.finished_at ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                <div className="bg-muted/50 rounded-lg p-2 border border-border">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wide">Fecha de Envío</p>
                      <p className="text-xs font-heading text-foreground truncate">{formatDate(mostruario.created_at)}</p>
                    </div>
                  </div>
                </div>
                
                {mostruario.status === 'finalizado' && mostruario.finished_at && (
                  <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-green-700 font-body uppercase tracking-wide">Finalizado</p>
                        <p className="text-xs font-heading text-green-800 truncate">{formatDate(mostruario.finished_at)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setIsViewDialogOpen(true)} className="font-body">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalles
                </DropdownMenuItem>
                {mostruario.status === 'entregue' && (
                  <DropdownMenuItem onClick={() => setIsFinishDialogOpen(true)} className="font-body">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Finalizar Mostruário
                  </DropdownMenuItem>
                )}
                {mostruario.status === 'finalizado' && !mostruario.has_sale && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsRegisterSaleDialogOpen(true)} className="font-body text-green-600">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Registrar Venta
                    </DropdownMenuItem>
                  </>
                )}
                {mostruario.status === 'finalizado' && mostruario.has_sale && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled className="font-body text-muted-foreground">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Venta Registrada
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsEditSaleDialogOpen(true)} className="font-body text-blue-600">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar Venta
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportPDF} className="font-body">
                  <FileText className="mr-2 h-4 w-4" />
                  Exportar PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Stats Grid */}
            {mostruario.status === 'entregue' ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="text-center p-2.5 sm:p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Package className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] sm:text-xs text-muted-foreground font-body">Piezas</span>
                  </div>
                  <p className="text-base sm:text-lg font-heading text-foreground">{mostruario.total_pieces || 0}</p>
                </div>
                <div className="text-center p-2.5 sm:p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Package className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] sm:text-xs text-muted-foreground font-body">Productos</span>
                  </div>
                  <p className="text-base sm:text-lg font-heading text-foreground">{outgoingMovements.length || 0}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="text-center p-2.5 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Package className="w-3 h-3 text-blue-600" />
                    <span className="text-[10px] sm:text-xs text-blue-600 font-body">Enviado</span>
                  </div>
                  <p className="text-base sm:text-lg font-heading text-blue-700">{mostruario.total_pieces || 0}</p>
                </div>
                <div className="text-center p-2.5 sm:p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Package className="w-3 h-3 text-green-600" />
                    <span className="text-[10px] sm:text-xs text-green-600 font-body">Devuelto</span>
                  </div>
                  <p className="text-base sm:text-lg font-heading text-green-700">{totalReturnedPieces}</p>
                </div>
              </div>
            )}

            {/* Total Value */}
            <div className="text-center p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs sm:text-sm text-primary font-body">Valor Total</span>
              </div>
              <p className="text-lg sm:text-xl font-heading text-primary">{formatCurrency(mostruario.total_value || 0)}</p>
            </div>

            {/* Products Preview */}
            <div className="space-y-2">
              <h4 className="text-sm font-heading text-foreground">Productos:</h4>
              <div className="space-y-1">
                {mostruario.status === 'entregue' ? (
                  <>
                    {outgoingMovements.slice(0, 2).map((movement, index) => (
                      <div key={index} className="flex justify-between items-center text-xs font-body">
                        <span className="text-muted-foreground truncate">{movement.jewelry?.name || 'Producto'}</span>
                        <span className="text-foreground">{Math.abs(movement.quantity)}x</span>
                      </div>
                    ))}
                    {outgoingMovements.length > 2 && (
                      <p className="text-xs text-muted-foreground font-body">
                        +{outgoingMovements.length - 2} productos...
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    {outgoingMovements.slice(0, 2).map((movement, index) => {
                      const productId = movement.jewelry?.id ? Number(movement.jewelry.id) : null
                      const productReturn = productId 
                        ? (mostruario.showcase_returns || []).find(ret => ret.product_id === productId)
                        : null
                      const sentQty = Math.abs(movement.quantity)
                      const returnedQty = productReturn?.returned_quantity || 0
                      const soldQty = sentQty - returnedQty
                      
                      return (
                        <div key={index} className="space-y-1 pb-2 border-b border-border last:border-0 last:pb-0">
                          <div className="flex justify-between items-center text-xs font-body">
                            <span className="text-muted-foreground truncate">{movement.jewelry?.name || 'Producto'}</span>
                          </div>
                          <div className="flex gap-3 text-xs font-medium">
                            <div className="flex items-center gap-1">
                              <span className="text-blue-600">↗</span>
                              <span className="text-blue-700">{sentQty}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-green-600">↙</span>
                              <span className="text-green-700">{returnedQty}</span>
                            </div>
                            {soldQty > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-amber-600">✓</span>
                                <span className="text-amber-700">{soldQty}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {outgoingMovements.length > 2 && (
                      <p className="text-xs text-muted-foreground font-body pt-2">
                        +{outgoingMovements.length - 2} productos más...
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ViewMostruarioDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} mostruario={mostruario} />
      <FinishShowcaseDialog 
        open={isFinishDialogOpen} 
        onOpenChange={setIsFinishDialogOpen} 
        mostruario={mostruario}
        onFinished={onShowcaseFinished}
        onOpenSaleDialog={() => setIsRegisterSaleDialogOpen(true)}
      />
      <RegisterShowcaseSaleDialog
        open={isRegisterSaleDialogOpen}
        onOpenChange={setIsRegisterSaleDialogOpen}
        mostruario={mostruario}
        onSaleRegistered={onShowcaseFinished}
      />
      <EditShowcaseSaleDialog
        open={isEditSaleDialogOpen}
        onOpenChange={setIsEditSaleDialogOpen}
        mostruario={mostruario}
        onSaleUpdated={onShowcaseFinished}
      />
    </>
  )
}
