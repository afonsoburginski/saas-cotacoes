import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { createRealtimeSubscription } from "@/lib/supabase"
import type { Service } from "@/lib/types"

interface ServicesResponse {
  data: Service[]
  total: number
}

interface UseServicesParams {
  search?: string
  categoria?: string
  loja?: string
  storeId?: string
  includeInactive?: boolean
}

export function useServices(params?: UseServicesParams) {
  const queryClient = useQueryClient()
  const searchParams = new URLSearchParams()
  
  if (params?.search) searchParams.set("search", params.search)
  if (params?.categoria) searchParams.set("categoria", params.categoria)
  if (params?.loja) searchParams.set("loja", params.loja)
  if (params?.storeId) searchParams.set("storeId", params.storeId)
  if (params?.includeInactive) searchParams.set("includeInactive", "true")
  
  // 🔴 REALTIME: Ouvir mudanças em serviços
  useEffect(() => {
    const channel = createRealtimeSubscription('services', () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
    })
    
    return () => {
      channel.unsubscribe()
    }
  }, [queryClient])
  
  return useQuery({
    queryKey: ["services", params],
    queryFn: async () => {
      const res = await fetch(`/api/services?${searchParams.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch services")
      return res.json() as Promise<ServicesResponse>
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
    gcTime: 1000 * 60 * 10, // 10 minutos no cache
    refetchOnWindowFocus: false, // Não recarregar ao focar janela
  })
}

export function useService(id: string) {
  return useQuery({
    queryKey: ["service", id],
    queryFn: async () => {
      const res = await fetch(`/api/services/${id}`)
      if (!res.ok) throw new Error("Failed to fetch service")
      const json = await res.json()
      return json.data as Service
    },
    enabled: !!id,
  })
}

// Mutation para criar serviço
export function useCreateService() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (service: Partial<Service>) => {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service),
      })
      if (!res.ok) throw new Error("Failed to create service")
      return res.json()
    },
    // 🚀 UI OTIMISTA: Adiciona imediatamente
    onMutate: async (newService) => {
      await queryClient.cancelQueries({ queryKey: ["services"] })
      
      const previousData = queryClient.getQueryData<ServicesResponse>(["services"])
      
      const tempService: Service = {
        ...newService as Service,
        id: Date.now(),
      } as Service
      
      queryClient.setQueriesData<ServicesResponse>(
        { queryKey: ["services"] },
        (old) => {
          if (!old) return { data: [tempService], total: 1 }
          return {
            ...old,
            data: [tempService, ...old.data],
            total: old.total + 1
          }
        }
      )
      
      return { previousData, tempService }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["services"], context.previousData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
    },
  })
}

// Mutation para atualizar serviço
export function useUpdateService() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Service> }) => {
      const res = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update service")
      return res.json()
    },
    // 🚀 UI OTIMISTA: Atualiza imediatamente
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["services"] })
      
      const previousData = queryClient.getQueryData<ServicesResponse>(["services"])
      
      queryClient.setQueriesData<ServicesResponse>(
        { queryKey: ["services"] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.map(service => 
              service.id.toString() === id 
                ? { ...service, ...data }
                : service
            )
          }
        }
      )
      
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["services"], context.previousData)
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      queryClient.invalidateQueries({ queryKey: ["service", variables.id] })
    },
  })
}

// Mutation para deletar serviço
export function useDeleteService() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete service")
      return res.json()
    },
    // 🚀 UI OTIMISTA: Remove imediatamente
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["services"] })
      
      const previousData = queryClient.getQueryData<ServicesResponse>(["services"])
      
      queryClient.setQueriesData<ServicesResponse>(
        { queryKey: ["services"] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.filter(service => service.id.toString() !== id)
          }
        }
      )
      
      return { previousData }
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["services"], context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
    },
  })
}

// Mutation para deletar múltiplos serviços
export function useDeleteServices() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.all(
        ids.map(id => 
          fetch(`/api/services/${id}`, { method: "DELETE" })
            .then(res => {
              if (!res.ok) throw new Error(`Failed to delete service ${id}`)
              return res.json()
            })
        )
      )
      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
    },
  })
}

// Mutation para atualizar múltiplos serviços
export function useUpdateServices() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ ids, data }: { ids: string[]; data: Partial<Service> }) => {
      const results = await Promise.all(
        ids.map(id => 
          fetch(`/api/services/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }).then(res => {
            if (!res.ok) throw new Error(`Failed to update service ${id}`)
            return res.json()
          })
        )
      )
      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
    },
  })
}

