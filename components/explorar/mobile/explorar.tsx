"use client"

import { useState, useMemo, useEffect, useCallback, memo } from "react"

// Fisher-Yates shuffle algorithm para randomizar arrays
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
import { ProductCardAdaptive } from "@/components/explorar/product-card-adaptive"
import { FiltersBar, type FilterState } from "@/components/features/filters-bar"
import { useSmartComparison } from "@/hooks/use-smart-comparison"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TypographyH3, TypographyH4, TypographyP, TypographySmall, TypographyMuted } from "@/components/ui/typography"
import { ProductRowsSkeleton } from "./product-rows-skeleton"
import { SuppliersSkeleton } from "./suppliers-skeleton"
import { VirtualizedProductList } from "../virtualized-product-list"
import { useExplorarStore } from "@/stores/explorar-store"
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
import { OptimizedSearchInput } from "@/components/ui/optimized-search-input"
import Link from "next/link"

interface ExplorarMobileProps {
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  filteredProducts: any[]
  categorias: string[]
  lojas: string[]
  stores: any[]
  isLoading?: boolean
}

const ExplorarMobile = memo(function ExplorarMobile({ 
  filters, 
  setFilters, 
  filteredProducts, 
  categorias, 
  lojas,
  stores,
  isLoading: isLoadingData = false
}: ExplorarMobileProps) {
  const { generateCategoryComparison, isLoading } = useSmartComparison()
  const router = useRouter()
  
  // Use Zustand para compartilhar estado com desktop
  const { activeTab, supplierSearch, setActiveTab, setSupplierSearch } = useExplorarStore()
  
  // Random seed que muda a cada mount para forçar re-shuffle
  const [shuffleSeed] = useState(() => Math.random())

  // Listen for supplier modal events from ProductCard - memoized
  const handleOpenSupplierModal = useCallback((event: CustomEvent) => {
    const { storeId } = event.detail
    router.push(`/fornecedor/${storeId}`)
  }, [router])

  useEffect(() => {
    window.addEventListener('openSupplierModal', handleOpenSupplierModal as EventListener)
    
    return () => {
      window.removeEventListener('openSupplierModal', handleOpenSupplierModal as EventListener)
    }
  }, [handleOpenSupplierModal])

  // Group products by category for Netflix-style rows - memoized with shuffle
  const productsByCategory = useMemo(() => {
    if (!filteredProducts.length) return {}
    
    const grouped: { [key: string]: any[] } = {}
    
    // First group products
    filteredProducts.forEach(product => {
      if (!grouped[product.categoria]) {
        grouped[product.categoria] = []
      }
      grouped[product.categoria].push(product)
    })
    
    // Shuffle products within each category for variety
    // Using shuffleSeed to force re-shuffle on mount
    const seededRandom = shuffleSeed
    Object.keys(grouped).forEach(categoria => {
      grouped[categoria] = shuffleArray(grouped[categoria])
    })
    
    return grouped
  }, [filteredProducts, shuffleSeed])

  // Memoized handlers for better performance
  const handleSearchChange = useCallback((value: string) => {
    if (activeTab === "produtos") {
      setFilters(prev => ({ ...prev, search: value }))
    } else {
      setSupplierSearch(value)
    }
  }, [activeTab, setFilters, setSupplierSearch])

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as 'produtos' | 'lojas')
    // Limpa os filtros ao mudar de tab
    if (value === "produtos") {
      setSupplierSearch("")
    } else {
      setFilters(prev => ({ ...prev, search: "" }))
    }
  }, [setFilters, setActiveTab, setSupplierSearch])

  // Filtrar FORNECEDORES (comercio) baseado na busca
  const filteredFornecedores = useMemo(() => {
    let filtered
    if (!supplierSearch) {
      filtered = stores.filter(s => s.status === "active" && s.businessType === "comercio")
    } else {
      const searchLower = supplierSearch.toLowerCase()
      filtered = stores.filter(s => 
        s.status === "active" && 
        s.businessType === "comercio" &&
        (s.nome.toLowerCase().includes(searchLower) || 
         s.cidade?.toLowerCase().includes(searchLower))
      )
    }
    return shuffleArray(filtered)
  }, [stores, supplierSearch, shuffleSeed])

  // Filtrar PRESTADORES (servico) baseado na busca
  const filteredPrestadores = useMemo(() => {
    let filtered
    if (!supplierSearch) {
      filtered = stores.filter(s => s.status === "active" && s.businessType === "servico")
    } else {
      const searchLower = supplierSearch.toLowerCase()
      filtered = stores.filter(s => 
        s.status === "active" && 
        s.businessType === "servico" &&
        (s.nome.toLowerCase().includes(searchLower) || 
         s.cidade?.toLowerCase().includes(searchLower))
      )
    }
    return shuffleArray(filtered)
  }, [stores, supplierSearch, shuffleSeed])

  // Total combinado para exibir
  const totalStores = filteredFornecedores.length + filteredPrestadores.length

  // Placeholder e value dinâmicos baseados na tab ativa
  const searchPlaceholder = activeTab === "produtos" 
    ? "Buscar produtos, materiais..." 
    : "Buscar fornecedores, empresas..."
  
  const searchValue = activeTab === "produtos" ? filters.search : supplierSearch

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
            <OptimizedSearchInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearchChange}
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
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
              {/* Show skeleton while loading */}
              {isLoadingData ? (
                <div className="py-4">
                  <ProductRowsSkeleton />
                </div>
              ) : (
                <>
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
                            <VirtualizedProductList 
                              products={categoryProducts} 
                              alwaysShowButtons={true}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
                </>
              )}
            </div>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="lojas" className="mt-0">
            <div className="py-4">
              {isLoadingData ? (
                <SuppliersSkeleton />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4 px-4">
                    <TypographyH4 className="font-montserrat">Marketplace</TypographyH4>
                    <Badge variant="outline" className="bg-gray-50">
                      {totalStores} empresas
                    </Badge>
                  </div>

                  {/* Empty state */}
                  {totalStores === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl mx-4">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <TypographyH4 className="mb-2 font-montserrat">Nenhuma empresa encontrada</TypographyH4>
                      <TypographyMuted className="font-montserrat">Tente buscar por outro termo</TypographyMuted>
                    </div>
                  ) : (
                    <>
                      {/* SEÇÃO 1: FORNECEDORES (comercio) */}
                      {filteredFornecedores.length > 0 && (
                        <div className="space-y-4 mb-8">
                          <div className="flex items-center gap-2 px-4">
                            <TypographyH4 className="font-montserrat">Fornecedores</TypographyH4>
                            <Badge variant="outline" className="bg-gray-50">{filteredFornecedores.length}</Badge>
                          </div>
                          <div className="space-y-6">
                            {filteredFornecedores.map((store) => {
                    const storeProducts = shuffleArray(
                      filteredProducts.filter(p => p.storeId === store.id)
                    ).slice(0, 6)

                    return (
                      <div key={`store-${store.id}`} className="">
                        {/* Supplier Row (no card) */}
                        <div 
                          className="px-4 py-3 active:opacity-70 transition-opacity cursor-pointer bg-gray-50"
                          onClick={() => router.push(`/fornecedor/${store.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 rounded-full">
                              <AvatarFallback className="bg-blue-500 text-white font-semibold rounded-full">
                                {store.nome.charAt(0)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <TypographySmall className="font-semibold truncate font-montserrat">@{store.nome}</TypographySmall>
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
                          </div>
                          {/* Separator between supplier and product cards */}
                          <div className="mt-3 mb-3 px-4">
                            <div className="border-t border-gray-200 w-full" />
                          </div>
                        </div>

                        {/* Products mini-row (horizontal scroll) */}
                        {storeProducts.length > 0 && (
                          <div className="overflow-x-auto scrollbar-hide">
                            <VirtualizedProductList 
                              products={storeProducts} 
                              alwaysShowButtons={true}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                          </div>
                        </div>
                      )}

                      {/* SEÇÃO 2: PRESTADORES DE SERVIÇOS (servico) */}
                      {filteredPrestadores.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 px-4">
                            <TypographyH4 className="font-montserrat">Prestadores de Serviços</TypographyH4>
                            <Badge variant="outline" className="bg-gray-50">{filteredPrestadores.length}</Badge>
                          </div>
                          <div className="space-y-6">
                            {filteredPrestadores.map((store) => {
                    const storeProducts = shuffleArray(
                      filteredProducts.filter(p => p.storeId === store.id)
                    ).slice(0, 6)

                    return (
                      <div key={`store-${store.id}`} className="">
                        {/* Supplier Row (no card) */}
                        <div 
                          className="px-4 py-3 active:opacity-70 transition-opacity cursor-pointer bg-gray-50"
                          onClick={() => router.push(`/fornecedor/${store.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 rounded-full">
                              <AvatarFallback className="bg-blue-500 text-white font-semibold rounded-full">
                                {store.nome.charAt(0)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              
                              <div className="flex items-center gap-2 mb-1">
                                <TypographySmall className="font-semibold truncate font-montserrat">@{store.nome}</TypographySmall>
                                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs shrink-0">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Verificado
                                </Badge>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-gray-600 font-montserrat">
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span>4.8</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">2.5 km</span>
                                </div>
                              </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 w-full" />
                          </div>
                        </div>

                        {/* Products mini-row (horizontal scroll) */}
                        {storeProducts.length > 0 && (
                          <div className="overflow-x-auto scrollbar-hide">
                            <VirtualizedProductList 
                              products={storeProducts} 
                              alwaysShowButtons={true}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
})

export { ExplorarMobile }
