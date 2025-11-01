import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useCallback } from "react"
import { createRealtimeSubscription } from "@/lib/supabase"
import type { Product } from "@/lib/types"

interface ProductsResponse {
  data: Product[]
  total: number
}

interface UseProductsParams {
  search?: string
  categoria?: string
  loja?: string
  storeId?: string
  includeInactive?: boolean
  destacado?: boolean
}

export function useProducts(params?: UseProductsParams) {
  const queryClient = useQueryClient()
  const searchParams = new URLSearchParams()
  
  if (params?.search) searchParams.set("search", params.search)
  if (params?.categoria) searchParams.set("categoria", params.categoria)
  if (params?.loja) searchParams.set("loja", params.loja)
  if (params?.storeId) searchParams.set("storeId", params.storeId)
  if (params?.includeInactive) searchParams.set("includeInactive", "true")
  if (params?.destacado) searchParams.set("destacado", "true")
  
  // 🔴 REALTIME: Ouvir mudanças em produtos
  useEffect(() => {
    const channel = createRealtimeSubscription('products', () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    })
    
    return () => {
      channel.unsubscribe()
    }
  }, [queryClient])
  
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/products?${searchParams.toString()}`)
        if (!res.ok) {
          // Retornar array vazio ao invés de lançar erro
          return { data: [], total: 0 } as ProductsResponse
        }
        const json = await res.json()
        return json as ProductsResponse
      } catch (error) {
        // Sempre retornar dados, mesmo com erro
        return { data: [], total: 0 } as ProductsResponse
      }
    },
    staleTime: 1000 * 30, // 30 segundos de cache (reduzido para APIs públicas)
    gcTime: 1000 * 60 * 5, // 5 minutos no cache
    refetchOnWindowFocus: true, // Recarregar ao focar janela para garantir dados atualizados
    refetchOnMount: true, // Sempre refetch ao montar componente
    retry: 2, // Retry 2 vezes
    retryDelay: 1000, // 1 segundo entre retries
    // Removido refetchInterval - estava causando muitas requisições repetidas
    // O refetchOnWindowFocus e refetchOnMount são suficientes
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`)
      if (!res.ok) throw new Error("Failed to fetch product")
      const json = await res.json()
      return json.data as Product
    },
    enabled: !!id,
  })
}

// Mutation para criar produto
export function useCreateProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (product: Partial<Product>) => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      })
      if (!res.ok) throw new Error("Failed to create product")
      return res.json()
    },
    // 🚀 UI OTIMISTA: Adiciona imediatamente antes do servidor responder
    onMutate: async (newProduct) => {
      await queryClient.cancelQueries({ queryKey: ["products"] })
      
      const previousData = queryClient.getQueryData<ProductsResponse>(["products"])
      
      // Criar produto temporário com ID fake
      const tempProduct = {
        ...newProduct,
        id: String(Date.now()), // ID temporário como string
      } as Product
      
      // Adicionar ao cache otimista
      queryClient.setQueriesData<ProductsResponse>(
        { queryKey: ["products"] },
        (old) => {
          if (!old) return { data: [tempProduct], total: 1 }
          return {
            ...old,
            data: [tempProduct, ...old.data],
            total: old.total + 1
          }
        }
      )
      
      return { previousData, tempProduct }
    },
    onError: (_err, _variables, context) => {
      // Reverter em caso de erro
      if (context?.previousData) {
        queryClient.setQueryData(["products"], context.previousData)
      }
    },
    onSuccess: (_data, _variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

// Mutation para atualizar produto
export function useUpdateProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update product")
      return res.json()
    },
    // 🚀 UI OTIMISTA: Atualiza imediatamente antes do servidor responder
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["products"] })
      
      const previousData = queryClient.getQueryData<ProductsResponse>(["products"])
      
      // Atualizar cache otimista
      queryClient.setQueriesData<ProductsResponse>(
        { queryKey: ["products"] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.map(product => 
              product.id.toString() === id 
                ? { ...product, ...data }
                : product
            )
          }
        }
      )
      
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      // Reverter em caso de erro
      if (context?.previousData) {
        queryClient.setQueryData(["products"], context.previousData)
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] })
    },
  })
}

// Mutation para deletar produto
export function useDeleteProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete product")
      return res.json()
    },
    // 🚀 UI OTIMISTA: Remove imediatamente antes do servidor responder
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["products"] })
      
      const previousData = queryClient.getQueryData<ProductsResponse>(["products"])
      
      // Remover do cache otimista
      queryClient.setQueriesData<ProductsResponse>(
        { queryKey: ["products"] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.filter(product => product.id.toString() !== id)
          }
        }
      )
      
      return { previousData }
    },
    onError: (_err, _id, context) => {
      // Reverter em caso de erro
      if (context?.previousData) {
        queryClient.setQueryData(["products"], context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

// Mutation para deletar múltiplos produtos
export function useDeleteProducts() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.all(
        ids.map(id => 
          fetch(`/api/products/${id}`, { method: "DELETE" })
            .then(res => {
              if (!res.ok) throw new Error(`Failed to delete product ${id}`)
              return res.json()
            })
        )
      )
      return results
    },
    // 🚀 UI OTIMISTA: Remove múltiplos imediatamente
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ["products"] })
      
      const previousData = queryClient.getQueryData<ProductsResponse>(["products"])
      
      queryClient.setQueriesData<ProductsResponse>(
        { queryKey: ["products"] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.filter(product => !ids.includes(product.id.toString()))
          }
        }
      )
      
      return { previousData }
    },
    onError: (_err, _ids, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["products"], context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

// Mutation para atualizar múltiplos produtos
export function useUpdateProducts() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ ids, data }: { ids: string[]; data: Partial<Product> }) => {
      const results = await Promise.all(
        ids.map(id => 
          fetch(`/api/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }).then(res => {
            if (!res.ok) throw new Error(`Failed to update product ${id}`)
            return res.json()
          })
        )
      )
      return results
    },
    // 🚀 UI OTIMISTA: Atualiza múltiplos imediatamente
    onMutate: async ({ ids, data }) => {
      await queryClient.cancelQueries({ queryKey: ["products"] })
      
      const previousData = queryClient.getQueryData<ProductsResponse>(["products"])
      
      queryClient.setQueriesData<ProductsResponse>(
        { queryKey: ["products"] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.map(product => 
              ids.includes(product.id.toString())
                ? { ...product, ...data }
                : product
            )
          }
        }
      )
      
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["products"], context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

// Mutation para criar múltiplos produtos (bulk import)
export function useBulkCreateProducts() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (products: Partial<Product>[]) => {
      const results = await Promise.all(
        products.map(product => 
          fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product),
          }).then(res => {
            if (!res.ok) throw new Error(`Failed to create product ${product.nome}`)
            return res.json()
          })
        )
      )
      return results
    },
    // 🚀 UI OTIMISTA: Adiciona múltiplos imediatamente
    onMutate: async (newProducts) => {
      await queryClient.cancelQueries({ queryKey: ["products"] })
      
      const previousData = queryClient.getQueryData<ProductsResponse>(["products"])
      
      const tempProducts = newProducts.map((product, idx) => ({
        ...product,
        id: String(Date.now() + idx),
      })) as Product[]
      
      queryClient.setQueriesData<ProductsResponse>(
        { queryKey: ["products"] },
        (old) => {
          if (!old) return { data: tempProducts, total: tempProducts.length }
          return {
            ...old,
            data: [...tempProducts, ...old.data],
            total: old.total + tempProducts.length
          }
        }
      )
      
      return { previousData, tempProducts }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["products"], context.previousData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

