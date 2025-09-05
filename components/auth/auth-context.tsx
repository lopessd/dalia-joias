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

      // AC1, AC2, AC6: Verificar se distribuidor está ativo
      if (profile.role === 'reseller' && !profile.active) {
        // Logout forçado e toast de erro
        console.warn('Tentativa de acesso com conta inativa:', supabaseUser.email)
        await supabase.auth.signOut()
        toast({
          title: "Acesso Negado",
          description: "Sua conta está desativada. Entre em contato com o administrador do sistema.",
          variant: "destructive"
        })
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
  }, [user?.id, toast])

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
        let errorMessage = "Error de conexión. Inténtelo de nuevo."
        
        switch (error.message) {
          case 'Invalid login credentials':
          case 'invalid_login_credentials':
            errorMessage = "Email o contraseña incorrectos"
            break
          case 'Email not confirmed':
            errorMessage = "Email no confirmado. Verifique su bandeja de entrada."
            break
          case 'Too many requests':
          case 'too_many_requests':
            errorMessage = "Demasiados intentos. Espere unos minutos."
            break
          default:
            if (error.message.includes('credentials') || error.message.includes('Invalid')) {
              errorMessage = "Email o contraseña incorrectos"
            }
        }

        toast({
          title: "Error en el login",
          description: errorMessage,
          variant: "destructive",
        })

        setIsLoading(false)
        return false
      }

      if (data.user) {
        // AC1, AC2, AC6: Verificar perfil ativo ANTES de retornar sucesso
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (profileError) {
            console.error('Error al buscar perfil durante login:', profileError)
            await supabase.auth.signOut()
            toast({
              title: "Error en el login",
              description: "Error al cargar perfil del usuario.",
              variant: "destructive",
            })
            setIsLoading(false)
            return false
          }

          // Verificar se distribuidor está ativo
          if (profile.role === 'reseller' && !profile.active) {
            console.warn('Login negado - conta inativa:', data.user.email)
            await supabase.auth.signOut()
            toast({
              title: "Acceso Denegado",
              description: "Su cuenta está desactivada. Póngase en contacto con el administrador del sistema.",
              variant: "destructive"
            })
            setIsLoading(false)
            return false
          }

          // Se chegou até aqui, login é válido
          // handleAuthUser será chamado via onAuthStateChange para atualizar o estado
          toast({
            title: "Éxito",
            description: "¡Login realizado con éxito!",
          })
          return true

        } catch (profileCheckError) {
          console.error('Error en la verificación del perfil:', profileCheckError)
          await supabase.auth.signOut()
          toast({
            title: "Error en el login",
            description: "Error al validar perfil del usuario.",
            variant: "destructive",
          })
          setIsLoading(false)
          return false
        }
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