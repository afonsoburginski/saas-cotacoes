import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface AdminCategory {
  id: number
  nome: string
  tipo: 'produto' | 'servico'
  descricao?: string | null
  icone?: string | null
  ativo: boolean
  ordem: number
}

export function useAdminCategories() {
  return useQuery<{ data: AdminCategory[]; total: number }>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories")
      if (!res.ok) throw new Error("Failed to fetch categories")
      return res.json()
    },
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<AdminCategory>) => {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create category")
      return res.json()
    },
    onMutate: async (newCat) => {
      await qc.cancelQueries({ queryKey: ["admin-categories"] })
      const previous = qc.getQueryData<{ data: AdminCategory[]; total: number }>(["admin-categories"])
      if (previous) {
        const optimistic: AdminCategory = {
          id: Math.floor(Math.random() * 1e9) * -1, // temp negative id
          nome: newCat.nome || "",
          tipo: (newCat.tipo as any) || "produto",
          descricao: newCat.descricao || null,
          icone: newCat.icone || null,
          ativo: newCat.ativo ?? true,
          ordem: newCat.ordem ?? 0,
        }
        qc.setQueryData(["admin-categories"], { data: [optimistic, ...previous.data], total: previous.total + 1 })
      }
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(["admin-categories"], ctx.previous)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] })
      qc.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AdminCategory> }) => {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update category")
      return res.json()
    },
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ["admin-categories"] })
      const previous = qc.getQueryData<{ data: AdminCategory[]; total: number }>(["admin-categories"])
      if (previous) {
        qc.setQueryData(["admin-categories"], {
          data: previous.data.map((c) => (c.id === id ? { ...c, ...data } as AdminCategory : c)),
          total: previous.total,
        })
      }
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(["admin-categories"], ctx.previous)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] })
      qc.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete category")
      return res.json()
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["admin-categories"] })
      const previous = qc.getQueryData<{ data: AdminCategory[]; total: number }>(["admin-categories"])
      if (previous) {
        qc.setQueryData(["admin-categories"], {
          data: previous.data.filter((c) => c.id !== id),
          total: Math.max(0, previous.total - 1),
        })
      }
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(["admin-categories"], ctx.previous)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] })
      qc.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}


