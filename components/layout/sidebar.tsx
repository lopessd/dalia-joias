"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Gem, LayoutDashboard, Users, Send, ShoppingCart, History, User, LogOut, Menu, X } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"
import { LogoutConfirmDialog } from "@/components/auth/logout-confirm-dialog"

interface SidebarProps {
  userType: "admin" | "revendedor"
}

export function Sidebar({ userType }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const adminNavItems = [
    { href: "/admin/dashboard", label: "Panel de Control", icon: LayoutDashboard },
    { href: "/admin/joias", label: "Joyas", icon: Gem },
    { href: "/admin/revendedores", label: "Distribuidores", icon: Users },
    { href: "/admin/mostruario", label: "Muestrario", icon: Send },
  ]

  const revendedorNavItems = [
    { href: "/revendedor/dashboard", label: "Panel de Control", icon: LayoutDashboard },
    { href: "/revendedor/vendas", label: "Ventas", icon: ShoppingCart },
    { href: "/revendedor/joias", label: "Joyas", icon: Gem },
    { href: "/revendedor/historico", label: "Historial", icon: History },
  ]

  const navItems = userType === "admin" ? adminNavItems : revendedorNavItems

  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
  }

  const handleLogoutConfirm = async () => {
    try {
      await logout()
      setShowLogoutDialog(false)
      router.push("/")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      // Force redirect even if logout fails
      router.push("/")
    }
  }

  return (
    <>
      {/* Mobile hamburger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-background/80 backdrop-blur-sm border border-border hover:bg-background md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar with responsive width */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out md:translate-x-0",
          // Responsive width: mobile full-width when open, tablet reduced, desktop standard
          "w-64 md:w-50 lg:w-64",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src="/dalia-icon.png" alt="Dalia Joyas" className="w-6 h-6 lg:w-8 lg:h-8 object-contain rounded" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-heading text-base lg:text-lg text-sidebar-foreground truncate">Dalia Joyas</h2>
                <p className="text-xs lg:text-sm text-muted-foreground capitalize truncate">{userType}</p>
              </div>
            </div>
            
            {/* Close button for mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-md bg-background/80 backdrop-blur-sm border border-border hover:bg-background transition-colors md:hidden flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 lg:p-4">
            <ul className="space-y-1 lg:space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 rounded-lg text-sm font-body transition-colors min-h-[44px]",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-3 lg:p-4 border-t border-sidebar-border">
            <div className="space-y-1 lg:space-y-2">
              <Button variant="ghost" className="w-full justify-start gap-2 lg:gap-3 font-body h-11" asChild>
                <Link href={`/${userType}/perfil`} onClick={() => setIsOpen(false)}>
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Perfil</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 lg:gap-3 font-body text-destructive hover:text-destructive h-11"
                onClick={handleLogoutClick}
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog 
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogoutConfirm}
      />
    </>
  )
}
