"use client"

import { CarrinhoDesktop } from "./desktop/carrinho"
import { CarrinhoMobile } from "./mobile/carrinho"
import type { CartItem } from "@/stores/cart-store"

interface CarrinhoAdaptiveProps {
  cartItems: CartItem[]
  onUpdateQuantity: (itemId: string, qty: number) => void
  onRemoveItem: (itemId: string) => void
  onClearCart: () => void
  onGeneratePDF: () => void
  onGenerateList: () => void
}

export function CarrinhoAdaptive({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onGeneratePDF,
  onGenerateList
}: CarrinhoAdaptiveProps) {
  return (
    <>
      <div className="block md:hidden">
        <CarrinhoMobile 
          cartItems={cartItems}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onClearCart={onClearCart}
          onGeneratePDF={onGeneratePDF}
          onGenerateList={onGenerateList}
        />
      </div>
      <div className="hidden md:block">
        <CarrinhoDesktop 
          cartItems={cartItems}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onClearCart={onClearCart}
          onGeneratePDF={onGeneratePDF}
          onGenerateList={onGenerateList}
        />
      </div>
    </>
  )
}

