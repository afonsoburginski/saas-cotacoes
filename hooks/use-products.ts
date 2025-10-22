import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
}

export function useProducts(params?: UseProductsParams) {
  const searchParams = new URLSearchParams()
  
  if (params?.search) searchParams.set("search", params.search)
  if (params?.categoria) searchParams.set("categoria", params.categoria)
  if (params?.loja) searchParams.set("loja", params.loja)
  if (params?.storeId) searchParams.set("storeId", params.storeId)
  if (params?.includeInactive) searchParams.set("includeInactive", "true")
  
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const res = await fetch(`/api/products?${searchParams.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch products")
      return res.json() as Promise<ProductsResponse>
    },
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
    onSuccess: () => {
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
    onSuccess: () => {
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
    onSuccess: () => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

