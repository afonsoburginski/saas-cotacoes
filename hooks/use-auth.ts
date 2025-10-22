"use client"

import { useSession as useBetterAuthSession } from "@/lib/auth-client"
import { useAuthStore } from "@/stores/auth-store"
import { useEffect } from "react"

export function useAuth() {
  const { data: session, isPending } = useBetterAuthSession()
  const { user, updateUser, logout } = useAuthStore()

  // Sincronizar Better Auth com Zustand
  useEffect(() => {
    if (session?.user && !user) {
      // Usuário logado no Better Auth mas não no Zustand - sincronizar
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
      // Usuário não está mais logado no Better Auth mas está no Zustand - limpar
      logout()
    }
  }, [session, user, updateUser, logout])

  return {
    user: session?.user,
    session,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
  }
}

