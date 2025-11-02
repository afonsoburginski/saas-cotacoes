import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface StoreData {
  slug: string | null
  storeName: string | null
  id: number | null
  logo: string | null
  coverImage: string | null
  lastFetched: number | null
}

interface StoreDataState {
  // Estado
  storeData: StoreData | null
  isFetching: boolean
  
  // Ações
  setStoreData: (data: StoreData) => void
  clearStoreData: () => void
  setIsFetching: (fetching: boolean) => void
  
  // Helper para verificar se precisa refetch (cache de 5 minutos)
  shouldRefetch: () => boolean
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export const useStoreDataStore = create<StoreDataState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      storeData: null,
      isFetching: false,
      
      // Ações
      setStoreData: (data) => set({ 
        storeData: {
          ...data,
          lastFetched: Date.now()
        }
      }),
      
      clearStoreData: () => set({ 
        storeData: null,
        isFetching: false 
      }),
      
      setIsFetching: (fetching) => set({ isFetching: fetching }),
      
      // Helper para verificar se precisa refetch
      shouldRefetch: () => {
        const { storeData } = get()
        if (!storeData || !storeData.lastFetched) return true
        
        const now = Date.now()
        const elapsed = now - storeData.lastFetched
        return elapsed > CACHE_DURATION
      },
    }),
    {
      name: 'store-data-storage', // Nome da chave no localStorage
      partialize: (state) => ({ 
        storeData: state.storeData,
      }), // Persistir apenas storeData
    }
  )
)

