"use client"

import { ProductCardAdaptive } from "@/components/explorar/product-card-adaptive"
import { Button } from "@/components/ui/button"
import { TypographyH3, TypographyH4, TypographySmall, TypographyMuted } from "@/components/ui/typography"
import { Search, ArrowLeft, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface CategoriaDesktopProps {
  categoriaNome: string
  searchTerm: string
  setSearchTerm: (value: string) => void
  filteredProducts: any[]
}

export function CategoriaDesktop({ 
  categoriaNome, 
  searchTerm, 
  setSearchTerm, 
  filteredProducts 
}: CategoriaDesktopProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-8">
      <div className="container mx-auto max-w-[1400px] px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/explorar">
            <Button variant="outline" size="sm" className="rounded-xl font-montserrat">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <TypographyH3 className="font-montserrat">{categoriaNome}</TypographyH3>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder={`Buscar em ${categoriaNome}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-blue-500 font-montserrat"
          />
        </div>

        {/* Results */}
        <div className="mb-4">
          <TypographySmall className="text-gray-600 font-montserrat">
            {filteredProducts.length} produtos encontrados
          </TypographySmall>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <TypographyH3 className="mb-2 font-montserrat">Nenhum produto encontrado</TypographyH3>
            <TypographyMuted className="text-gray-600 mb-6 font-montserrat">Tente buscar por outros termos</TypographyMuted>
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="font-montserrat"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Limpar busca
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <ProductCardAdaptive key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

