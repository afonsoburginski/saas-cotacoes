"use client"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, SlidersHorizontal, MapPin, Star, DollarSign, X, TrendingUp, TrendingDown, StarIcon } from "lucide-react"
import { useState } from "react"

export interface FilterState {
  search: string
  categoria: string
  loja: string
  precoMin: string
  precoMax: string
  ordenarPor: "preco-asc" | "preco-desc" | "rating-desc" | "prioridade-desc"
}

interface FiltersBarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  categorias: string[]
  lojas: string[]
}

export function FiltersBar({ filters, onFiltersChange, categorias, lojas }: FiltersBarProps) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilter = (key: keyof FilterState) => {
    updateFilter(key, "")
  }

  // Categorias populares para filtros rápidos
  const quickCategories = ["Areia", "Argamassa", "Blocos", "Cimento", "Tinta", "Ferramentas"]

  return (
    <div className="space-y-3">
      {/* Main Search Bar */}
      <div className="space-y-3">
        {/* Mobile: Search + Sort */}
        <div className="md:hidden flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar produtos..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10 h-10 text-sm border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-transparent"
            />
          </div>
          <Select value={filters.ordenarPor} onValueChange={(value) => updateFilter("ordenarPor", value)}>
            <SelectTrigger className="w-10 h-10 p-0 border-gray-200 rounded-lg flex items-center justify-center [&_svg.opacity-50]:hidden">
              <SlidersHorizontal className="h-4 w-4 text-gray-600" />
            </SelectTrigger>
            <SelectContent align="end" className="min-w-[140px]">
              <SelectItem value="prioridade-desc" className="cursor-pointer">
                Relevância
              </SelectItem>
              <SelectItem value="preco-asc" className="cursor-pointer">
                Menor preço
              </SelectItem>
              <SelectItem value="preco-desc" className="cursor-pointer">
                Maior preço
              </SelectItem>
              <SelectItem value="rating-desc" className="cursor-pointer">
                Avaliação
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Search + Filters */}
        <div className="hidden md:flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar cimento, tijolo, tinta, ferramentas..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-12 h-12 text-base border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:border-transparent"
            />
          </div>
          
        </div>
      </div>


      {/* Desktop: Categories + Sort in same line */}
      <div className="hidden md:flex flex-wrap gap-2 items-center">
        <span className="text-sm text-gray-600 font-medium mr-2">Categorias:</span>
        {quickCategories.map((category) => (
          <Button
            key={category}
            variant={filters.categoria === category ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("categoria", filters.categoria === category ? "" : category)}
            className={`h-8 px-3 rounded-lg text-sm ${
              filters.categoria === category 
                ? "bg-[#0052FF] text-white hover:bg-[#0052FF]/90" 
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            {category}
          </Button>
        ))}
        
        {/* Desktop Sort Filter */}
        <div className="ml-4 flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Ordenar:</span>
          <Select value={filters.ordenarPor} onValueChange={(value) => updateFilter("ordenarPor", value)}>
            <SelectTrigger className="w-auto h-8 px-3 border-gray-200 rounded-lg text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prioridade-desc">Relevância</SelectItem>
              <SelectItem value="preco-asc">Menor preço</SelectItem>
              <SelectItem value="preco-desc">Maior preço</SelectItem>
              <SelectItem value="rating-desc">Melhor avaliação</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters - Mobile optimized */}
      {(filters.categoria || filters.loja || filters.precoMin || filters.precoMax || filters.search) && (
        <div className="flex flex-wrap gap-1.5 md:gap-2 items-center pt-1">
          <span className="text-xs md:text-sm text-gray-500">Filtros:</span>
          
          {filters.search && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 rounded-md text-xs">
              "{filters.search.length > 15 ? filters.search.substring(0, 15) + '...' : filters.search}"
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => clearFilter("search")} />
            </Badge>
          )}
          
          {filters.loja && (
            <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 rounded-md text-xs">
              {filters.loja.length > 12 ? filters.loja.substring(0, 12) + '...' : filters.loja}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => clearFilter("loja")} />
            </Badge>
          )}
          
          {(filters.precoMin || filters.precoMax) && (
            <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200 rounded-md text-xs">
              R$ {filters.precoMin || '0'} - R$ {filters.precoMax || '∞'}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => {
                clearFilter("precoMin")
                clearFilter("precoMax")
              }} />
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 md:h-6 px-1.5 md:px-2 text-xs text-gray-500 hover:text-gray-700"
            onClick={() => onFiltersChange({
              search: "",
              categoria: "",
              loja: "",
              precoMin: "",
              precoMax: "",
              ordenarPor: "prioridade-desc"
            })}
          >
            Limpar
          </Button>
        </div>
      )}

    </div>
  )
}
