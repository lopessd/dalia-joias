"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@supabase/supabase-js"

interface AuthUser {
  id: string
  email: string
  role: "admin" | "revendedor"
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

    const handleAuthUser = useCallback(async (supabaseUser: User) => {
    try {
      // Prevent multiple simultaneous calls for the same user
      if (user?.id === supabaseUser.id) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      
      // Get user profile with timeout to prevent hanging requests
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      )

      const { data: profile, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any

      if (error) {
        console.error('Error fetching profile:', error)
        setUser(null)
        setIsLoading(false)
        return
      }

      const userWithProfile: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: profile.role === 'admin' ? 'admin' : 'revendedor'
      }

      setUser(userWithProfile)
      setIsLoading(false)
    } catch (error) {
      console.error('Error in handleAuthUser:', error)
      setUser(null)
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    let isMounted = true
    
    const initializeAuth = async () => {
      try {
        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session fetch timeout')), 5000)
        )

        const { data: { session } } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any

        if (!isMounted) return

        if (session) {
          await handleAuthUser(session.user)
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes with debouncing
    let authTimeout: NodeJS.Timeout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      // Debounce auth state changes to prevent rapid fire calls
      clearTimeout(authTimeout)
      authTimeout = setTimeout(async () => {
        if (!isMounted) return

        try {
          if (event === 'SIGNED_IN' && session) {
            await handleAuthUser(session.user)
          } else if (event === 'SIGNED_OUT') {
            setUser(null)
            setIsLoading(false)
          } else if (event === 'TOKEN_REFRESHED' && session) {
            // Only refresh if user doesn't exist or ID changed
            if (!user || user.id !== session.user.id) {
              await handleAuthUser(session.user)
            }
          }
        } catch (error) {
          console.error('Error handling auth state change:', error)
          setUser(null)
          setIsLoading(false)
        }
      }, 100)
    })

    return () => {
      isMounted = false
      clearTimeout(authTimeout)
      subscription.unsubscribe()
    }
  }, [handleAuthUser, user?.id])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        let errorMessage = "Erro de conexão. Tente novamente."
        
        switch (error.message) {
          case 'Invalid login credentials':
          case 'invalid_login_credentials':
            errorMessage = "Email ou senha incorretos"
            break
          case 'Email not confirmed':
            errorMessage = "Email não confirmado. Verifique sua caixa de entrada."
            break
          case 'Too many requests':
          case 'too_many_requests':
            errorMessage = "Muitas tentativas. Aguarde alguns minutos."
            break
          default:
            if (error.message.includes('credentials') || error.message.includes('Invalid')) {
              errorMessage = "Email ou senha incorretos"
            }
        }

        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive",
        })

        setIsLoading(false)
        return false
      }

      if (data.user) {
        // handleAuthUser will be called via onAuthStateChange
        // Keep loading true until user state is updated
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!",
        })
        return true
      }

      setIsLoading(false)
      return false
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "Erro no login",
        description: "Erro de conexão. Tente novamente.",
        variant: "destructive",
      })
      setIsLoading(false)
      return false
    }
  }

  const logout = async () => {
    try {
      // Clear user state immediately
      setUser(null)
      setIsLoading(false)
      
      // Sign out from Supabase
      await supabase.auth.signOut()
      
      // Clear any cached data
      if (typeof window !== 'undefined') {
        // Clear localStorage/sessionStorage if needed
        localStorage.clear()
        sessionStorage.clear()
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Force local logout even if remote fails
      setUser(null)
      setIsLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}