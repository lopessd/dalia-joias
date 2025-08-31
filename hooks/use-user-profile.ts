"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface UserProfileData {
  name: string
  email: string
}

interface UseUserProfileReturn {
  profileData: UserProfileData | null
  isLoading: boolean
  updateProfile: (name: string) => Promise<boolean>
  updatePassword: (newPassword: string) => Promise<boolean>
}

export function useUserProfile(): UseUserProfileReturn {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profileData, setProfileData] = useState<UserProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setProfileData(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        
        // Get current user data from Supabase Auth
        const { data: { user: authUser }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Error fetching user:', error)
          setProfileData(null)
          setIsLoading(false)
          return
        }

        if (authUser) {
          // Extract display_name from user metadata or use email as fallback
          const displayName = authUser.user_metadata?.display_name || 
                             authUser.user_metadata?.name || 
                             authUser.email?.split('@')[0] || 
                             'Usuário'
          
          setProfileData({
            name: displayName,
            email: authUser.email || ''
          })
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
        setProfileData(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [user])

  // Update user profile (display_name)
  const updateProfile = async (name: string): Promise<boolean> => {
    if (!user || !name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório.",
        variant: "destructive",
      })
      return false
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          display_name: name.trim(),
          name: name.trim() // Also store in 'name' field for compatibility
        }
      })

      if (error) {
        console.error('Error updating profile:', error)
        toast({
          title: "Erro",
          description: "Erro ao atualizar perfil. Tente novamente.",
          variant: "destructive",
        })
        return false
      }

      // Update local state
      setProfileData(prev => prev ? { ...prev, name: name.trim() } : null)
      
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      })
      
      return true
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil. Tente novamente.",
        variant: "destructive",
      })
      return false
    }
  }

  // Update user password
  const updatePassword = async (newPassword: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      })
      return false
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      })
      return false
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('Error updating password:', error)
        
        // Handle specific error cases
        let errorMessage = "Erro ao alterar senha. Tente novamente."
        if (error.message.includes('password')) {
          errorMessage = "Erro na validação da senha. Verifique os requisitos."
        } else if (error.message.includes('weak')) {
          errorMessage = "Senha muito fraca. Use uma senha mais forte."
        }
        
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso!",
      })
      
      return true
    } catch (error) {
      console.error('Error updating password:', error)
      toast({
        title: "Erro",
        description: "Erro ao alterar senha. Tente novamente.",
        variant: "destructive",
      })
      return false
    }
  }

  return {
    profileData,
    isLoading,
    updateProfile,
    updatePassword
  }
}
