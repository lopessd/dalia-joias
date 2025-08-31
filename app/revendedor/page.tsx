"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"

export default function RevendedorPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated - redirect to login
        router.push('/')
      } else if (user.role === 'revendedor') {
        // Revendedor user - redirect to joias
        router.push('/revendedor/joias')
      } else if (user.role === 'admin') {
        // Admin trying to access revendedor - redirect to their joias
        router.push('/admin/joias')
      } else {
        // Unknown role - redirect to login
        router.push('/')
      }
    }
  }, [user, isLoading, router])

  // Show loading while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground font-body">Cargando...</p>
      </div>
    </div>
  )
}
