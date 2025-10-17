"use client"

import { ProductCardAdaptive } from "@/components/explorar/product-card-adaptive"
import { Button } from "@/components/ui/button"
import { TypographyH3, TypographyH4, TypographySmall, TypographyMuted } from "@/components/ui/typography"
import { Search, ArrowLeft, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface CategoriaMobileProps {
  categoriaNome: string
  searchTerm: string
  setSearchTerm: (value: string) => void
  filteredProducts: any[]
}

export function CategoriaMobile({ 
  categoriaNome, 
  searchTerm, 
  setSearchTerm, 
  filteredProducts 
}: CategoriaMobileProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header Section */}
      <div className="bg-[#0052FF] relative overflow-hidden">
        {/* Texture overlay */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'url(/texture.png)',
            backgroundSize: '150px 150px',
            backgroundRepeat: 'repeat',
            mixBlendMode: 'overlay'
          }}
        />
        <div className="px-4 pt-2 pb-4 relative z-10">
          {/* Back Button + Title */}
          <div className="flex items-center gap-3 mb-3">
            <Link href="/explorar">
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-white hover:bg-white/20 rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <TypographyH3 className="text-xl text-white font-montserrat flex-1">{categoriaNome}</TypographyH3>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 z-10" />
            <Input
              placeholder={`Buscar em ${categoriaNome}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 h-12 !bg-white border border-gray-200 rounded-2xl text-base placeholder:text-gray-400 focus:!bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-sm font-montserrat"
            />
          </div>
          
          {/* Description */}
          <div className="text-center">
            <TypographyMuted className="text-sm text-white/80 font-montserrat">
              {filteredProducts.length} produtos encontrados
            </TypographyMuted>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 py-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <TypographyH4 className="mb-2 font-montserrat">Nenhum produto encontrado</TypographyH4>
            <TypographyMuted className="mb-6 font-montserrat">Tente buscar por outros termos</TypographyMuted>
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="rounded-xl font-montserrat"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Limpar busca
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <ProductCardAdaptive key={product.id} product={product} alwaysShowButtons={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

