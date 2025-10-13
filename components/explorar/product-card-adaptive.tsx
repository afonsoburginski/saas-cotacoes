"use client"

import { ProductCardMobile } from "./mobile/product-card"
import { ProductCardDesktop } from "./desktop/product-card"
import type { Product } from "@/lib/types"

interface ProductCardAdaptiveProps {
  product: Product
  alwaysShowButtons?: boolean
}

export function ProductCardAdaptive({ product, alwaysShowButtons = false }: ProductCardAdaptiveProps) {
  // Se alwaysShowButtons for true, usa o layout mobile em ambas as versões
  if (alwaysShowButtons) {
    return <ProductCardMobile product={product} />
  }

  return (
    <>
      {/* Mobile version - botões sempre visíveis */}
      <div className="block md:hidden">
        <ProductCardMobile product={product} />
      </div>
      
      {/* Desktop version - botões aparecem no hover */}
      <div className="hidden md:block">
        <ProductCardDesktop product={product} />
      </div>
    </>
  )
}

