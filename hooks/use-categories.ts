import { useQuery } from "@tanstack/react-query"

interface CategoriesResponse {
  data: string[]
  total: number
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories")
      if (!res.ok) throw new Error("Failed to fetch categories")
      return res.json() as Promise<CategoriesResponse>
    },
  })
}

