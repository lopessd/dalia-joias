"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-context"

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles?: ("admin" | "revendedor")[]
  redirectTo?: string
}

export function RouteGuard({ children, allowedRoles, redirectTo = "/" }: RouteGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!user) {
        router.push(redirectTo)
        return
      }

      // If allowedRoles is specified and user doesn't have permission
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate joias based on user role
        if (user.role === 'admin') {
          router.push('/admin/joias')
        } else if (user.role === 'revendedor') {
          router.push('/revendedor/joias')
        } else {
          router.push(redirectTo)
        }
        return
      }
    }
  }, [user, isLoading, allowedRoles, redirectTo, router])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If not authenticated, don't render content (redirect is happening)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If allowedRoles is specified and user doesn't have permission, don't render
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}
