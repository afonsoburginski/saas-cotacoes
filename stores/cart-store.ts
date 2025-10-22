import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Product, Service, CartItem } from '@/lib/types'

export type { CartItem }

interface CartState {
  cartItems: CartItem[]
  recentlyAdded: string | null
  addToCart: (item: Product | Service, qty?: number) => void
  addServiceToCart: (service: Service, qty?: number) => void
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

      addToCart: (item: Product | Service, qty = 1) => {
        set((state) => {
          // Determinar se é produto ou serviço
          const isService = 'tipoPrecificacao' in item
          const itemId = isService ? item.id : item.id
          
          const existingItem = state.cartItems.find((cartItem) => 
            isService 
              ? cartItem.serviceId === item.id
              : cartItem.productId === item.id
          )
          
          if (existingItem) {
            return {
              cartItems: state.cartItems.map((cartItem) =>
                (isService ? cartItem.serviceId === item.id : cartItem.productId === item.id) 
                  ? { ...cartItem, qty: cartItem.qty + qty } 
                  : cartItem
              ),
            }
          }
          
          const cartItem: CartItem = {
            id: `cart-${Date.now()}-${item.id}`,
            storeId: item.storeId,
            qty,
            productNome: item.nome,
            storeNome: item.storeNome,
            precoUnit: item.preco,
            imagemUrl: item.imagemUrl,
            tipo: isService ? 'service' : 'product',
            ...(isService 
              ? { serviceId: item.id, productId: undefined }
              : { productId: item.id, serviceId: undefined }
            ),
          }
          
          return {
            cartItems: [...state.cartItems, cartItem],
          }
        })
        
        // Trigger animation
        set({ recentlyAdded: item.id })
        setTimeout(() => set({ recentlyAdded: null }), 2000)
      },

      addServiceToCart: (service: Service, qty = 1) => {
        // Função específica para serviços (mantida para compatibilidade)
        get().addToCart(service, qty)
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

