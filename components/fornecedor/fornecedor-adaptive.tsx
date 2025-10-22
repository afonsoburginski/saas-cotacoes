"use client"

import { FornecedorMobile } from "./mobile/fornecedor"
import { FornecedorDesktop } from "./desktop/fornecedor"
import type { Store } from "@/lib/types"

interface FornecedorAdaptiveProps {
  store: Store
  storeProducts: any[]
  storeServices: any[]
}

export function FornecedorAdaptive({ store, storeProducts, storeServices }: FornecedorAdaptiveProps) {
  return (
    <>
      {/* Mobile version */}
      <div className="block md:hidden">
        <FornecedorMobile store={store} storeProducts={storeProducts} storeServices={storeServices} />
      </div>
      
      {/* Desktop version */}
      <div className="hidden md:block">
        <FornecedorDesktop store={store} storeProducts={storeProducts} storeServices={storeServices} />
      </div>
    </>
  )
}
