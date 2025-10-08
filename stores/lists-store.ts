import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { PurchaseList, CartItem } from '@/lib/types'
import { mockPurchaseLists } from '@/lib/mock-data'

interface ListsState {
  lists: PurchaseList[]
  createList: (nome: string, items: CartItem[], observacoes?: string) => void
  deleteList: (listId: string) => void
  duplicateList: (listId: string) => void
}

export const useListsStore = create<ListsState>()(
  persist(
    (set, get) => ({
      lists: mockPurchaseLists,

      createList: (nome: string, items: CartItem[], observacoes = '') => {
        console.log('🚀 [Zustand] Criando lista:', nome, 'com', items.length, 'itens')
        
        const totalEstimado = items.reduce((total, item) => total + item.precoUnit * item.qty, 0)

        const newList: PurchaseList = {
          id: `list-${Date.now()}`,
          nome,
          createdAt: new Date().toISOString().split('T')[0],
          items,
          observacoes,
          totalEstimado,
        }

        set((state) => ({
          lists: [newList, ...state.lists],
        }))
        
        console.log('✅ [Zustand] Lista criada:', newList.nome, 'Total de listas:', get().lists.length)
      },

      deleteList: (listId: string) => {
        set((state) => ({
          lists: state.lists.filter((list) => list.id !== listId),
        }))
      },

      duplicateList: (listId: string) => {
        const listToDuplicate = get().lists.find((list) => list.id === listId)
        if (!listToDuplicate) return

        const duplicatedList: PurchaseList = {
          ...listToDuplicate,
          id: `list-${Date.now()}`,
          nome: `${listToDuplicate.nome} (Cópia)`,
          createdAt: new Date().toISOString().split('T')[0],
        }

        set((state) => ({
          lists: [duplicatedList, ...state.lists],
        }))
      },
    }),
    {
      name: 'lists-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

