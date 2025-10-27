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
    
    let timeoutId: NodeJS.Timeout
    
    // Fetch initial data
    async function fetchInitialData() {
      try {
        setIsLoading(true)
        
        // Timeout de 2 segundos - não espera mais que isso
        timeoutId = setTimeout(() => {
          setIsLoading(false)
        }, 2000)
        
        // Fetch stores
        const { data: stores, error: storesError } = await supabase
          .from('stores')
          .select('*')
          .order('created_at', { ascending: false })

        if (storesError) throw storesError

        adminStore.setStores(stores || [])

        // Fetch stats em background
        fetch('/api/admin/stats')
          .then(res => res.json())
          .then(data => adminStore.setStats(data.stats))
          .catch(err => console.error('Error fetching stats:', err))
      } catch (error) {
        console.error('Error fetching initial data:', error)
      } finally {
        clearTimeout(timeoutId)
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
        adminStore.addStore(payload.new as any)
          
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
          event: 'UPDATE',
          schema: 'public',
          table: 'stores',
        },
        async (payload: any) => {
          console.log('Store updated:', payload.new)
          adminStore.updateStore((payload.new as any).id, payload.new as any)
          
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
      .subscribe()

    adminStore.setSubscription(channel)

    // Cleanup on unmount
    return () => {
      adminStore.cleanup()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  return { stats: adminStore.stats, stores: adminStore.stores, isLoading }
}
