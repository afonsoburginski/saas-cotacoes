import { useQuery } from "@tanstack/react-query"

interface Plan {
  id: string
  nome: string
  preco: number
  precoFormatted: string
  periodicidade: string
  ativo: boolean
  stripeProductId: string
  stripePriceId?: string
  icon: string
  description: string
}

export function usePlans() {
  return useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await fetch("/api/plans")
      if (!res.ok) throw new Error("Failed to fetch plans")
      const data = await res.json()
      return data.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}
