import { useQuery } from "@tanstack/react-query"

export function useStoreSlug() {
  return useQuery({
    queryKey: ["store-slug"],
    queryFn: async () => {
      const res = await fetch("/api/user/store")
      if (!res.ok) return null
      const data = await res.json()
      return data.slug as string | null
    },
    staleTime: Infinity, // Slug não muda, cache permanente
  })
}

