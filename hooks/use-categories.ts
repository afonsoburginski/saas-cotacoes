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
      const url = tipo ? `/api/categories?tipo=${tipo}` : "/api/categories"
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch categories")
      return res.json()
    },
  })
}

