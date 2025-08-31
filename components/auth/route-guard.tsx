"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-context"
import { LoadingScreen } from "@/components/ui/loading-screen"

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles?: ("admin" | "revendedor")[]
  redirectTo?: string
}

export function RouteGuard({ children, allowedRoles, redirectTo = "/" }: RouteGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected || isLoading) return

    // Debounce navigation to prevent rapid redirects
    const redirectTimeout = setTimeout(() => {
      // If not authenticated, redirect to login
      if (!user) {
        setHasRedirected(true)
        router.push(redirectTo)
        return
      }

      // If allowedRoles is specified and user doesn't have permission
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        setHasRedirected(true)
        // Redirect to appropriate dashboard based on user role
        if (user.role === 'admin') {
          router.push('/admin/joias')
        } else if (user.role === 'revendedor') {
          router.push('/revendedor/joias')
        } else {
          router.push(redirectTo)
        }
        return
      }
    }, 100)

    return () => clearTimeout(redirectTimeout)
  }, [user, isLoading, allowedRoles, redirectTo, router, hasRedirected])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <LoadingScreen 
        message="Verificando autenticação..." 
        onTimeout={() => {
          console.error('Auth timeout reached, forcing reload')
          window.location.reload()
        }}
      />
    )
  }

  // If not authenticated, don't render content (redirect is happening)
  if (!user) {
    return (
      <LoadingScreen 
        message="Redirecionando..." 
        timeout={5000}
        onTimeout={() => {
          console.error('Redirect timeout, forcing navigation')
          window.location.href = redirectTo
        }}
      />
    )
  }

  // If allowedRoles is specified and user doesn't have permission, don't render
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <LoadingScreen 
        message="Redirecionando para área autorizada..." 
        timeout={5000}
        onTimeout={() => {
          console.error('Permission redirect timeout, forcing navigation')
          if (user.role === 'admin') {
            window.location.href = '/admin/joias'
          } else if (user.role === 'revendedor') {
            window.location.href = '/revendedor/joias'
          } else {
            window.location.href = redirectTo
          }
        }}
      />
    )
  }

  return <>{children}</>
}
