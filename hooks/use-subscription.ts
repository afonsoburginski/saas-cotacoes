import { useQuery } from "@tanstack/react-query"

interface SubscriptionData {
  hasSubscription: boolean
  plan: 'basico' | 'plus' | 'premium' | null
  status: string | null
  currentPeriodEnd?: number
  cancelAtPeriodEnd?: boolean
}

export function useSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await fetch("/api/user/subscription")
      if (!res.ok) throw new Error("Failed to fetch subscription")
      return res.json() as Promise<SubscriptionData>
    },
    // Revalidar a cada 5 minutos
    staleTime: 5 * 60 * 1000,
  })
}

