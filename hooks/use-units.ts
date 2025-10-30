import { useQuery } from "@tanstack/react-query"

export interface UnitItem {
  id: number
  nome: string
  abreviacao: string
  tipo: 'unit' | 'length' | 'area' | 'volume' | 'weight' | 'time' | 'package'
}

interface UnitsResponse {
  data: UnitItem[]
  total: number
}

export function useUnits(opts?: { tipo?: UnitItem['tipo'] }) {
  const tipo = opts?.tipo
  return useQuery<UnitsResponse>({
    queryKey: ["units", tipo ?? "all"],
    queryFn: async () => {
      const url = tipo ? `/api/units?tipo=${tipo}` : "/api/units"
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch units")
      return res.json()
    },
  })
}


