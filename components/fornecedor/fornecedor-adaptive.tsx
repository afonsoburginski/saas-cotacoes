"use client"

import { FornecedorMobile } from "./mobile/fornecedor"
import { FornecedorDesktop } from "./desktop/fornecedor"
import type { Store } from "@/lib/types"

interface FornecedorAdaptiveProps {
  store: Store
  storeProducts: any[]
}

export function FornecedorAdaptive({ store, storeProducts }: FornecedorAdaptiveProps) {
  return (
    <>
      {/* Mobile version */}
      <div className="block md:hidden">
        <FornecedorMobile store={store} storeProducts={storeProducts} />
      </div>
      
      {/* Desktop version */}
      <div className="hidden md:block">
        <FornecedorDesktop store={store} storeProducts={storeProducts} />
      </div>
    </>
  )
}
