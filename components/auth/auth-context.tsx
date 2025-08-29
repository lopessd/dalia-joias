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
      // Get user profile with role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, role, created_at')
        .eq('id', supabaseUser.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        toast({
          title: "Erro de autenticação",
          description: "Não foi possível carregar o perfil do usuário",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (profile && supabaseUser.email) {
        const authUser: AuthUser = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          role: profile.role === 'reseller' ? 'revendedor' : profile.role
        }
        setUser(authUser)
      }
    } catch (error) {
      console.error('Error in handleAuthUser:', error)
      toast({
        title: "Erro de autenticação",
        description: "Erro interno do sistema",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleAuthUser(session.user)
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await handleAuthUser(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsLoading(false)
      } else if (event === 'TOKEN_REFRESHED' && session) {
        await handleAuthUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [handleAuthUser])

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