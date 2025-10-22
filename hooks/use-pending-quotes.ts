import React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createRealtimeSubscription } from "@/lib/supabase"

export function usePendingOrdersCount() {
  const queryClient = useQueryClient()
  
  const query = useQuery({
    queryKey: ["pending-orders-count"],
    queryFn: async () => {
      const res = await fetch('/api/orders')
      if (!res.ok) throw new Error("Failed to fetch orders")
      const json = await res.json()
      const orders = json.data || []
      
      // Contar apenas pedidos/cotações pendentes
      const pendingCount = orders.filter((o: any) => o.status === 'pendente').length
      return pendingCount
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  })

  // 🔴 REALTIME: Ouvir mudanças em orders para atualizar contador
  React.useEffect(() => {
    const channel = createRealtimeSubscription('orders', () => {
      queryClient.invalidateQueries({ queryKey: ["pending-orders-count"] })
    })
    
    return () => {
      channel.unsubscribe()
    }
  }, [queryClient])

  return query
}

export function useMarkOrdersAsSeen() {
  const queryClient = useQueryClient()
  
  return React.useCallback(() => {
    // Marcar como visto - invalidar queries para atualizar UI
    queryClient.invalidateQueries({ queryKey: ["pending-orders-count"] })
    queryClient.invalidateQueries({ queryKey: ["orders"] })
    
    // Opcional: Salvar timestamp de última visualização no localStorage
    localStorage.setItem('last-orders-view', new Date().toISOString())
  }, [queryClient])
}
