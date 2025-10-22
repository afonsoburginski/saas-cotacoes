import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "@/lib/auth-client"

interface UpdateProfileData {
  phone?: string
  businessName?: string
  businessType?: 'comercio' | 'servico'
  plan?: 'basico' | 'plus' | 'premium'
  address?: string
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  
  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update profile')
      return res.json()
    },
    onSuccess: () => {
      // Revalidar sessão
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (role: string) => {
      const res = await fetch('/api/user/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (!res.ok) throw new Error('Failed to update role')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}

