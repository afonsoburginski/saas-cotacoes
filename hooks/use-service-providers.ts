import { useQuery } from "@tanstack/react-query"

export function useServiceProviders(limit: number = 10) {
  return useQuery({
    queryKey: ["service-providers", limit],
    queryFn: async () => {
      const res = await fetch(`/api/service-providers?limit=${limit}`)
      if (!res.ok) throw new Error("Failed to fetch service providers")
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

