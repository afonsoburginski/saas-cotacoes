import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Cliente browser do Supabase para realtime
export const createClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase não configurado - Realtime desabilitado')
    return null
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Helper para criar subscription realtime
export function createRealtimeSubscription(
  table: string,
  callback: (payload?: any) => void
) {
  const supabase = createClient()
  
  if (!supabase) {
    console.warn(`⚠️ Supabase não configurado - Realtime desabilitado para ${table}`)
    return { unsubscribe: () => {} }
  }
  
  const channel = supabase
    .channel(`realtime-${table}`)
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: table
      },
      (payload: any) => {
        console.log(`🔄 Realtime: ${table} changed`, payload)
        callback(payload)
      }
    )
    .subscribe()

  return channel
}

