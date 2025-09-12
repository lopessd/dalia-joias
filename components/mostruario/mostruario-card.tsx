"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, FileText, Eye, Calendar, Package, User, DollarSign } from "lucide-react"
import { ViewMostruarioDialog } from "./view-mostruario-dialog"
import type { ShowcaseWithDetails } from "@/lib/showcase-api"

interface MostruarioCardProps {
  mostruario: ShowcaseWithDetails
}

export function MostruarioCard({ mostruario }: MostruarioCardProps) {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const formatCurrency = (value: number) => {
    return `₲${value.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PY")
  }



  const handleExportPDF = () => {
    // In a real app, this would generate and download a PDF
    console.log("Exportando PDF del muestrario:", mostruario.code)
    alert(`PDF del muestrario ${mostruario.code} sería generado aquí`)
  }

  return (
    <>
      <Card className="border-border hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-heading text-foreground text-lg">{mostruario.code}</h3>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                  <User className="w-3 h-3" />
                  {mostruario.distributor_profile?.name || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                  <Calendar className="w-3 h-3" />
                  {formatDate(mostruario.created_at)}
                </div>
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
                <DropdownMenuItem onClick={handleExportPDF} className="font-body">
                  <FileText className="mr-2 h-4 w-4" />
                  Exportar PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Package className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-body">Piezas</span>
                </div>
                <p className="text-lg font-heading text-foreground">{mostruario.total_pieces || 0}</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Package className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-body">Productos</span>
                </div>
                <p className="text-lg font-heading text-foreground">{mostruario.movements?.length || 0}</p>
              </div>
            </div>

            {/* Total Value */}
            <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-body">Valor Total</span>
              </div>
              <p className="text-xl font-heading text-primary">{formatCurrency(mostruario.total_value || 0)}</p>
            </div>

            {/* Products Preview */}
            <div className="space-y-2">
              <h4 className="text-sm font-heading text-foreground">Productos:</h4>
              <div className="space-y-1">
                {(mostruario.movements || []).slice(0, 2).map((movement, index) => (
                  <div key={index} className="flex justify-between items-center text-xs font-body">
                    <span className="text-muted-foreground truncate">{movement.jewelry?.name || 'Producto'}</span>
                    <span className="text-foreground">{Math.abs(movement.quantity)}x</span>
                  </div>
                ))}
                {(mostruario.movements || []).length > 2 && (
                  <p className="text-xs text-muted-foreground font-body">
                    +{(mostruario.movements || []).length - 2} productos...
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ViewMostruarioDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} mostruario={mostruario} />
    </>
  )
}
