"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, Package, DollarSign, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUserProfile } from "@/hooks/use-user-profile"
import type { ShowcaseWithDetails } from "@/lib/showcase-api"

interface ViewMostruarioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mostruario: ShowcaseWithDetails
}

export function ViewMostruarioDialog({ open, onOpenChange, mostruario }: ViewMostruarioDialogProps) {
  const { profileData } = useUserProfile()
  
  const formatCurrency = (value: number | undefined) => {
    if (!value || isNaN(value)) return 'G₲ 0'
    return `G₲ ${value.toLocaleString()}`
  }

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

  const handleExportPDF = () => {
    console.log("Exportando PDF do mostruário:", mostruario.code)
    alert(`PDF do mostruário ${mostruario.code} seria gerado aqui`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="font-heading flex items-center gap-2">
                {mostruario.code}
              </DialogTitle>
              <DialogDescription className="font-body">Detalhes completos do mostruário</DialogDescription>
            </div>
            <Button onClick={handleExportPDF} variant="outline" className="gap-2 font-body bg-transparent">
              <FileText className="w-4 h-4" />
              Exportar PDF
            </Button>
          </div>
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
                <p className="font-body text-foreground">{profileData?.name || mostruario.distributor_profile?.name || 'N/A'}</p>
                <p className="text-sm text-muted-foreground font-body">ID: {mostruario.profile_id || 'N/A'}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-heading text-foreground">{mostruario.total_pieces || 0}</p>
                <p className="text-sm text-muted-foreground font-body">Total de Piezas</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-heading text-foreground">{mostruario.movements?.length || 0}</p>
                <p className="text-sm text-muted-foreground font-body">Productos Diferentes</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-heading text-foreground">{formatCurrency(mostruario.total_value)}</p>
                <p className="text-sm text-muted-foreground font-body">Valor Total</p>
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
                {mostruario.movements?.map((movement, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-muted rounded-lg border border-border"
                  >
                    <div className="flex-1">
                      <h4 className="font-heading text-foreground">{movement.jewelry?.name || 'N/A'}</h4>
                      <p className="text-sm text-muted-foreground font-body">Código: {movement.jewelry?.code || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground font-body">
                        Precio unitario: {formatCurrency(movement.jewelry?.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-heading text-foreground">{movement.quantity || 0}x</p>
                      <p className="text-sm font-heading text-foreground">
                        {formatCurrency((movement.quantity || 0) * (movement.jewelry?.price || 0))}
                      </p>
                    </div>
                  </div>
                )) || []}
              </div>

              {/* Total */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-heading text-foreground">Total General:</p>
                  <p className="text-xl font-heading text-primary">{formatCurrency(mostruario.total_value)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
