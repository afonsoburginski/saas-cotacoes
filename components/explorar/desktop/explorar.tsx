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
  Sparkles, 
  Zap, 
  Loader2, 
  Search, 
  ShoppingBag, 
  MapPin, 
  Star, 
  Shield, 
  SlidersHorizontal, 
  ChevronsUpDown, 
  Check 
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"

interface ExplorarDesktopProps {
  filters: FilterState
  setFilters: (filters: FilterState) => void
  filteredProducts: any[]
  categorias: string[]
  lojas: string[]
}

export function ExplorarDesktop({ 
  filters, 
  setFilters, 
  filteredProducts, 
  categorias, 
  lojas 
}: ExplorarDesktopProps) {
  const { generateCategoryComparison, isLoading } = useSmartComparison()
  const router = useRouter()
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)

  const orderOptions: { value: FilterState["ordenarPor"]; label: string }[] = [
    { value: "prioridade-desc", label: "Relevância" },
    { value: "rating-desc", label: "Melhor avaliação" },
  ]

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-8">
      <div className="container mx-auto max-w-[1400px] px-6 py-6">
        <Tabs defaultValue="produtos" className="w-full space-y-2">
          {/* Desktop Tabs - Pill style + inline filters */}
          <div className="flex items-center justify-between gap-3">
            <TabsList className="bg-gray-100 border border-gray-200 rounded-lg p-1">
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

              {/* Order combobox */}
              <Popover open={orderOpen} onOpenChange={setOrderOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 w-[200px] justify-between">
                    <div className="flex items-center gap-2 text-gray-700">
                      <SlidersHorizontal className="h-4 w-4" />
                      <span className="truncate">
                        {orderOptions.find(o => o.value === filters.ordenarPor)?.label || "Ordenar"}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[260px]" align="end">
                  <Command>
                    <CommandInput placeholder="Ordenar por..." />
                    <CommandEmpty>Nenhuma opção.</CommandEmpty>
                    <CommandGroup>
                      {orderOptions.map((opt) => (
                        <CommandItem
                          key={opt.value}
                          value={opt.value}
                          onSelect={() => {
                            setOrderOpen(false)
                            setFilters({ ...filters, ordenarPor: opt.value })
                          }}
                        >
                          <Check className={`mr-2 h-4 w-4 ${filters.ordenarPor === opt.value ? "opacity-100" : "opacity-0"}`} />
                          {opt.label}
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
            <div className="-mt-px">
              <FiltersBar filters={filters} onFiltersChange={setFilters} categorias={categorias} lojas={lojas} />
            </div>

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

            {/* Products Grid or Empty State */}
            {filteredProducts.length === 0 ? (
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCardAdaptive key={product.id} product={product} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="lojas" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <TypographyH3>Fornecedores Disponíveis</TypographyH3>
                <Badge variant="outline">{mockStores.filter(s => s.status === "ativo").length} fornecedores</Badge>
              </div>
              
              <div className="grid gap-4">
                {mockStores
                  .filter(s => s.status === "ativo")
                  .sort((a, b) => b.priorityScore - a.priorityScore)
                  .map((store) => (
                    <Card 
                      key={store.id} 
                      className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 hover:border-[#0052FF]/30 rounded-xl"
                      onClick={() => router.push(`/fornecedor/${store.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 rounded-xl">
                          <AvatarFallback className="bg-[#0052FF] text-white font-semibold rounded-xl">
                            {store.nome.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <TypographyH4 className="truncate">{store.nome}</TypographyH4>
                            <Badge className="bg-green-100 text-green-700 border-green-200 shrink-0">
                              <Shield className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 overflow-x-auto scrollbar-hide">
                            <div className="flex items-center gap-1 shrink-0">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <TypographySmall className="font-medium">4.8</TypographySmall>
                              <TypographySmall>(127 avaliações)</TypographySmall>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <MapPin className="h-4 w-4" />
                              <TypographySmall>São Paulo, SP • 2.5 km</TypographySmall>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right shrink-0">
                          <TypographySmall className="font-medium">150+</TypographySmall>
                          <TypographyMuted className="text-xs">{store.plano}</TypographyMuted>
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
  )
}
