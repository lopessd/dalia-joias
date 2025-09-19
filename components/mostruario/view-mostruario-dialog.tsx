"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, Package, DollarSign } from "lucide-react"
import { useUserProfile } from "@/hooks/use-user-profile"
import type { ShowcaseWithDetails } from "@/lib/showcase-api"
import { formatCurrency } from "@/lib/currency"

interface ViewMostruarioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mostruario: ShowcaseWithDetails
}

export function ViewMostruarioDialog({ open, onOpenChange, mostruario }: ViewMostruarioDialogProps) {
  const { profileData } = useUserProfile()
  


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PY")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "cancelado":
        return "Cancelado"
      default:
        return "Ativo"
    }
  }



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            {mostruario.code}
          </DialogTitle>
          <DialogDescription className="font-body">Detalles completos de la vitrina</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading text-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Distribuidor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-body text-foreground">{mostruario.distributor_profile?.name || `Distribuidor ${mostruario.profile_id?.slice(0, 8)}`}</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fecha de Envío
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-body text-foreground">{formatDate(mostruario.created_at)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-border">
              <CardContent className="px-3 py-4 text-center">
                <Package className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-xl font-heading text-foreground">
                  {mostruario.inventory_movements?.reduce((sum, mov) => sum + Math.abs(mov.quantity), 0) || 0}
                </p>
                <p className="text-xs text-muted-foreground font-body">Total de Piezas</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="px-3 py-4 text-center">
                <Package className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-xl font-heading text-foreground">{mostruario.inventory_movements?.length || 0}</p>
                <p className="text-xs text-muted-foreground font-body">Productos Diferentes</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="px-3 py-4 text-center">
                <DollarSign className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-lg font-heading text-foreground leading-tight">
                  {formatCurrency(
                    mostruario.inventory_movements?.reduce((sum, mov) => 
                      sum + (Math.abs(mov.quantity) * (mov.jewelry?.selling_price || mov.jewelry?.cost_price || 0)), 0
                    ) || 0
                  )}
                </p>
                <p className="text-xs text-muted-foreground font-body">Valor Total</p>
              </CardContent>
            </Card>
          </div>

          {/* Products List */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-heading text-foreground">Lista Detallada de Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mostruario.inventory_movements?.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground font-body">No hay productos en esta vitrina</p>
                  </div>
                ) : (
                  mostruario.inventory_movements?.map((movement, index) => (
                    <div
                      key={movement.id || index}
                      className="flex justify-between items-center p-3 bg-muted rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <h4 className="font-heading text-foreground">{movement.jewelry?.name || 'Producto sin nombre'}</h4>
                        <p className="text-sm text-muted-foreground font-body">Código: {movement.jewelry?.code || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground font-body">
                          Precio unitario: {formatCurrency(movement.jewelry?.selling_price || movement.jewelry?.cost_price || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-heading text-foreground">-{Math.abs(movement.quantity || 0)}x</p>
                        <p className="text-sm font-heading text-foreground">
                          {formatCurrency(Math.abs(movement.quantity || 0) * (movement.jewelry?.selling_price || movement.jewelry?.cost_price || 0))}
                        </p>
                      </div>
                    </div>
                  )) || []
                )}
              </div>

              {/* Total */}
              {mostruario.inventory_movements && mostruario.inventory_movements.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-heading text-foreground">Total General:</p>
                    <p className="text-xl font-heading text-primary">
                      {formatCurrency(
                        mostruario.inventory_movements.reduce((sum, mov) => 
                          sum + (Math.abs(mov.quantity) * (mov.jewelry?.selling_price || mov.jewelry?.cost_price || 0)), 0
                        )
                      )}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
