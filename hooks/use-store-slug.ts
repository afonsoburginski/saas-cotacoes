import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "@/lib/auth-client"
import { useStoreDataStore, type StoreData } from "@/stores/store-data-store"
import { useEffect } from "react"
import { createRealtimeSubscription } from "@/lib/supabase"

export function useStoreSlug() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const { storeData, setStoreData, shouldRefetch, isFetching, setIsFetching } = useStoreDataStore()
  
  // Query com cache otimizado
  const query = useQuery<StoreData | null>({
    queryKey: ["store-slug"],
    queryFn: async () => {
      setIsFetching(true)
      try {
        const res = await fetch("/api/user/store")
        if (!res.ok) return null
        const data = await res.json()
        
        const storeData = {
          slug: data.slug,
          storeName: data.store?.nome,
          id: data.storeId,
          logo: data.store?.logo,
          coverImage: data.store?.coverImage,
          lastFetched: null, // será setado pela store
        }
        
        // Atualizar Zustand store
        setStoreData(storeData)
        
        return storeData
      } finally {
        setIsFetching(false)
      }
    },
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    gcTime: 10 * 60 * 1000, // 10 minutos de garbage collection
    refetchOnWindowFocus: false, // Não refetch ao focar (usa realtime)
    refetchOnMount: 'always', // SEMPRE refetch ao montar para garantir dados atualizados
    // Usar dados iniciais do Zustand se disponível
    initialData: storeData,
    initialDataUpdatedAt: storeData?.lastFetched || undefined,
  })

  // Refetch somente se necessário (cache expirado)
  useEffect(() => {
    if (session?.user && shouldRefetch() && !isFetching) {
      query.refetch()
    }
  }, [session?.user, shouldRefetch, isFetching, query])

  // 🔴 REALTIME: Ouvir mudanças na loja (nome, logo, etc)
  useEffect(() => {
    if (!storeData?.id) return

    const channel = createRealtimeSubscription('stores', (payload) => {
      console.log('🔄 Store data atualizado - payload:', payload)
      // Invalidar query para refetch
      queryClient.invalidateQueries({ queryKey: ["store-slug"] })
    })
    
    return () => {
      channel.unsubscribe()
    }
  }, [storeData?.id, queryClient])

  // CRÍTICO: Retornar query.data OU storeData (fallback para cache do Zustand)
  return {
    ...query,
    data: query.data || storeData,
  }
}

