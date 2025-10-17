"use client"

import { useState, useMemo, useEffect } from "react"
import { ProductCardAdaptive } from "@/components/explorar/product-card-adaptive"
import { FiltersBar, type FilterState } from "@/components/features/filters-bar"
import { mockProducts, mockStores } from "@/lib/mock-data"
import { useSmartComparison } from "@/hooks/use-smart-comparison"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TypographyH3, TypographyH4, TypographyP, TypographySmall, TypographyMuted } from "@/components/ui/typography"
import { 
  Search, 
  ShoppingBag, 
  MapPin, 
  Star, 
  Shield, 
  Sparkles
} from "lucide-react"
import { FaArrowRightLong } from "react-icons/fa6"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface ExplorarMobileProps {
  filters: FilterState
  setFilters: (filters: FilterState) => void
  filteredProducts: any[]
  categorias: string[]
  lojas: string[]
}

export function ExplorarMobile({ 
  filters, 
  setFilters, 
  filteredProducts, 
  categorias, 
  lojas 
}: ExplorarMobileProps) {
  const { generateCategoryComparison, isLoading } = useSmartComparison()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("produtos")

  // Listen for supplier modal events from ProductCard
  useEffect(() => {
    const handleOpenSupplierModal = (event: CustomEvent) => {
      const { storeId } = event.detail
      router.push(`/fornecedor/${storeId}`)
    }

    window.addEventListener('openSupplierModal', handleOpenSupplierModal as EventListener)
    
    return () => {
      window.removeEventListener('openSupplierModal', handleOpenSupplierModal as EventListener)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Search Section */}
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
          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 z-10" />
            <Input
              placeholder="Buscar produtos, materiais..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-12 pr-4 h-12 !bg-white border border-gray-200 rounded-2xl text-base placeholder:text-gray-400 focus:!bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-sm font-montserrat"
            />
          </div>
          
          {/* Title and Description */}
          <div className="space-y-1 text-center max-w-[240px] mx-auto">
            <TypographyH4 className="text-lg mb-0 text-white font-montserrat">Melhores orçamentos</TypographyH4>
            <TypographyMuted className="text-sm text-white/80 font-montserrat">Compare preços e peça orçamentos de forma rápida</TypographyMuted>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-transparent justify-start h-auto p-0 gap-0">
            <TabsTrigger 
              value="produtos" 
              className="relative px-4 py-3 text-sm text-gray-600 bg-transparent border-0 rounded-none shadow-none data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none data-[state=active]:font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent data-[state=active]:after:bg-blue-600 flex-1 font-montserrat"
            >
              <Search className="w-4 h-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger 
              value="lojas"
              className="relative px-4 py-3 text-sm text-gray-600 bg-transparent border-0 rounded-none shadow-none data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none data-[state=active]:font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent data-[state=active]:after:bg-blue-600 flex-1 font-montserrat"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Fornecedores
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="produtos" className="mt-0">
            <div className="py-0">
              {/* Results Header */}
              {filteredProducts.length > 0 && (
                <div className="flex items-center justify-between mb-4 px-4">
                  <TypographySmall className="text-gray-500 font-montserrat">
                    {filteredProducts.length} produtos encontrados
                  </TypographySmall>
                  
                  {filters.search && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      "{filters.search.length > 15 ? filters.search.substring(0, 15) + '...' : filters.search}"
                    </Badge>
                  )}
                </div>
              )}

              {/* Products Rows - Netflix Style */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl mx-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <TypographyH4 className="mb-2 font-montserrat">Nenhum produto encontrado</TypographyH4>
                  <TypographyMuted className="mb-6 font-montserrat">Tente buscar por outros termos</TypographyMuted>
                  <Button
                    variant="outline"
                    onClick={() => setFilters({
                      search: "",
                      categoria: "",
                      loja: "",
                      ordenarPor: "prioridade-desc",
                    })}
                    className="rounded-xl"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Limpar busca
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Group products by category - Netflix style rows */}
                  {categorias
                    .filter(categoria => filteredProducts.some(p => p.categoria === categoria))
                    .map((categoria) => {
                      const categoryProducts = filteredProducts.filter(p => p.categoria === categoria)
                      return (
                        <div key={categoria} className="space-y-3">
                          <Link href={`/categoria/${encodeURIComponent(categoria)}`}>
                            <div className="flex items-center justify-between px-4 cursor-pointer active:opacity-70 transition-opacity">
                              <div className="flex items-center gap-2">
                                <TypographyH4 className="text-lg text-gray-700 font-montserrat">{categoria}</TypographyH4>
                                <FaArrowRightLong className="h-5 w-5 text-gray-700" />
                              </div>
                              <TypographySmall className="text-gray-500 font-montserrat">
                                {categoryProducts.length} itens
                              </TypographySmall>
                            </div>
                          </Link>
                          
                          {/* Horizontal Scrollable Row */}
                          <div className="overflow-x-auto scrollbar-hide">
                            <div className="flex gap-3 px-4 pb-2">
                              {categoryProducts.map((product) => (
                                <div key={product.id} className="flex-none w-[45vw]">
                                  <ProductCardAdaptive product={product} alwaysShowButtons={true} />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="lojas" className="mt-0">
            <div className="py-4">
              <div className="flex items-center justify-between mb-4 px-4">
                <TypographyH4 className="font-montserrat">Fornecedores Disponíveis</TypographyH4>
                <Badge variant="outline" className="bg-gray-50">
                  {mockStores.filter(s => s.status === "ativo").length} fornecedores
                </Badge>
              </div>

              {/* Supplier rows with mini product carousel */}
              <div className="space-y-6">
                {mockStores
                  .filter(s => s.status === "ativo")
                  .sort((a, b) => b.priorityScore - a.priorityScore)
                  .map((store) => {
                    const storeProducts = mockProducts
                      .filter(p => p.storeId === store.id)
                      .slice(0, 6) // show a few products like a preview

                    return (
                      <div key={store.id} className="">
                        {/* Supplier Row */}
                        <div className="px-4">
                          <Card 
                            className="p-4 bg-white border-0 shadow-sm rounded-2xl active:scale-[0.98] transition-all duration-200 cursor-pointer"
                            onClick={() => router.push(`/fornecedor/${store.id}`)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12 rounded-xl">
                                <AvatarFallback className="bg-blue-500 text-white font-semibold rounded-xl">
                                  {store.nome.charAt(0)}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <TypographySmall className="font-semibold truncate font-montserrat">@{store.nome}</TypographySmall>
                                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs shrink-0 font-montserrat">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Verificado
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-3 text-sm text-gray-600 font-montserrat">
                                  <div className="flex items-center gap-1 shrink-0">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium">4.8</span>
                                    <span className="text-xs">(127)</span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <MapPin className="h-3 w-3" />
                                    <span className="text-xs truncate">2.5 km</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <TypographySmall className="font-medium font-montserrat">{storeProducts.length}</TypographySmall>
                                <TypographyMuted className="text-xs font-montserrat">itens</TypographyMuted>
                              </div>
                            </div>
                          </Card>
                        </div>

                        {/* Separator */}
                        <div className="px-4">
                          <div className="h-3" />
                          <div className="border-t border-gray-100" />
                        </div>

                        {/* Products mini-row (horizontal scroll) */}
                        {storeProducts.length > 0 && (
                          <div className="overflow-x-auto scrollbar-hide">
                            <div className="flex gap-3 px-4 pb-2">
                              {storeProducts.map((product) => (
                                <div key={product.id} className="flex-none w-[45vw]">
                                  <ProductCardAdaptive product={product} alwaysShowButtons={true} />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
