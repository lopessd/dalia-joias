"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated - redirect to login
        router.push('/')
      } else if (user.role === 'admin') {
        // Admin user - redirect to joias
        router.push('/admin/joias')
      } else if (user.role === 'revendedor') {
        // Revendedor trying to access admin - redirect to their joias
        router.push('/revendedor/joias')
      } else {
        // Unknown role - redirect to login
        router.push('/')
      }
    }
  }, [user, isLoading, router])

  // Show loading while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  )
}
