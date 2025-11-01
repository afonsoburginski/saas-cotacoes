import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { createRealtimeSubscription } from "@/lib/supabase"
import type { Store } from "@/lib/types"

interface StoresResponse {
  data: Store[]
  total: number
}

interface UseStoresParams {
  status?: string
  businessType?: string
}

export function useStores(params?: UseStoresParams) {
  const queryClient = useQueryClient()
  const searchParams = new URLSearchParams()
  
  if (params?.status) searchParams.set("status", params.status)
  if (params?.businessType) searchParams.set("businessType", params.businessType)
  
  // 🔴 REALTIME: Ouvir mudanças em stores
  useEffect(() => {
    const channel = createRealtimeSubscription('stores', () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] })
    })
    
    return () => {
      channel.unsubscribe()
    }
  }, [queryClient])
  
  return useQuery({
    queryKey: ["stores", params],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/stores?${searchParams.toString()}`)
        if (!res.ok) {
          // Retornar array vazio ao invés de lançar erro
          return { data: [], total: 0 } as StoresResponse
        }
        const json = await res.json()
        return json as StoresResponse
      } catch (error) {
        // Sempre retornar dados, mesmo com erro
        return { data: [], total: 0 } as StoresResponse
      }
    },
    staleTime: 1000 * 30, // 30 segundos de cache
    gcTime: 1000 * 60 * 5, // 5 minutos no cache
    refetchOnWindowFocus: true, // Recarregar ao focar janela
    refetchOnMount: true, // Sempre refetch ao montar componente
    retry: 2, // Retry 2 vezes
    retryDelay: 1000, // 1 segundo entre retries
    // Removido refetchInterval - estava causando muitas requisições repetidas
    // O refetchOnWindowFocus e refetchOnMount são suficientes
  })
}

export function useStore(id: string) {
  return useQuery({
    queryKey: ["store", id],
    queryFn: async () => {
      const res = await fetch(`/api/stores/${id}`)
      if (!res.ok) throw new Error("Failed to fetch store")
      const json = await res.json()
      return json.data as Store
    },
    enabled: !!id,
  })
}

