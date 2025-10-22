import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
  const searchParams = new URLSearchParams()
  
  if (params?.search) searchParams.set("search", params.search)
  if (params?.categoria) searchParams.set("categoria", params.categoria)
  if (params?.loja) searchParams.set("loja", params.loja)
  if (params?.storeId) searchParams.set("storeId", params.storeId)
  if (params?.includeInactive) searchParams.set("includeInactive", "true")
  
  return useQuery({
    queryKey: ["services", params],
    queryFn: async () => {
      const res = await fetch(`/api/services?${searchParams.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch services")
      return res.json() as Promise<ServicesResponse>
    },
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
    onSuccess: () => {
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

