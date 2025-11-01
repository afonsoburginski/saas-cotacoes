"use client"

import { useEffect, useState } from "react"
import { useAdminStore } from "@/stores/admin-store"
import { createBrowserClient } from "@supabase/ssr"

export function useAdminRealtime() {
  const adminStore = useAdminStore()
  
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Fetch initial data
    async function fetchInitialData() {
      try {
        setIsLoading(true)
        
        // 1) Buscar stores da API (com JOIN de publicidades)
        const storesResponse = await fetch('/api/admin/stores')
        if (!storesResponse.ok) {
          console.error('⚠️ Erro ao buscar stores da API')
          adminStore.setStores([])
        } else {
          const storesData = await storesResponse.json()
          const stores = storesData.data || []
          
          // 2) Buscar business_type dos usuários relacionados em background (não bloqueia render)
          const userIds = Array.from(new Set(stores.map((s: any) => s.user_id || s.userId).filter(Boolean))) as string[]
          adminStore.setStores(stores as any)
          if (userIds.length > 0) {
            ;(async () => {
              try {
                const { data: usersData, error: usersError } = await supabase
                  .from('user')
                  .select('id, business_type')
                  .in('id', userIds)
                if (!usersError && usersData) {
                  const userIdToType = usersData.reduce((acc: Record<string, string | undefined>, u: any) => {
                    acc[u.id] = u.business_type || undefined
                    return acc
                  }, {} as Record<string, string | undefined>)
                  adminStore.setStores((stores as any).map((s: any) => ({
                    ...s,
                    businessType: userIdToType[s.user_id || s.userId] || s.businessType,
                  })))
                }
              } catch (e) {
                console.warn('⚠️ Falha ao buscar users para business_type:', e)
              }
            })()
          }
        }

        // Fetch stats em background
        fetch('/api/admin/stats')
          .then(res => res.json())
          .then(data => adminStore.setStats(data.stats))
          .catch(err => console.error('Error fetching stats:', err))
      } catch (error) {
        console.error('Error fetching initial data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()

    // Setup realtime subscriptions
    const channel = supabase
      .channel('admin-dashboard')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stores',
        },
        async (payload: any) => {
        console.log('New store added:', payload.new)
        // Recarregar stores da API para ter dados de publicidade atualizados
        try {
          const res = await fetch('/api/admin/stores')
          const data = await res.json()
          adminStore.setStores(data.data || [])
          
          // Update stats
          const statsRes = await fetch('/api/admin/stats')
          const statsData = await statsRes.json()
          adminStore.setStats(statsData.stats)
        } catch (err) {
          console.error('Error updating stores:', err)
        }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'stores',
        },
        async (payload: any) => {
          console.log('Store updated:', payload.new)
          // Recarregar stores da API para ter dados de publicidade atualizados
          try {
            const res = await fetch('/api/admin/stores')
            const data = await res.json()
            adminStore.setStores(data.data || [])
            
            // Update stats
            const statsRes = await fetch('/api/admin/stats')
            const statsData = await statsRes.json()
            adminStore.setStats(statsData.stats)
          } catch (err) {
            console.error('Error updating stores:', err)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'stores',
        },
        async (payload: any) => {
          console.log('Store deleted:', payload.old)
          adminStore.removeStore((payload.old as any).id)
          
          // Update stats
          try {
            const res = await fetch('/api/admin/stats')
            const data = await res.json()
            adminStore.setStats(data.stats)
          } catch (err) {
            console.error('Error updating stats:', err)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'store_advertisements',
        },
        async (payload: any) => {
          console.log('Advertisement changed:', payload)
          // Recarregar stores da API para ter dados de publicidade atualizados
          try {
            const res = await fetch('/api/admin/stores')
            const data = await res.json()
            adminStore.setStores(data.data || [])
          } catch (err) {
            console.error('Error updating stores after advertisement change:', err)
          }
        }
      )
      .subscribe()

    adminStore.setSubscription(channel)

    // Cleanup on unmount
    return () => {
      adminStore.cleanup()
    }
  }, [])

  return { stats: adminStore.stats, stores: adminStore.stores, isLoading }
}
