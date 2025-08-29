"use client"

import { useEffect } from "react"
import { useAuth } from "@/components/auth/auth-context"

export function AuthDebugger() {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    // In development, log auth state changes
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth State:', { user: user?.email, isLoading })
    }

    // In production, detect infinite loading states
    if (process.env.NODE_ENV === 'production' && isLoading) {
      const timeout = setTimeout(() => {
        console.error('Infinite loading detected, forcing page reload')
        window.location.reload()
      }, 30000) // 30 seconds timeout in production

      return () => clearTimeout(timeout)
    }
  }, [user, isLoading])

  // Add performance monitoring
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation.loadEventEnd > 10000) { // More than 10 seconds load time
        console.warn('Slow page load detected:', navigation.loadEventEnd, 'ms')
      }
    }
  }, [])

  return null
}
