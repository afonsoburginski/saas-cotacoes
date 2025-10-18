"use client"

import { useState, useMemo, memo } from "react"
import { ExplorarMobile } from "./mobile/explorar"
import { ExplorarDesktop } from "./desktop/explorar"
import { type FilterState } from "@/components/features/filters-bar"
import { useProducts } from "@/hooks/use-products"
import { useStores } from "@/hooks/use-stores"
import { useCategories } from "@/hooks/use-categories"
import { useDebounce } from "@/hooks/use-debounce"

const ExplorarAdaptive = memo(function ExplorarAdaptive() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    categoria: "",
    loja: "",
    ordenarPor: "prioridade-desc",
  })

  // Debounce search to avoid too many API calls - mais rápido para melhor UX
  const debouncedSearch = useDebounce(filters.search)

  // Fetch data with React Query
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    search: debouncedSearch || undefined,
    categoria: filters.categoria || undefined,
    loja: filters.loja || undefined,
  })

  const { data: storesData, isLoading: isLoadingStores } = useStores({ status: "ativo" })
  const { data: categoriesData } = useCategories()

  const products = productsData?.data || []
  const stores = storesData?.data || []
  const categorias = categoriesData?.data || []
  const lojas = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.storeNome))).sort()
  }, [products])

  const filteredProducts = useMemo(() => {
    if (!products.length) return []
    
    const filtered = [...products]

    // Apply sorting with priority consideration
    filtered.sort((a, b) => {
      // SEMPRE priorizar produtos com imagens reais (do mock) antes de qualquer ordenação
      const hasRealImageA = a.imagemUrl?.startsWith('/mock/') || false
      const hasRealImageB = b.imagemUrl?.startsWith('/mock/') || false
      
      if (hasRealImageA && !hasRealImageB) return -1
      if (!hasRealImageA && hasRealImageB) return 1
      
      // Se ambos têm imagens reais ou ambos não têm, aplica a ordenação selecionada
      const storeA = stores.find((s) => s.id === a.storeId)
      const storeB = stores.find((s) => s.id === b.storeId)

      switch (filters.ordenarPor) {
        case "rating-desc":
          return b.rating - a.rating
        case "prioridade-desc":
        default:
          return (storeB?.priorityScore || 0) - (storeA?.priorityScore || 0)
      }
    })

    return filtered
  }, [products, stores, filters.ordenarPor])

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
          stores={stores}
          isLoading={isLoadingProducts || isLoadingStores}
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
          stores={stores}
          isLoading={isLoadingProducts || isLoadingStores}
        />
      </div>
    </>
  )
})

export { ExplorarAdaptive }
