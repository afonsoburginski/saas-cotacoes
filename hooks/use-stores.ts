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
      const res = await fetch(`/api/stores?${searchParams.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch stores")
      return res.json() as Promise<StoresResponse>
    },
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

