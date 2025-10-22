import { useQuery } from "@tanstack/react-query"

export interface Plan {
  id: string
  nome: string
  preco: number
  periodicidade: 'mensal' | 'anual'
  recursos: string[]
  ativo: boolean
}

interface PlansResponse {
  data: Plan[]
  total: number
}

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await fetch("/api/plans")
      if (!res.ok) throw new Error("Failed to fetch plans")
      return res.json() as Promise<PlansResponse>
    },
  })
}

