"use client"

import { useState, useMemo } from "react"
import { CategoriaMobile } from "./mobile/categoria"
import { CategoriaDesktop } from "./desktop/categoria"
import { mockProducts } from "@/lib/mock-data"

interface CategoriaAdaptiveProps {
  categoriaNome: string
}

export function CategoriaAdaptive({ categoriaNome }: CategoriaAdaptiveProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      if (!product.ativo) return false
      if (product.categoria !== categoriaNome) return false
      
      if (searchTerm && !product.nome.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      return true
    })
  }, [categoriaNome, searchTerm])

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

