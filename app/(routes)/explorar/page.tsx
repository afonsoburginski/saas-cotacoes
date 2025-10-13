"use client"

import { useState, useMemo, useEffect } from "react"
import { ProductCardAdaptive } from "@/components/explorar/product-card-adaptive"
import { PageBackground } from "@/components/layout/page-background"
import { StoreDetail } from "@/components/features/store-detail"
import { FiltersBar, type FilterState } from "@/components/features/filters-bar"
import { SupplierModal } from "@/components/supplier-modal"
import { mockProducts, mockStores } from "@/lib/mock-data"
import { useSmartComparison } from "@/hooks/use-smart-comparison"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Zap, Loader2, Search, TrendingUp, ShoppingBag, MapPin, Star, MessageCircle, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function ExplorarPage() {
  const { generateCategoryComparison, isLoading } = useSmartComparison()
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [supplierModalOpen, setSupplierModalOpen] = useState(false)

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    categoria: "",
    loja: "",
    precoMin: "",
    precoMax: "",
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

      if (filters.precoMin && product.preco < Number.parseFloat(filters.precoMin)) {
        return false
      }

      if (filters.precoMax && product.preco > Number.parseFloat(filters.precoMax)) {
        return false
      }

      return true
    })

    // Apply sorting with priority consideration
    filtered.sort((a, b) => {
      const storeA = mockStores.find((s) => s.id === a.storeId)
      const storeB = mockStores.find((s) => s.id === b.storeId)

      switch (filters.ordenarPor) {
        case "preco-asc":
          return a.preco - b.preco
        case "preco-desc":
          return b.preco - a.preco
        case "rating-desc":
          return b.rating - a.rating
        case "prioridade-desc":
        default:
          return (storeB?.priorityScore || 0) - (storeA?.priorityScore || 0)
      }
    })

    return filtered
  }, [filters])

  // Listen for supplier modal events from ProductCard
  useEffect(() => {
    const handleOpenSupplierModal = (event: CustomEvent) => {
      const { storeId } = event.detail
      setSelectedStore(storeId)
      setSupplierModalOpen(true)
    }

    window.addEventListener('openSupplierModal', handleOpenSupplierModal as EventListener)
    
    return () => {
      window.removeEventListener('openSupplierModal', handleOpenSupplierModal as EventListener)
    }
  }, [])

  return (
    <>
      <PageBackground />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-32 md:pb-8">
        <div className="w-full md:container md:mx-auto md:max-w-[1400px] md:px-6 py-6">
          {/* Header - apenas desktop */}
          <div className="hidden md:block pb-4 mb-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 font-marlin">
              Explorar Produtos
            </h1>
            <p className="text-gray-600 text-sm mt-1 font-montserrat">
              Compare preços e encontre os melhores fornecedores
            </p>
          </div>

      <Tabs defaultValue="produtos" className="w-full space-y-0 md:space-y-3">
        {/* Mobile Tabs - Underline */}
        <div className="md:hidden border-b border-gray-200">
          <div className="flex w-full">
            <TabsList className="w-full bg-transparent justify-start h-auto p-0 gap-0">
              <TabsTrigger 
                value="produtos" 
                className="relative px-4 py-3 text-sm text-gray-600 bg-transparent border-0 rounded-none shadow-none data-[state=active]:bg-transparent data-[state=active]:text-[#0052FF] data-[state=active]:shadow-none data-[state=active]:font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent data-[state=active]:after:bg-[#0052FF] font-montserrat"
              >
                <Search className="w-4 h-4 mr-2" />
                Produtos
              </TabsTrigger>
              <TabsTrigger 
                value="lojas"
                className="relative px-4 py-3 text-sm text-gray-600 bg-transparent border-0 rounded-none shadow-none data-[state=active]:bg-transparent data-[state=active]:text-[#0052FF] data-[state=active]:shadow-none data-[state=active]:font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent data-[state=active]:after:bg-[#0052FF] font-montserrat"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Fornecedores
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Desktop Tabs - Pill style */}
        <div className="hidden md:flex items-center justify-between">
          <TabsList className="bg-gray-100 border border-gray-200 rounded-lg p-1 font-montserrat">
            <TabsTrigger 
              value="produtos" 
              className="rounded-md px-4 py-2 text-sm data-[state=active]:bg-[#0052FF] data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Search className="w-4 h-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger 
              value="lojas"
              className="rounded-md px-4 py-2 text-sm data-[state=active]:bg-[#0052FF] data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Fornecedores
            </TabsTrigger>
          </TabsList>
          {filters.categoria && (
            <Button
              size="default"
              onClick={() => generateCategoryComparison(filters.categoria)}
              disabled={isLoading}
              className="bg-[#0052FF] text-white hover:bg-[#0052FF]/90 font-montserrat"
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

        <TabsContent value="produtos" className="space-y-4">
          <div className="-mt-px md:mt-3">
            <FiltersBar filters={filters} onFiltersChange={setFilters} categorias={categorias} lojas={lojas} />
          </div>

      {/* Results Header - Desktop only */}
      <div className="hidden md:flex items-center justify-between flex-wrap gap-3 px-4 md:px-0">
        <div className="flex items-center gap-2">
          <div className="bg-gray-50 px-3 py-1.5 rounded-lg border">
            <p className="text-sm">
              <span className="font-semibold text-[#0052FF]">{filteredProducts.length}</span> 
              <span className="text-gray-600 ml-1">produtos</span>
            </p>
          </div>
          {filters.search && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border">
              <Search className="h-3 w-3 text-gray-400" />
              <span className="text-sm text-gray-600">"{filters.search}"</span>
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

          {/* Products Grid or Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl md:rounded-lg border border-gray-200 mx-4 md:mx-0">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 font-marlin">Nenhum produto encontrado</h3>
              <p className="text-gray-600 mb-6 text-sm font-montserrat">Tente ajustar os filtros ou buscar por outros termos</p>
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    search: "",
                    categoria: "",
                    loja: "",
                    precoMin: "",
                    precoMax: "",
                    ordenarPor: "prioridade-desc",
                  })
                }
                className="font-montserrat"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 px-0 md:px-0">
              {filteredProducts.map((product) => (
                <ProductCardAdaptive key={product.id} product={product} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lojas" className="mt-0 space-y-4 px-4 md:px-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 font-marlin">Fornecedores Disponíveis</h2>
              <Badge variant="outline" className="font-montserrat">{mockStores.filter(s => s.status === "ativo").length} fornecedores</Badge>
            </div>
            
            <div className="grid gap-4">
              {mockStores
                .filter(s => s.status === "ativo")
                .sort((a, b) => b.priorityScore - a.priorityScore)
                .map((store) => (
                  <Card 
                    key={store.id} 
                    className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 hover:border-[#0052FF]/30 rounded-xl md:rounded-2xl"
                    onClick={() => {
                      setSelectedStore(store.id)
                      setSupplierModalOpen(true)
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 rounded-xl">
                        <AvatarFallback className="bg-[#0052FF] text-white font-semibold rounded-xl font-marlin">
                          {store.nome.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 font-marlin truncate">{store.nome}</h3>
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs font-montserrat shrink-0">
                            <Shield className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 font-montserrat overflow-x-auto scrollbar-hide">
                          <div className="flex items-center gap-1 shrink-0">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">4.8</span>
                            <span className="hidden md:inline">(127 avaliações)</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <MapPin className="h-4 w-4" />
                            <span className="hidden md:inline">São Paulo, SP • 2.5 km</span>
                            <span className="md:hidden">2.5 km</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <div className="text-sm font-medium text-gray-900 font-montserrat">150+</div>
                        <div className="text-xs text-gray-500 font-montserrat">{store.plano}</div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Supplier Modal */}
      <SupplierModal
        store={selectedStore ? mockStores.find(s => s.id === selectedStore) || null : null}
        open={supplierModalOpen}
        onOpenChange={setSupplierModalOpen}
      />
    </>
  )
}
