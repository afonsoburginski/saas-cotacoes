"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ProductForm, ProductFormData } from "./product-form"
import { useToast } from "@/hooks/use-toast"
import { Product } from "@/lib/types"
import { 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Trash2, 
  Power, 
  Eye, 
  EyeOff,
  Star,
  StarOff,
  Package,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  X,
  ChevronDown,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle
} from "lucide-react"
import Image from "next/image"

interface ProductTableProps {
  products: Product[]
  onUpdate: (products: Product[]) => void
}

interface FilterState {
  status: string[]
  categoria: string[]
  destacado: string[]
  estoque: string[]
  preco: string[]
}

export function ProductTable({ products, onUpdate }: ProductTableProps) {
  const { toast } = useToast()
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    categoria: [],
    destacado: [],
    estoque: [],
    preco: []
  })
  const [filterSearch, setFilterSearch] = useState<{[key: string]: string}>({})

  // Obter opções únicas para filtros
  const uniqueCategories = [...new Set(products.map(p => p.categoria))]
  const uniqueStatus = [
    { value: "ativo", label: "Ativo", count: products.filter(p => p.ativo).length },
    { value: "inativo", label: "Inativo", count: products.filter(p => !p.ativo).length }
  ]
  const uniqueDestacado = [
    { value: "sim", label: "Destacado", count: products.filter(p => p.destacado).length },
    { value: "nao", label: "Normal", count: products.filter(p => !p.destacado).length }
  ]
  const uniqueEstoque = [
    { value: "baixo", label: "Estoque Baixo", count: products.filter(p => p.estoque < 10).length },
    { value: "normal", label: "Estoque Normal", count: products.filter(p => p.estoque >= 10).length },
    { value: "zerado", label: "Sem Estoque", count: products.filter(p => p.estoque === 0).length }
  ]
  const uniquePreco = [
    { value: "variacao", label: "Variação de Preço", count: products.filter(p => p.temVariacaoPreco).length },
    { value: "fixo", label: "Preço Fixo", count: products.filter(p => !p.temVariacaoPreco).length }
  ]

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filters.status.length === 0 || 
                         (filters.status.includes("ativo") && product.ativo) ||
                         (filters.status.includes("inativo") && !product.ativo)
    
    const matchesCategoria = filters.categoria.length === 0 || 
                            filters.categoria.includes(product.categoria)
    
    const matchesDestacado = filters.destacado.length === 0 ||
                            (filters.destacado.includes("sim") && product.destacado) ||
                            (filters.destacado.includes("nao") && !product.destacado)
    
    const matchesEstoque = filters.estoque.length === 0 ||
                           (filters.estoque.includes("baixo") && product.estoque < 10 && product.estoque > 0) ||
                           (filters.estoque.includes("normal") && product.estoque >= 10) ||
                           (filters.estoque.includes("zerado") && product.estoque === 0)
    
    const matchesPreco = filters.preco.length === 0 ||
                         (filters.preco.includes("variacao") && product.temVariacaoPreco) ||
                         (filters.preco.includes("fixo") && !product.temVariacaoPreco)
    
    return matchesSearch && matchesStatus && matchesCategoria && matchesDestacado && matchesEstoque && matchesPreco
  })

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId])
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map(p => p.id))
    } else {
      setSelectedProducts([])
    }
  }

  const toggleFilter = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value]
    }))
  }

  const clearFilter = (filterType: keyof FilterState) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: []
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      status: [],
      categoria: [],
      destacado: [],
      estoque: [],
      preco: []
    })
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).reduce((total, filterArray) => total + filterArray.length, 0)
  }

  const handleToggleStatus = (productId: string) => {
    const updatedProducts = products.map(p => 
      p.id === productId ? { ...p, ativo: !p.ativo } : p
    )
    onUpdate(updatedProducts)
    
    const product = products.find(p => p.id === productId)
    toast({
      title: product?.ativo ? "Produto desativado!" : "Produto ativado!",
      description: `O produto foi ${product?.ativo ? "desativado" : "ativado"} com sucesso.`,
    })
  }

  const handleToggleFeatured = (productId: string) => {
    const updatedProducts = products.map(p => 
      p.id === productId ? { ...p, destacado: !p.destacado } : p
    )
    onUpdate(updatedProducts)
    
    const product = products.find(p => p.id === productId)
    toast({
      title: product?.destacado ? "Produto removido dos destaques!" : "Produto destacado!",
      description: `O produto foi ${product?.destacado ? "removido dos destaques" : "adicionado aos destaques"}.`,
    })
  }

  const handleDuplicate = (product: Product) => {
    const duplicatedProduct: Product = {
      ...product,
      id: `p${Date.now()}`,
      nome: `${product.nome} (Cópia)`,
      sku: product.sku ? `${product.sku}-COPY` : undefined,
      estoque: 0,
    }
    
    onUpdate([duplicatedProduct, ...products])
    toast({
      title: "Produto duplicado!",
      description: `Uma cópia de "${product.nome}" foi criada.`,
    })
  }

  const handleDelete = (product: Product) => {
    const updatedProducts = products.filter(p => p.id !== product.id)
    onUpdate(updatedProducts)
    setDeleteProduct(null)
    
    toast({
      title: "Produto excluído!",
      description: `O produto "${product.nome}" foi removido.`,
    })
  }

  const handleBulkDelete = () => {
    const updatedProducts = products.filter(p => !selectedProducts.includes(p.id))
    onUpdate(updatedProducts)
    setSelectedProducts([])
    
    toast({
      title: "Produtos excluídos!",
      description: `${selectedProducts.length} produtos foram removidos.`,
    })
  }

  const handleBulkToggleStatus = (active: boolean) => {
    const updatedProducts = products.map(p => 
      selectedProducts.includes(p.id) ? { ...p, ativo: active } : p
    )
    onUpdate(updatedProducts)
    setSelectedProducts([])
    
    toast({
      title: `Produtos ${active ? "ativados" : "desativados"}!`,
      description: `${selectedProducts.length} produtos foram ${active ? "ativados" : "desativados"}.`,
    })
  }

  const handleFormSubmit = (formData: ProductFormData) => {
    if (editingProduct) {
      // Atualizar produto existente
      const updatedProduct: Product = {
        ...editingProduct,
        ...formData,
        imagemUrl: formData.imagens[0] || editingProduct.imagemUrl,
      }
      
      const updatedProducts = products.map(p => 
        p.id === editingProduct.id ? updatedProduct : p
      )
      onUpdate(updatedProducts)
    } else {
      // Criar novo produto
      const newProduct: Product = {
        id: `p${Date.now()}`,
        storeId: "1", // Mock store ID
        storeNome: "Construmax", // Mock store name
        nome: formData.nome,
        categoria: formData.categoria,
        preco: formData.preco,
        estoque: formData.estoque,
        unidadeMedida: formData.unidadeMedida,
        rating: 0,
        ativo: formData.ativo,
        imagemUrl: formData.imagens[0] || "/placeholder.svg",
        sku: formData.sku,
        descricao: formData.descricao,
        imagens: formData.imagens,
        destacado: formData.destacado,
        peso: formData.peso,
        dimensoes: formData.dimensoes,
      }
      
      onUpdate([newProduct, ...products])
    }
    
    setEditingProduct(null)
    setShowCreateForm(false)
  }

  const handleExportCSV = () => {
    const csvContent = [
      ["Nome", "SKU", "Categoria", "Preço", "Estoque", "Status", "Destacado"],
      ...filteredProducts.map(p => [
        p.nome,
        p.sku || "",
        p.categoria,
        p.preco.toString(),
        p.estoque.toString(),
        p.ativo ? "Ativo" : "Inativo",
        p.destacado ? "Sim" : "Não"
      ])
    ].map(row => row.join(",")).join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "produtos.csv"
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast({
      title: "Exportação concluída!",
      description: "Arquivo CSV foi baixado com sucesso.",
    })
  }

  return (
    <div className="space-y-4">
      {/* Header com controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Filtrar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 h-9 !bg-white !border !border-gray-300 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 !shadow-none"
            />
          </div>
          
          {/* Filtros Avançados */}
          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative h-9 border-2 !border-dotted rounded-sm shadow-none">
                  <Plus className="h-4 w-4 mr-2" />
                  Status
                  {filters.status.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                      {filters.status.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-sm border border-gray-300 shadow-lg">
                <div className="relative p-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Status"
                    value={filterSearch.status || ""}
                    onChange={(e) => setFilterSearch(prev => ({ ...prev, status: e.target.value }))}
                    className="h-8 pl-7 bg-transparent border border-gray-300 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <DropdownMenuSeparator />
                {uniqueStatus
                  .filter(item => 
                    !filterSearch.status || 
                    item.label.toLowerCase().includes(filterSearch.status.toLowerCase())
                  )
                  .map(item => (
                    <DropdownMenuCheckboxItem
                      key={item.value}
                      checked={filters.status.includes(item.value)}
                      onCheckedChange={() => toggleFilter("status", item.value)}
                      className="group data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-900"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <span className="mr-2 inline-flex h-4 w-4 rounded-[4px] border-2 border-gray-400 group-data-[state=checked]:bg-blue-600 group-data-[state=checked]:border-blue-600"></span>
                          <span className="flex items-center gap-2">
                            {item.value === "ativo" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-500" />
                            )}
                            {item.label}
                          </span>
                        </div>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {item.count}
                        </Badge>
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                {filters.status.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => clearFilter("status")}>
                      <X className="h-4 w-4 mr-2" />
                      Limpar Status
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Categoria Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative h-9 border-2 !border-dotted rounded-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Categoria
                  {filters.categoria.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                      {filters.categoria.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-sm border border-gray-300 shadow-lg">
                <div className="relative p-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Categoria"
                    value={filterSearch.categoria || ""}
                    onChange={(e) => setFilterSearch(prev => ({ ...prev, categoria: e.target.value }))}
                    className="h-8 pl-7 bg-transparent border border-gray-300 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <DropdownMenuSeparator />
                {uniqueCategories
                  .filter(cat => 
                    !filterSearch.categoria || 
                    cat.toLowerCase().includes(filterSearch.categoria.toLowerCase())
                  )
                  .map(categoria => {
                    const count = products.filter(p => p.categoria === categoria).length
                    return (
                      <DropdownMenuCheckboxItem
                        key={categoria}
                        checked={filters.categoria.includes(categoria)}
                        onCheckedChange={() => toggleFilter("categoria", categoria)}
                        className="group data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-900"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <span className="mr-2 inline-flex h-4 w-4 rounded-[4px] border-2 border-gray-400 group-data-[state=checked]:bg-blue-600 group-data-[state=checked]:border-blue-600"></span>
                            <span>{categoria}</span>
                          </div>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {count}
                          </Badge>
                        </div>
                      </DropdownMenuCheckboxItem>
                    )
                  })}
                {filters.categoria.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => clearFilter("categoria")}>
                      <X className="h-4 w-4 mr-2" />
                      Limpar Categoria
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Estoque Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative h-9 border-2 !border-dotted rounded-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Estoque
                  {filters.estoque.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                      {filters.estoque.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-sm border border-gray-300 shadow-lg">
                <div className="relative p-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Estoque"
                    value={filterSearch.estoque || ""}
                    onChange={(e) => setFilterSearch(prev => ({ ...prev, estoque: e.target.value }))}
                    className="h-8 pl-7 bg-transparent border border-gray-300 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <DropdownMenuSeparator />
                {uniqueEstoque
                  .filter(item => 
                    !filterSearch.estoque || 
                    item.label.toLowerCase().includes(filterSearch.estoque.toLowerCase())
                  )
                  .map(item => (
                    <DropdownMenuCheckboxItem
                      key={item.value}
                      checked={filters.estoque.includes(item.value)}
                      onCheckedChange={() => toggleFilter("estoque", item.value)}
                      className="group data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-900"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <span className="mr-2 inline-flex h-4 w-4 rounded-[4px] border-2 border-gray-400 group-data-[state=checked]:bg-blue-600 group-data-[state=checked]:border-blue-600"></span>
                          <span>{item.label}</span>
                        </div>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {item.count}
                        </Badge>
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                {filters.estoque.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => clearFilter("estoque")}>
                      <X className="h-4 w-4 mr-2" />
                      Limpar Estoque
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Preço Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative h-9 border-2 !border-dotted rounded-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Preço
                  {filters.preco.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                      {filters.preco.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-sm border border-gray-300 shadow-lg">
                <div className="relative p-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Preço"
                    value={filterSearch.preco || ""}
                    onChange={(e) => setFilterSearch(prev => ({ ...prev, preco: e.target.value }))}
                    className="h-8 pl-7 bg-transparent border border-gray-300 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <DropdownMenuSeparator />
                {uniquePreco
                  .filter(item => 
                    !filterSearch.preco || 
                    item.label.toLowerCase().includes(filterSearch.preco.toLowerCase())
                  )
                  .map(item => (
                    <DropdownMenuCheckboxItem
                      key={item.value}
                      checked={filters.preco.includes(item.value)}
                      onCheckedChange={() => toggleFilter("preco", item.value)}
                      className="group data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-900"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <span className="mr-2 inline-flex h-4 w-4 rounded-[4px] border-2 border-gray-400 group-data-[state=checked]:bg-blue-600 group-data-[state=checked]:border-blue-600"></span>
                          <span className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-amber-600" />
                            {item.label}
                          </span>
                        </div>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {item.count}
                        </Badge>
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                {filters.preco.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => clearFilter("preco")}>
                      <X className="h-4 w-4 mr-2" />
                      Limpar Preço
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear All Filters */}
            {getActiveFiltersCount() > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpar ({getActiveFiltersCount()})
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedProducts.length > 0 && (
            <div className="flex items-center gap-2 mr-4">
              <span className="text-sm text-gray-600">
                {selectedProducts.length} selecionados
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkToggleStatus(true)}
              >
                Ativar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkToggleStatus(false)}
              >
                Desativar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                Excluir
              </Button>
            </div>
          )}
          
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          
          <Button onClick={() => setShowCreateForm(true)}>
            <Package className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onCheckedChange={handleSelectAll}
                    className="border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Produto</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Unidade</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Preço</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Estoque</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <ContextMenu key={product.id}>
                  <ContextMenuTrigger asChild>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                          className="border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 relative bg-gray-100 rounded overflow-hidden">
                            <Image
                              src={product.imagemUrl || "/placeholder.svg"}
                              alt={product.nome}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-gray-900">{product.nome}</span>
                              <div className="flex items-center gap-1">
                                {/* Badge de Categoria */}
                                <Badge variant="outline" className="text-xs">
                                  {product.categoria}
                                </Badge>
                                
                                {/* Badge de Status */}
                                <Badge 
                                  variant={product.ativo ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {product.ativo ? "Ativo" : "Inativo"}
                                </Badge>
                                
                                {/* Badge de Destacado */}
                                {product.destacado && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    Destacado
                                  </Badge>
                                )}
                                
                                {/* Badge de Variação de Preço */}
                                {product.temVariacaoPreco && (
                                  <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    Consulta
                                  </Badge>
                                )}
                                
                                {/* Badge de Estoque Baixo */}
                                {product.estoque < 10 && product.estoque > 0 && (
                                  <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Baixo
                                  </Badge>
                                )}
                                
                                {/* Badge de Sem Estoque */}
                                {product.estoque === 0 && (
                                  <Badge variant="outline" className="text-xs border-red-200 text-red-700">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Zerado
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {product.sku && (
                              <div className="text-xs text-gray-500 mt-1">
                                SKU: {product.sku}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {product.unidadeMedida || "Unidade (un)"}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {product.temVariacaoPreco ? (
                          <span className="text-amber-600 font-medium">Sob consulta</span>
                        ) : (
                          `R$ ${product.preco.toFixed(2)}`
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={product.estoque > 0 ? "text-gray-900" : "text-red-600"}>
                          {product.estoque} unidades
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(product)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleStatus(product.id)}>
                              {product.ativo ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ativar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleFeatured(product.id)}>
                              {product.destacado ? (
                                <>
                                  <StarOff className="h-4 w-4 mr-2" />
                                  Remover Destaque
                                </>
                              ) : (
                                <>
                                  <Star className="h-4 w-4 mr-2" />
                                  Destacar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setDeleteProduct(product)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  </ContextMenuTrigger>
                  
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => setEditingProduct(product)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Produto
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleDuplicate(product)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicar Produto
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => handleToggleStatus(product.id)}>
                      {product.ativo ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Desativar Produto
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Ativar Produto
                        </>
                      )}
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleToggleFeatured(product.id)}>
                      {product.destacado ? (
                        <>
                          <StarOff className="h-4 w-4 mr-2" />
                          Remover Destaque
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4 mr-2" />
                          Destacar Produto
                        </>
                      )}
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem 
                      onClick={() => setDeleteProduct(product)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Produto
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || getActiveFiltersCount() > 0 ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || getActiveFiltersCount() > 0 
              ? "Tente ajustar os filtros de busca" 
              : "Comece adicionando seu primeiro produto"
            }
          </p>
          {!searchTerm && getActiveFiltersCount() === 0 && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Package className="h-4 w-4 mr-2" />
              Cadastrar primeiro produto
            </Button>
          )}
        </div>
      )}

      {/* Forms */}
      <ProductForm
        product={editingProduct || undefined}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSubmit={handleFormSubmit}
      />

      <ProductForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto "{deleteProduct?.nome}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProduct && handleDelete(deleteProduct)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
