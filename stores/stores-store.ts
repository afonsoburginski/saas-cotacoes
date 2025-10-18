import { create } from "zustand"
import type { Store } from "@/lib/types"

interface StoresState {
  stores: Store[]
  setStores: (stores: Store[]) => void
  addStore: (store: Store) => void
  updateStore: (id: string, updates: Partial<Store>) => void
  removeStore: (id: string) => void
}

export const useStoresStore = create<StoresState>((set) => ({
  stores: [],
  setStores: (stores) => set({ stores }),
  addStore: (store) => set((state) => ({ 
    stores: [...state.stores, store] 
  })),
  updateStore: (id, updates) => set((state) => ({
    stores: state.stores.map((s) => 
      s.id === id ? { ...s, ...updates } : s
    ),
  })),
  removeStore: (id) => set((state) => ({
    stores: state.stores.filter((s) => s.id !== id),
  })),
}))

