"use client"

import { useState, useMemo } from "react"
import { CategoriaMobile } from "./mobile/categoria"
import { CategoriaDesktop } from "./desktop/categoria"
import { useProducts } from "@/hooks/use-products"
import { useDebounce } from "@/hooks/use-debounce"

interface CategoriaAdaptiveProps {
  categoriaNome: string
}

export function CategoriaAdaptive({ categoriaNome }: CategoriaAdaptiveProps) {
  const [searchTerm, setSearchTerm] = useState("")
  
  // Debounce search
  const debouncedSearch = useDebounce(searchTerm)

  const { data: productsData, isLoading } = useProducts({ categoria: categoriaNome })
  const products = productsData?.data || []

  const filteredProducts = useMemo(() => {
    if (!products.length) return []
    
    return products.filter((product) => {
      if (debouncedSearch && !product.nome.toLowerCase().includes(debouncedSearch.toLowerCase())) {
        return false
      }
      return true
    })
  }, [products, debouncedSearch])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052FF] mx-auto mb-4"></div>
          <p className="text-gray-600 font-montserrat">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile version */}
      <div className="block md:hidden">
        <CategoriaMobile 
          categoriaNome={categoriaNome}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredProducts={filteredProducts}
        />
      </div>
      
      {/* Desktop version */}
      <div className="hidden md:block">
        <CategoriaDesktop 
          categoriaNome={categoriaNome}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredProducts={filteredProducts}
        />
      </div>
    </>
  )
}

