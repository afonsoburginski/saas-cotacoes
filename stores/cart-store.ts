import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Product, CartItem } from '@/lib/types'

export type { CartItem }

interface CartState {
  cartItems: CartItem[]
  recentlyAdded: string | null
  addToCart: (product: Product, qty?: number) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, qty: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartItemsCount: () => number
  setRecentlyAdded: (productId: string | null) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      recentlyAdded: null,

      addToCart: (product: Product, qty = 1) => {
        set((state) => {
          const existingItem = state.cartItems.find((item) => item.productId === product.id)
          
          if (existingItem) {
            return {
              cartItems: state.cartItems.map((item) =>
                item.productId === product.id ? { ...item, qty: item.qty + qty } : item
              ),
            }
          }
          
          return {
            cartItems: [
              ...state.cartItems,
              {
                id: `cart-${Date.now()}-${product.id}`,
                productId: product.id,
                storeId: product.storeId,
                qty,
                productNome: product.nome,
                storeNome: product.storeNome,
                precoUnit: product.preco,
                imagemUrl: product.imagemUrl,
              },
            ],
          }
        })
        
        // Trigger animation
        set({ recentlyAdded: product.id })
        setTimeout(() => set({ recentlyAdded: null }), 2000)
      },

      removeFromCart: (itemId: string) => {
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== itemId),
        }))
      },

      updateQuantity: (itemId: string, qty: number) => {
        if (qty <= 0) {
          get().removeFromCart(itemId)
          return
        }
        
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === itemId ? { ...item, qty } : item
          ),
        }))
      },

      clearCart: () => {
        set({ cartItems: [] })
      },

      getCartTotal: () => {
        return get().cartItems.reduce((total, item) => total + item.precoUnit * item.qty, 0)
      },

      getCartItemsCount: () => {
        return get().cartItems.reduce((count, item) => count + item.qty, 0)
      },

      setRecentlyAdded: (productId: string | null) => {
        set({ recentlyAdded: productId })
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

