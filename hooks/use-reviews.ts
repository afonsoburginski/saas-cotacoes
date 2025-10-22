import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { createRealtimeSubscription } from "@/lib/supabase"

interface Review {
  id: number
  userId: string
  userName: string
  storeId: number
  rating: number
  comentario: string | null
  status: string
  verified: boolean
  createdAt: string
}

interface UseReviewsParams {
  storeId: string
}

interface CreateReviewData {
  storeId: string
  rating: number
  comentario?: string
  userId: string
  userName?: string
}

export function useReviews(params: UseReviewsParams) {
  const queryClient = useQueryClient()
  
  const query = useQuery({
    queryKey: ["reviews", { storeId: params.storeId }],
    queryFn: async () => {
      const res = await fetch(`/api/reviews?storeId=${params.storeId}`)
      if (!res.ok) throw new Error("Failed to fetch reviews")
      const json = await res.json()
      return json.data as Review[]
    },
    enabled: !!params.storeId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // 🔴 REALTIME: Ouvir mudanças em reviews
  useEffect(() => {
    if (!params.storeId) return
    
    const channel = createRealtimeSubscription('reviews', () => {
      console.log('🔄 Avaliações atualizadas - refetch')
      queryClient.invalidateQueries({ queryKey: ["reviews", { storeId: params.storeId }] })
    })
    
    return () => {
      channel.unsubscribe()
    }
  }, [params.storeId, queryClient])

  return query
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateReviewData) => {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error("Failed to create review")
      return res.json()
    },
    onSuccess: (data) => {
      // Invalidar queries de reviews para esta loja
      queryClient.invalidateQueries({ 
        queryKey: ["reviews", { storeId: data.data.storeId }] 
      })
    }
  })
}
