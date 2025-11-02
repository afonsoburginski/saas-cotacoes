"use client"

import { useSession as useBetterAuthSession } from "@/lib/auth-client"
import { useAuthStore } from "@/stores/auth-store"
import { useEffect } from "react"

/**
 * Hook otimizado para sessão - usa cache do Better Auth + Zustand
 * A sessão já está nos cookies, então o Better Auth não faz fetch desnecessário
 * Este hook apenas sincroniza com Zustand para estado global
 */
export function useOptimizedSession() {
  const { data: session, isPending, error } = useBetterAuthSession()
  const { user, updateUser, logout } = useAuthStore()

  // Sincronizar Better Auth com Zustand (apenas quando houver mudanças)
  useEffect(() => {
    if (session?.user && (!user || user.id !== session.user.id)) {
      // Usuário logado no Better Auth - sincronizar com Zustand
      updateUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.image,
        role: (session.user.role as any) || 'usuario',
        phone: session.user.phone,
        businessName: session.user.businessName,
        businessType: session.user.businessType as any,
        plan: session.user.plan as any,
        address: session.user.address,
      })
    } else if (!session?.user && user) {
      // Usuário não está mais logado - limpar Zustand
      logout()
    }
  }, [session?.user?.id]) // Só atualizar quando o ID mudar

  return {
    user: session?.user,
    session,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    error,
    // Dados do Zustand como fallback
    cachedUser: user,
  }
}

