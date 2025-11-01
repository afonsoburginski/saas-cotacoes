import { useQuery } from "@tanstack/react-query"

interface CategoriesResponse {
  data: string[]
  total: number
}

export function useCategories(opts?: { tipo?: 'produto' | 'servico' }) {
  const tipo = opts?.tipo
  return useQuery<CategoriesResponse>({
    queryKey: ["categories", tipo ?? "all"],
    queryFn: async () => {
      try {
        const url = tipo ? `/api/categories?tipo=${tipo}` : "/api/categories"
        const res = await fetch(url)
        if (!res.ok) {
          // Retornar array vazio ao invés de lançar erro
          return { data: [], total: 0 } as CategoriesResponse
        }
        const json = await res.json()
        return json as CategoriesResponse
      } catch (error) {
        // Sempre retornar dados, mesmo com erro
        return { data: [], total: 0 } as CategoriesResponse
      }
    },
    staleTime: 1000 * 60, // 1 minuto de cache
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2, // Retry 2 vezes
    retryDelay: 1000, // 1 segundo entre retries
  })
}

