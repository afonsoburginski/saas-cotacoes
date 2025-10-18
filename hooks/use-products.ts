import { useQuery } from "@tanstack/react-query"
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
}

export function useProducts(params?: UseProductsParams) {
  const searchParams = new URLSearchParams()
  
  if (params?.search) searchParams.set("search", params.search)
  if (params?.categoria) searchParams.set("categoria", params.categoria)
  if (params?.loja) searchParams.set("loja", params.loja)
  if (params?.storeId) searchParams.set("storeId", params.storeId)
  
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

