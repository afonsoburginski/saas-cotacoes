import { useQuery } from "@tanstack/react-query"

interface AdminStats {
  totalUsers: number
  totalStores: number
  totalOrders: number
  totalRevenue: number
  storesByStatus: Array<{ status: string; count: number }>
  storesByPlan: Array<{ plano: string; count: number }>
  storesByType: Array<{ tipo: string; count: number }>
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats")
      if (!res.ok) throw new Error("Failed to fetch stats")
      return res.json()
    },
    staleTime: 1000 * 60, // 1 minuto
    refetchInterval: 60000, // Refetch a cada 1 minuto
  })
}

