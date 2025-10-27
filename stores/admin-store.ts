import { create } from "zustand"

interface AdminStats {
  totalUsers: number
  totalStores: number
  totalOrders: number
  totalRevenue: number
  storesByStatus?: Array<{ status: string; count: number }>
  storesByPlan?: Array<{ plano: string; count: number }>
}

interface Store {
  id: number
  userId?: string
  slug: string
  nome: string
  email?: string
  telefone?: string
  cnpj?: string
  endereco?: string
  cep?: string
  rua?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  descricao?: string
  logo?: string | null
  coverImage?: string | null
  horarioFuncionamento?: string
  status: string
  plano: string
  priorityScore?: number
  shippingPolicy?: any
  address?: any
  features?: string[]
  totalProducts?: number
  totalServices?: number
  totalSales?: number | string
  rating?: number | string
  totalReviews?: number
  createdAt: string
  updatedAt: string
}

interface AdminStore {
  // Stats
  stats: AdminStats | null
  setStats: (stats: AdminStats) => void
  
  // Stores
  stores: Store[]
  setStores: (stores: Store[]) => void
  addStore: (store: Store) => void
  updateStore: (storeId: number, store: Partial<Store>) => void
  removeStore: (storeId: number) => void
  
  // Realtime subscription
  subscription: any
  setSubscription: (sub: any) => void
  cleanup: () => void
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  // Initial state
  stats: null,
  stores: [],
  subscription: null,
  
  // Actions
  setStats: (stats) => set({ stats }),
  
  setStores: (stores) => set({ stores }),
  
  addStore: (store) => set((state) => ({
    stores: [store, ...state.stores]
  })),
  
  updateStore: (storeId, updates) => set((state) => ({
    stores: state.stores.map(s => 
      s.id === storeId ? { ...s, ...updates } : s
    )
  })),
  
  removeStore: (storeId) => set((state) => ({
    stores: state.stores.filter(s => s.id !== storeId)
  })),
  
  setSubscription: (sub) => set({ subscription: sub }),
  
  cleanup: () => {
    const state = get()
    if (state.subscription) {
      state.subscription.unsubscribe()
      set({ subscription: null })
    }
  },
}))

