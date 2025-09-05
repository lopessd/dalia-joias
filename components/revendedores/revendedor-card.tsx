"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, Mail, Phone, MapPin, Package, TrendingUp, Calendar, Settings } from "lucide-react"
import { EditDistributorDialog } from "./edit-distributor-dialog"
import { DeleteDistributorDialog } from "./delete-distributor-dialog"
import { ManageDistributorDialog } from "./manage-distributor-dialog"
import { PermanentDeleteDistributorDialog } from "./permanent-delete-distributor-dialog"
import { DeactivateDistributorDialog } from "./deactivate-distributor-dialog"
import type { ResellerProfile } from "@/lib/supabase"

interface RevendedorCardProps {
  revendedor: ResellerProfile
  onUpdate?: () => void
}

export function RevendedorCard({ revendedor, onUpdate }: RevendedorCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false)
  const [isPermanentDeleteDialogOpen, setIsPermanentDeleteDialogOpen] = useState(false)
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PY")
  }

  const getStatusColor = (active: boolean) => {
    if (active) {
      return "bg-green-100 text-green-800 border-green-200"
    } else {
      return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (active: boolean) => {
    return active ? "Activo" : "Inactivo"
  }

  const getDisplayName = (name?: string, email?: string) => {
    // Se tiver nome, usar o nome. Senão, extrair do email
    if (name && name.trim()) {
      return name.trim()
    }
    if (email) {
      return email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
    return 'Nome não disponível'
  }

  const handleStatusClick = (isActive: boolean) => {
    if (isActive) {
      // Status ATIVO clicado -> Abrir modal de desativação
      setIsDeactivateDialogOpen(true)
    } else {
      // Status INATIVO clicado -> Abrir modal de gerenciar acesso
      setIsManageDialogOpen(true)
    }
  }

  return (
    <>
      <Card className="border-border hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-heading text-foreground text-lg">{getDisplayName(revendedor.name, revendedor.email)}</h3>
                <Badge 
                  className={`cursor-pointer hover:opacity-80 transition-opacity text-xs font-body ${getStatusColor(revendedor.active)}`}
                  onClick={() => handleStatusClick(revendedor.active)}
                >
                  {getStatusText(revendedor.active)}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                  <Mail className="w-3 h-3" />
                  {revendedor.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                  <Phone className="w-3 h-3" />
                  {revendedor.phone || "No disponible"}
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
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="w-3 h-3 mr-2" />
                  Editar Distribuidor
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsManageDialogOpen(true)}>
                  <Settings className="w-3 h-3 mr-2" />
                  Gerenciar Acesso
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsPermanentDeleteDialogOpen(true)}
                  className="font-body text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Distribuidor
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Address */}
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm font-body text-muted-foreground line-clamp-2">
                {revendedor.address || "Dirección no disponible"}
              </p>
            </div>

            {/* Description */}
            <p className="text-sm font-body text-muted-foreground line-clamp-2">
              {revendedor.description || "Sin descripción"}
            </p>

            {/* Stats - Temporariamente mostrando dados básicos */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Package className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-body">Status</span>
                </div>
                <p className="text-sm font-heading text-foreground">
                  {revendedor.active ? "Activo" : "Inactivo"}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-body">Registro</span>
                </div>
                <p className="text-sm font-heading text-foreground">
                  {formatDate(revendedor.profile_created_at)}
                </p>
              </div>
            </div>

            {/* User Creation Date */}
            <div className="grid grid-cols-1 gap-2 pt-2">
              <div className="text-center">
                <p className="text-xs text-muted-foreground font-body">Usuario creado</p>
                <p className="text-xs font-body text-muted-foreground">{formatDate(revendedor.user_created_at)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diálogos */}
    <EditDistributorDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        distributor={{
          id: revendedor.id,
      name: getDisplayName(revendedor.name, revendedor.email),
      displayName: getDisplayName(revendedor.name, revendedor.email),
          email: revendedor.email,
          phone: revendedor.phone || undefined,
          address: revendedor.address || undefined,
          description: revendedor.description || undefined,
        }}
        onDistributorUpdated={onUpdate}
      />
      
    <DeleteDistributorDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        distributor={{
          id: revendedor.id,
      name: getDisplayName(revendedor.name, revendedor.email),
      displayName: getDisplayName(revendedor.name, revendedor.email),
          email: revendedor.email,
          active: revendedor.active,
        }}
        onDistributorUpdated={onUpdate}
      />
      
    <ManageDistributorDialog 
        open={isManageDialogOpen} 
        onOpenChange={setIsManageDialogOpen} 
        distributor={{
          id: revendedor.id,
      name: getDisplayName(revendedor.name, revendedor.email),
      displayName: getDisplayName(revendedor.name, revendedor.email),
          email: revendedor.email,
          active: revendedor.active,
        }}
        onDistributorUpdated={onUpdate}
      />
      
    <PermanentDeleteDistributorDialog 
        open={isPermanentDeleteDialogOpen} 
        onOpenChange={setIsPermanentDeleteDialogOpen} 
        distributor={{
          id: revendedor.id,
      name: getDisplayName(revendedor.name, revendedor.email),
      displayName: getDisplayName(revendedor.name, revendedor.email),
          email: revendedor.email,
        }}
        onDistributorDeleted={onUpdate}
      />
      
    <DeactivateDistributorDialog 
        open={isDeactivateDialogOpen} 
        onOpenChange={setIsDeactivateDialogOpen} 
        distributor={{
          id: revendedor.id,
      name: getDisplayName(revendedor.name, revendedor.email),
      displayName: getDisplayName(revendedor.name, revendedor.email),
          email: revendedor.email,
        }}
        onDistributorUpdated={onUpdate}
      />
    </>
  )
}
