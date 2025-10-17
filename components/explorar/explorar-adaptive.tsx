"use client"

import { useState, useMemo, useEffect } from "react"
import { ExplorarMobile } from "./mobile/explorar"
import { ExplorarDesktop } from "./desktop/explorar"
import { type FilterState } from "@/components/features/filters-bar"
import { mockProducts, mockStores } from "@/lib/mock-data"

export function ExplorarAdaptive() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    categoria: "",
    loja: "",
    ordenarPor: "prioridade-desc",
  })

  const categorias = useMemo(() => {
    return Array.from(new Set(mockProducts.map((p) => p.categoria))).sort()
  }, [])

  const lojas = useMemo(() => {
    return Array.from(new Set(mockProducts.map((p) => p.storeNome))).sort()
  }, [])

  const filteredProducts = useMemo(() => {
    const filtered = mockProducts.filter((product) => {
      if (!product.ativo) return false

      if (filters.search && !product.nome.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }

      if (filters.categoria && product.categoria !== filters.categoria) {
        return false
      }

      if (filters.loja && product.storeNome !== filters.loja) {
        return false
      }

      return true
    })

    // Apply sorting with priority consideration
    filtered.sort((a, b) => {
      // SEMPRE priorizar produtos com imagens reais (do mock) antes de qualquer ordenação
      const hasRealImageA = a.imagemUrl?.startsWith('/mock/') || false
      const hasRealImageB = b.imagemUrl?.startsWith('/mock/') || false
      
      if (hasRealImageA && !hasRealImageB) return -1
      if (!hasRealImageA && hasRealImageB) return 1
      
      // Se ambos têm imagens reais ou ambos não têm, aplica a ordenação selecionada
      const storeA = mockStores.find((s) => s.id === a.storeId)
      const storeB = mockStores.find((s) => s.id === b.storeId)

      switch (filters.ordenarPor) {
        case "rating-desc":
          return b.rating - a.rating
        case "prioridade-desc":
        default:
          return (storeB?.priorityScore || 0) - (storeA?.priorityScore || 0)
      }
    })

    return filtered
  }, [filters])

  return (
    <>
      {/* Mobile version */}
      <div className="block md:hidden">
        <ExplorarMobile 
          filters={filters}
          setFilters={setFilters}
          filteredProducts={filteredProducts}
          categorias={categorias}
          lojas={lojas}
        />
      </div>
      
      {/* Desktop version */}
      <div className="hidden md:block">
        <ExplorarDesktop 
          filters={filters}
          setFilters={setFilters}
          filteredProducts={filteredProducts}
          categorias={categorias}
          lojas={lojas}
        />
      </div>
    </>
  )
}
