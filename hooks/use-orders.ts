import React from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { createRealtimeSubscription } from "@/lib/supabase"
import { useStoreSlug } from "./use-store-slug"

export interface Order {
  id: number
  storeId: number
  userId: string
  tipo: 'cotacao' | 'pedido'
  status: 'pendente' | 'respondida' | 'aceita' | 'rejeitada' | 'concluida'
  total: number
  observacoes?: string
  enderecoEntrega?: string
  dataEntrega?: string
  createdAt: string
  updatedAt: string
  // Dados do usuário
  userName?: string
  userEmail?: string
  userImage?: string
  userPhone?: string
  // Dados da loja
  storeName?: string
  storeLogo?: string
}

export interface OrderItem {
  id: number
  orderId: number
  productId?: number
  serviceId?: number
  qty: number
  precoUnit: number
  precoTotal: number
  observacoes?: string
  createdAt: string
  // Dados do produto
  productName?: string
  productCategory?: string
  productImage?: string
  productPrice?: number
  productTemVariacaoPreco?: boolean
  productUnidadeMedida?: string
  // Dados do serviço
  serviceName?: string
  serviceCategory?: string
  serviceImage?: string
  servicePrice?: number
  serviceTipoPrecificacao?: string
  servicePrecoMinimo?: number
  servicePrecoMaximo?: number
}

interface UseOrdersParams {
  storeId?: string
}

export function useOrders(params?: UseOrdersParams) {
  const queryClient = useQueryClient()
  const { data: storeSlugData } = useStoreSlug()
  const storeId = params?.storeId || storeSlugData?.id?.toString()

  React.useEffect(() => {
    if (!storeId) return

    console.log('🔴 Realtime ativado para orders da loja:', storeId)
    
    const channel = createRealtimeSubscription('orders', (payload) => {
      console.log('🔄 Orders atualizados - payload:', payload)
      // Invalidar todas as queries de orders para garantir atualização
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["orders", { storeId }] })
    })
    
    return () => {
      channel.unsubscribe()
      console.log('🔴 Realtime desativado para orders da loja:', storeId)
    }
  }, [storeId, queryClient])

  return useQuery<Order[]>({
    queryKey: ["orders", { storeId }],
    queryFn: async () => {
      console.log('🔄 useOrders - Fazendo fetch para storeId:', storeId)
      const res = await fetch(`/api/orders?storeId=${encodeURIComponent(storeId || '')}`)
      if (!res.ok) throw new Error("Failed to fetch orders")
      const json = await res.json()
      console.log('✅ useOrders - Dados recebidos:', json.data?.length || 0, 'pedidos')
      return json.data as Order[]
    },
    enabled: !!storeId,
    // 🚀 Cache otimizado - dados ficam frescos por 3 minutos
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false, // Realtime já atualiza automaticamente
    refetchOnMount: false, // Não refetch ao montar se tem cache válido
  })
}

export function useOrderItems(orderId: number) {
  return useQuery<OrderItem[]>({
    queryKey: ["order-items", orderId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderId}/items`)
      if (!res.ok) throw new Error("Failed to fetch order items")
      const json = await res.json()
      return json.data as OrderItem[]
    },
    enabled: !!orderId && orderId > 0,
    // 🚀 Cache longo pois itens de pedido raramente mudam
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newOrder: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      })
      if (!res.ok) throw new Error("Failed to create order")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Failed to update order status")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}

export function useDeleteOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (orderId: number | string) => {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error("Failed to delete order")
      return res.json()
    },
    // 🚀 UI OTIMISTA: Remove imediatamente
    onMutate: async (orderId) => {
      await queryClient.cancelQueries({ queryKey: ["orders"] })
      
      const previousData = queryClient.getQueryData<Order[]>(["orders"])
      
      queryClient.setQueriesData<Order[]>(
        { queryKey: ["orders"] },
        (old) => {
          if (!old) return old
          return old.filter(order => order.id !== Number(orderId))
        }
      )
      
      return { previousData }
    },
    onError: (_err, _orderId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["orders"], context.previousData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}

export function useDeleteOrders() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (orderIds: number[]) => {
      const results = await Promise.all(
        orderIds.map(id => 
          fetch(`/api/orders/${id}`, { method: 'DELETE' })
            .then(res => {
              if (!res.ok) throw new Error(`Failed to delete order ${id}`)
              return res.json()
            })
        )
      )
      return results
    },
    // 🚀 UI OTIMISTA: Remove múltiplos imediatamente
    onMutate: async (orderIds) => {
      await queryClient.cancelQueries({ queryKey: ["orders"] })
      
      const previousData = queryClient.getQueryData<Order[]>(["orders"])
      
      queryClient.setQueriesData<Order[]>(
        { queryKey: ["orders"] },
        (old) => {
          if (!old) return old
          return old.filter(order => !orderIds.includes(order.id))
        }
      )
      
      return { previousData }
    },
    onError: (_err, _orderIds, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["orders"], context.previousData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}