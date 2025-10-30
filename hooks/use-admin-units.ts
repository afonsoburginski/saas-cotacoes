import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface AdminUnit {
  id: number
  nome: string
  abreviacao: string
  tipo: 'unit' | 'length' | 'area' | 'volume' | 'weight' | 'time' | 'package'
  ativo: boolean
  ordem: number
}

export function useAdminUnits() {
  return useQuery<{ data: AdminUnit[]; total: number }>({
    queryKey: ["admin-units"],
    queryFn: async () => {
      const res = await fetch("/api/admin/units")
      if (!res.ok) throw new Error("Failed to fetch units")
      return res.json()
    },
  })
}

export function useCreateUnit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<AdminUnit>) => {
      const res = await fetch("/api/admin/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create unit")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-units"] })
    },
  })
}

export function useUpdateUnit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AdminUnit> }) => {
      const res = await fetch(`/api/admin/units/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update unit")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-units"] })
    },
  })
}

export function useDeleteUnit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/units/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete unit")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-units"] })
    },
  })
}


