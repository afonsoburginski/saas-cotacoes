"use client"

import * as React from "react"
import { useState, useMemo, useEffect, useCallback, memo, useRef } from "react"

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
import { ProductsGridSkeleton } from "./products-grid-skeleton"
import { useExplorarStore } from "@/stores/explorar-store"
import { 
  Sparkles, 
  Zap, 
  Loader2, 
  Search, 
  ShoppingBag, 
  MapPin, 
  Star, 
  Shield, 
  Briefcase,
  Wrench,
  SlidersHorizontal, 
  ChevronsUpDown, 
  Check 
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import Link from "next/link"
import { FaArrowRightLong } from "react-icons/fa6"
import { HorizontalScrollContainer } from "@/components/ui/horizontal-scroll-container"

interface ExplorarDesktopProps {
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  filteredProducts: any[]
  categorias: string[]
  lojas: string[]
  stores: any[]
  isLoading?: boolean
}

const ExplorarDesktop = memo(function ExplorarDesktop({ 
  filters, 
  setFilters, 
  filteredProducts, 
  categorias, 
  lojas,
  stores,
  isLoading: isLoadingData = false
}: ExplorarDesktopProps) {
  const { generateCategoryComparison, isLoading } = useSmartComparison()
  const router = useRouter()
  const [categoryOpen, setCategoryOpen] = useState(false)
  
  // Use Zustand para compartilhar estado com mobile
  const { activeTab, supplierSearch, setActiveTab, setSupplierSearch } = useExplorarStore()
  
  // Random seed que muda a cada mount para forçar re-shuffle
  const [shuffleSeed] = useState(() => Math.random())
  
  // Embaralhar prestadores (buscar do banco)
  const [shuffledProviders, setShuffledProviders] = useState<any[]>([])
  const fetchedProvidersOnceRef = useRef(false)
  
  useEffect(() => {
    if (fetchedProvidersOnceRef.current) return

    let isMounted = true
    const controller = new AbortController()

    console.log('🔍 Buscando prestadores de serviço...')

    async function fetchWithRetry(url: string, attempts = 3, delayMs = 500): Promise<any> {
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          const res = await fetch(url, { signal: controller.signal })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return await res.json()
        } catch (err) {
          if (controller.signal.aborted) throw err
          if (attempt === attempts) throw err
          await new Promise(r => setTimeout(r, delayMs * attempt))
        }
      }
    }

    fetchWithRetry('/api/service-providers?limit=15')
      .then((data) => {
        console.log('📦 Prestadores recebidos:', data)
        if (!isMounted) return
        if (data?.data) {
          setShuffledProviders(shuffleArray(data.data))
          console.log('✅ Prestadores embaralhados:', data.data.length)
          fetchedProvidersOnceRef.current = true
        } else {
          setShuffledProviders([])
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.warn('⚠️ Falha ao buscar prestadores (será ignorado):', err)
          if (isMounted) setShuffledProviders([])
        }
      })

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

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

  // Memoized handlers for better performance
  const handleSearchChange = useCallback((value: string) => {
    if (activeTab === "produtos") {
      setFilters(prev => ({ ...prev, search: value }))
    } else {
      setSupplierSearch(value)
    }
  }, [activeTab, setFilters, setSupplierSearch])

  const handleCategorySelect = useCallback((category: string) => {
    setFilters(prev => ({ ...prev, categoria: category }))
    setCategoryOpen(false)
  }, [setFilters])

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: "",
      categoria: "",
      loja: "",
      ordenarPor: "prioridade-desc",
    })
  }, [setFilters])

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as 'produtos' | 'lojas')
    // Limpa os filtros ao mudar de tab
    if (value === "produtos") {
      setSupplierSearch("")
    } else {
      setFilters(prev => ({ ...prev, search: "" }))
    }
  }, [setFilters, setActiveTab, setSupplierSearch])

  // Filtrar fornecedores baseado na busca e randomizar
  const filteredStores = useMemo(() => {
    console.log('🏪 Total stores:', stores.length)
    let filtered
    if (!supplierSearch) {
      filtered = stores.filter(s => s.status === "approved")
      console.log('📍 Filtradas (approved):', filtered.length)
    } else {
      const searchLower = supplierSearch.toLowerCase()
      filtered = stores.filter(s => 
        s.status === "approved" && 
        (s.nome.toLowerCase().includes(searchLower) || 
         s.cidade?.toLowerCase().includes(searchLower))
      )
      console.log('🔍 Filtradas por busca:', filtered.length)
    }
    
    // Shuffle stores for variety on each load
    return shuffleArray(filtered)
  }, [stores, supplierSearch, shuffleSeed])

  // Agrupar produtos por categoria para rows no desktop com shuffle
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

  // Placeholder e value dinâmicos baseados na tab ativa
  const searchPlaceholder = activeTab === "produtos" 
    ? "Buscar produtos..." 
    : "Buscar fornecedores..."
  
  const searchValue = activeTab === "produtos" ? filters.search : supplierSearch

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Blue Header Section */}
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
          
          <div className="container mx-auto max-w-[1400px] px-6 py-8 relative z-10">
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 z-10" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-12 pr-4 h-12 !bg-white border border-gray-200 rounded-xl text-base placeholder:text-gray-400 focus:!bg-white focus:ring-2 focus:ring-white/20 focus:border-white font-medium shadow-sm font-montserrat"
                />
              </div>
            </div>

            {/* Title and Description */}
            <div className="text-center max-w-2xl mx-auto mb-6">
              <TypographyH3 className="text-white font-montserrat mb-2">Melhores orçamentos</TypographyH3>
              <TypographyP className="text-white/90 font-montserrat">Compare preços e peça orçamentos de forma rápida</TypographyP>
            </div>

            {/* Tabs */}
            <div className="flex justify-center">
              <TabsList className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-1">
                <TabsTrigger 
                  value="produtos" 
                  className="rounded-md px-6 py-2.5 text-sm data-[state=active]:bg-white data-[state=active]:text-[#0052FF] data-[state=active]:shadow-sm text-white font-montserrat"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Produtos
                </TabsTrigger>
                <TabsTrigger 
                  value="lojas"
                  className="rounded-md px-6 py-2.5 text-sm data-[state=active]:bg-white data-[state=active]:text-[#0052FF] data-[state=active]:shadow-sm text-white font-montserrat"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Marketplace
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto max-w-[1400px] px-6 py-6">
          <div className="w-full space-y-6">
          {/* Filters Row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1"></div>
            
            <div className="flex items-center gap-2">
              {/* Category combobox */}
              <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 w-[200px] justify-between">
                    <div className="flex items-center gap-2 text-gray-700">
                      <SlidersHorizontal className="h-4 w-4" />
                      <span className="truncate">
                        {filters.categoria ? filters.categoria : "Categorias"}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[260px]" align="end">
                  <Command>
                    <CommandInput placeholder="Filtrar categorias..." />
                    <CommandEmpty>Nenhuma categoria.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="todas"
                        onSelect={() => {
                          setCategoryOpen(false)
                          setFilters({ ...filters, categoria: "" })
                        }}
                      >
                        <Check className={`mr-2 h-4 w-4 ${!filters.categoria ? "opacity-100" : "opacity-0"}`} />
                        Todas as categorias
                      </CommandItem>
                      {categorias.map((cat) => (
                        <CommandItem
                          key={cat}
                          value={cat}
                          onSelect={() => {
                            setCategoryOpen(false)
                            setFilters({ ...filters, categoria: cat })
                          }}
                        >
                          <Check className={`mr-2 h-4 w-4 ${filters.categoria === cat ? "opacity-100" : "opacity-0"}`} />
                          {cat}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              {filters.categoria && (
                <Button
                  size="sm"
                  onClick={() => generateCategoryComparison(filters.categoria)}
                  disabled={isLoading}
                  className="h-9 bg-[#0052FF] text-white hover:bg-[#0052FF]/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Comparar {filters.categoria}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="produtos" className="space-y-4">

            {/* Results Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="bg-gray-50 px-3 py-1.5 rounded-lg border">
                  <TypographyP className="text-sm mt-0">
                    <span className="font-semibold text-[#0052FF]">{filteredProducts.length}</span> 
                    <span className="text-gray-600 ml-1">produtos</span>
                  </TypographyP>
                </div>
                {filters.search && (
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border">
                    <Search className="h-3 w-3 text-gray-400" />
                    <TypographySmall className="text-gray-600">"{filters.search}"</TypographySmall>
                  </div>
                )}
              </div>

              {filteredProducts.length > 0 && !filters.categoria && (
                <div className="flex gap-2">
                  {categorias.slice(0, 3).map((categoria) => (
                    <Button
                      key={categoria}
                      variant="outline"
                      size="sm"
                      onClick={() => generateCategoryComparison(categoria)}
                      disabled={isLoading}
                      className="text-xs"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {categoria}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Products Rows - Netflix Style */}
            {isLoadingData ? (
              <ProductsGridSkeleton />
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <TypographyH3 className="mb-2">Nenhum produto encontrado</TypographyH3>
                <TypographyP className="text-gray-600 mb-6 text-sm">Tente ajustar os filtros ou buscar por outros termos</TypographyP>
                <Button
                  variant="outline"
                  onClick={() => setFilters({
                    search: "",
                    categoria: "",
                    loja: "",
                    ordenarPor: "prioridade-desc",
                  })}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(productsByCategory).map(([categoria, categoryProducts]) => {
                  if (!categoryProducts.length) return null
                  
                  return (
                    <div key={categoria} className="space-y-4">
                      {/* Category Header */}
                      <div className="flex items-center justify-between">
                        <Link 
                          href={`/categoria/${encodeURIComponent(categoria)}`}
                          className="flex items-center gap-2 group hover:text-[#0052FF] transition-colors"
                        >
                          <TypographyH3 className="font-montserrat group-hover:text-[#0052FF] transition-colors">
                            {categoria}
                          </TypographyH3>
                          <FaArrowRightLong className="h-4 w-4 text-gray-400 group-hover:text-[#0052FF] group-hover:translate-x-1 transition-all" />
                        </Link>
                        <TypographySmall className="text-gray-500 font-montserrat">
                          {categoryProducts.length} produtos
                        </TypographySmall>
                      </div>
                      
                      {/* Horizontal Scrollable Row */}
                      <HorizontalScrollContainer>
                        <div className="flex gap-4 pb-2">
                          {categoryProducts.map((product) => (
                            <div key={product.id} className="flex-none w-[220px]">
                              <ProductCardAdaptive product={product} alwaysShowButtons={false} />
                            </div>
                          ))}
                        </div>
                      </HorizontalScrollContainer>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="lojas" className="space-y-4">
            <div className="space-y-4">
              {/* Se NÃO tem fornecedores, mostra prestadores primeiro */}
              {filteredStores.length === 0 && shuffledProviders.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Wrench className="h-5 w-5 text-green-600" />
                    <TypographyH3 className="font-montserrat">Prestadores de Serviço</TypographyH3>
                    <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                      {shuffledProviders.length} Profissionais
                    </Badge>
                  </div>
                  
                  <HorizontalScrollContainer>
                    <div className="flex gap-4 pb-2">
                      {shuffledProviders.map((provider: any) => (
                        <Card 
                          key={provider.id}
                          className="flex-none w-[200px] p-4 hover:shadow-lg transition-shadow cursor-pointer border-green-100"
                          onClick={() => router.push(`/fornecedor/${provider.id}`)}
                        >
                          <div className="flex flex-col items-center text-center">
                          <Avatar className="h-16 w-16 mb-3 border-2 border-green-200 overflow-hidden">
                            {provider.logo ? (
                              <AvatarImage src={provider.logo} alt={provider.nome} />
                            ) : null}
                            <AvatarFallback className="bg-green-600 text-white font-bold">
                              {provider.nome?.split(' ')[0]?.charAt(0)}{provider.nome?.split(' ')[1]?.charAt(0) || ''}
                            </AvatarFallback>
                          </Avatar>
                            
                            <TypographySmall className="font-semibold mb-1 line-clamp-2">
                              {provider.nome}
                            </TypographySmall>
                            
                            <div className="flex items-center gap-1 mb-4">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium">{provider.rating || 5.0}</span>
                              <Shield className="h-3 w-3 text-green-600 ml-1" />
                            </div>
                            
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs border-green-600 text-green-700 hover:bg-green-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/fornecedor/${provider.id}`);
                              }}
                            >
                              Ver Perfil
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </HorizontalScrollContainer>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <TypographyH3>Fornecedores (Lojas)</TypographyH3>
                <Badge variant="outline">{filteredStores.length} lojas</Badge>
              </div>
              
              {filteredStores.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
                  <TypographyP className="text-gray-600 text-sm">Nenhuma loja cadastrada ainda</TypographyP>
                </div>
              ) : (
                <div className="space-y-8">
                {filteredStores.map((store, index) => {
                    const storeProducts = shuffleArray(
                      filteredProducts.filter(p => p.storeId === store.id)
                    ).slice(0, 6)
                    
                    // Mostrar prestadores ao menos uma vez: a cada 2 lojas e SEMPRE no último item
                    const showProviders = ((index + 1) % 2 === 0) || (index === filteredStores.length - 1)
                    const providerStart = Math.floor(index / 2) * 10
                    const providersToShow = shuffledProviders.slice(providerStart, providerStart + 10)

                    return (
                      <div key={`store-${store.id}`}>
                      <div className="space-y-4">
                        {/* Supplier Info */}
                        <div 
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => router.push(`/fornecedor/${store.id}`)}
                        >
                          <Avatar className="h-14 w-14 rounded-full border-2 border-white shadow-sm overflow-hidden">
                            {store.logo ? (
                              <AvatarImage src={store.logo} alt={store.nome} />
                            ) : null}
                            <AvatarFallback className="bg-[#0052FF] text-white font-semibold text-lg">
                              @{store.nome.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <TypographyH4 className="truncate font-montserrat">@{store.nome}</TypographyH4>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <TypographySmall className="font-medium font-montserrat">4.8</TypographySmall>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <TypographySmall className="font-montserrat">2.5 km</TypographySmall>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Separator */}
                        <div className="border-t border-gray-200 w-full" />

                        {/* Products Preview - Horizontal Scroll */}
                        {storeProducts.length > 0 && (
                          <HorizontalScrollContainer>
                            <div className="flex gap-4 pb-2">
                              {storeProducts.map((product) => (
                                <div key={product.id} className="flex-none w-[220px]">
                                  <ProductCardAdaptive product={product} alwaysShowButtons={false} />
                                </div>
                              ))}
                            </div>
                          </HorizontalScrollContainer>
                        )}
                      </div>
                      
                      {/* Row de Prestadores a cada 2 fornecedores */}
                      {showProviders && providersToShow.length > 0 && (
                        <div className="my-8">
                          <div className="flex items-center gap-2 mb-4">
                            <Wrench className="h-5 w-5 text-green-600" />
                            <TypographyH4 className="font-montserrat">Prestadores de Serviço</TypographyH4>
                            <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                              Profissionais Qualificados
                            </Badge>
                          </div>
                          
                          <HorizontalScrollContainer>
                            <div className="flex gap-4 pb-2">
                              {providersToShow.map((provider: any) => (
                                <Card 
                                  key={provider.id}
                                  className="flex-none w-[200px] p-4 hover:shadow-lg transition-shadow cursor-pointer border-green-100"
                                  onClick={() => router.push(`/fornecedor/${provider.id}`)}
                                >
                                  <div className="flex flex-col items-center text-center">
                                    <Avatar className="h-16 w-16 mb-3 border-2 border-green-200">
                                      <AvatarFallback className="bg-green-600 text-white font-bold">
                                        {provider.nome?.split(' ')[0]?.charAt(0)}{provider.nome?.split(' ')[1]?.charAt(0) || ''}
                                      </AvatarFallback>
                                    </Avatar>
                                    
                                    <TypographySmall className="font-semibold mb-1 line-clamp-2">
                                      {provider.nome}
                                    </TypographySmall>
                                    
                                    <div className="flex items-center gap-1 mb-4">
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      <span className="text-xs font-medium">{provider.rating || 5.0}</span>
                                      <Shield className="h-3 w-3 text-green-600 ml-1" />
                                    </div>
                                    
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="w-full text-xs border-green-600 text-green-700 hover:bg-green-50"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/fornecedor/${provider.id}`);
                                      }}
                                    >
                                      Ver Perfil
                                    </Button>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </HorizontalScrollContainer>
                        </div>
                      )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
})

export { ExplorarDesktop }
