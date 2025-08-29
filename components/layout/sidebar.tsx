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
    // { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/joias", label: "Joias", icon: Gem },
    // { href: "/admin/revendedores", label: "Revendedores", icon: Users },
    // { href: "/admin/mostruario", label: "Mostruário", icon: Send },
  ]

  const revendedorNavItems = [
    // { href: "/revendedor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    // { href: "/revendedor/vendas", label: "Vendas", icon: ShoppingCart },
    { href: "/revendedor/joias", label: "Joias", icon: Gem },
    // { href: "/revendedor/historico", label: "Histórico", icon: History },
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
      {/* Mobile hamburger button - só aparece quando fechado */}
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

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                <img src="/dalia-icon.png" alt="Dalia Joyas" className="w-8 h-8 object-contain rounded" />
              </div>
              <div>
                <h2 className="font-heading text-lg text-sidebar-foreground">Dalia Joyas</h2>
                <p className="text-sm text-muted-foreground capitalize">{userType}</p>
              </div>
            </div>
            
            {/* Botão X alinhado à direita - mesmo estilo do hambúrguer */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-md bg-background/80 backdrop-blur-sm border border-border hover:bg-background transition-colors md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-body transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start gap-3 font-body" asChild>
                <Link href={`/${userType}/perfil`} onClick={() => setIsOpen(false)}>
                  <User className="w-4 h-4" />
                  Perfil
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 font-body text-destructive hover:text-destructive"
                onClick={handleLogoutClick}
              >
                <LogOut className="w-4 h-4" />
                Sair
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
