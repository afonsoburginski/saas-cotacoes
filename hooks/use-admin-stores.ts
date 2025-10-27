import { useQuery } from "@tanstack/react-query"

export function useAdminStores() {
  return useQuery({
    queryKey: ["admin-stores"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stores")
      if (!res.ok) throw new Error("Failed to fetch stores")
      return res.json()
    },
    staleTime: 1000 * 60, // 1 minuto
    refetchInterval: 60000, // Refetch a cada 1 minuto
  })
}

