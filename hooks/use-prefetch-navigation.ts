"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { useRouter } from "next/navigation"

/**
 * Hook para prefetch inteligente de navegação
 * Carrega dados antes de navegar para melhorar a experiência
 */
export function usePrefetchNavigation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  // Prefetch de pedidos
  const prefetchOrders = useCallback(async (storeId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ["orders", { storeId }],
      queryFn: async () => {
        const res = await fetch('/api/orders')
        if (!res.ok) return []
        const json = await res.json()
        return json.data
      },
      staleTime: 3 * 60 * 1000, // 3 minutos
    })
  }, [queryClient])

  // Prefetch de produtos
  const prefetchProducts = useCallback(async (storeId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ["products", { storeId, includeInactive: true }],
      queryFn: async () => {
        const res = await fetch(`/api/products?storeId=${storeId}&includeInactive=true`)
        if (!res.ok) return { data: [], total: 0 }
        return res.json()
      },
      staleTime: 3 * 60 * 1000,
    })
  }, [queryClient])

  // Navegação otimizada com prefetch
  const navigateWithPrefetch = useCallback(async (
    path: string,
    options?: {
      prefetchOrders?: boolean
      prefetchProducts?: boolean
      storeId?: string
    }
  ) => {
    // Fazer prefetch em paralelo
    const prefetchPromises: Promise<any>[] = []
    
    if (options?.prefetchOrders && options?.storeId) {
      prefetchPromises.push(prefetchOrders(options.storeId))
    }
    
    if (options?.prefetchProducts && options?.storeId) {
      prefetchPromises.push(prefetchProducts(options.storeId))
    }

    // Aguardar prefetch completar (em paralelo)
    if (prefetchPromises.length > 0) {
      await Promise.all(prefetchPromises)
    }

    // Navegar
    router.push(path)
  }, [router, prefetchOrders, prefetchProducts])

  return {
    prefetchOrders,
    prefetchProducts,
    navigateWithPrefetch,
  }
}

