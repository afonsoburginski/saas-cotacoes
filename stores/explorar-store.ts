import { create } from 'zustand'

interface ExplorarState {
  activeTab: 'produtos' | 'lojas'
  supplierSearch: string
  setActiveTab: (tab: 'produtos' | 'lojas') => void
  setSupplierSearch: (search: string) => void
  clearSupplierSearch: () => void
}

export const useExplorarStore = create<ExplorarState>((set) => ({
  activeTab: 'produtos',
  supplierSearch: '',
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSupplierSearch: (search) => set({ supplierSearch: search }),
  clearSupplierSearch: () => set({ supplierSearch: '' }),
}))

