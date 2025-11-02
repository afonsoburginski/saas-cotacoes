"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 🚀 Cache otimizado para navegação fluida
            staleTime: 5 * 60 * 1000, // 5 minutos - dados considerados "frescos"
            gcTime: 10 * 60 * 1000, // 10 minutos - tempo antes de limpar cache
            refetchOnWindowFocus: false, // Não refetch ao focar (usar realtime)
            refetchOnMount: false, // Não refetch ao montar se tem cache válido
            refetchOnReconnect: true, // Refetch ao reconectar internet
            retry: 1, // Tentar apenas 1 vez em caso de erro
            retryDelay: 1000, // 1 segundo entre retries
          },
          mutations: {
            // 🚀 Mutations otimizadas
            retry: 0, // Não fazer retry em mutations
            onError: (error) => {
              console.error('Mutation error:', error)
            },
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

