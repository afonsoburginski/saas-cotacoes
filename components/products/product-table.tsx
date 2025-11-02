"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { useDebounce } from "@/hooks/use-debounce"
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
import { ServiceForm, ServiceFormData } from "./service-form"
import { ImportCSVDialog } from "./import-csv-dialog"
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
  Upload,
  Plus,
  X,
  ChevronDown,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  FileSpreadsheet
} from "lucide-react"
import Image from "next/image"

import { 
  useProducts, 
  useCreateProduct, 
  useUpdateProduct, 
  useUpdateProducts,
  useDeleteProduct, 
  useDeleteProducts,
  useBulkCreateProducts
} from "@/hooks/use-products"
import {
  useServices,
  useCreateService,
  useUpdateService,
  useUpdateServices,
  useDeleteService,
  useDeleteServices
} from "@/hooks/use-services"
import type { Service } from "@/lib/types"

type CatalogTab = 'products' | 'services'

interface ProductTableProps {
  storeId: string
  isLoading?: boolean
  activeTab?: 'produtos' | 'servicos'
  onTabChange?: (tab: 'produtos' | 'servicos') => void
}

interface FilterState {
  status: string[]
  categoria: string[]
  destacado: string[]
  estoque: string[]
  preco: string[]
}

export function ProductTable({ storeId, isLoading: isLoadingProp, activeTab = 'produtos', onTabChange }: ProductTableProps) {
  const { toast } = useToast()
  
  // Tab State - usar prop externa se disponível
  const [internalTab, setInternalTab] = useState<CatalogTab>('products')
  const currentTab = activeTab === 'produtos' ? 'products' : 'services'
  
  // React Query - Products
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300) // 🚀 Debounce de 300ms para performance
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({ 
    storeId,
    includeInactive: true,
    search: debouncedSearchTerm // 🚀 Usar busca com debounce
  })
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const updateProducts = useUpdateProducts()
  const deleteProduct = useDeleteProduct()
  const deleteProducts = useDeleteProducts()
  const bulkCreateProducts = useBulkCreateProducts()
  
  // React Query - Services
  const { data: servicesData, isLoading: isLoadingServices } = useServices({
    storeId,
    includeInactive: true,
    search: debouncedSearchTerm // 🚀 Usar busca com debounce
  })
  const createService = useCreateService()
  const updateService = useUpdateService()
  const updateServices = useUpdateServices()
  const deleteService = useDeleteService()
  const deleteServices = useDeleteServices()
  
  const products = productsData?.data || []
  const services = servicesData?.data || []
  const isLoading = isLoadingProp || isLoadingProducts || isLoadingServices
  
  // Local State
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | Service | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [deleteProductState, setDeleteProductState] = useState<Product | Service | null>(null)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    categoria: [],
    destacado: [],
    estoque: [],
    preco: []
  })
  const [filterSearch, setFilterSearch] = useState<{[key: string]: string}>({})

  // Combinar dados baseado na tab ativa
  const currentItems = currentTab === 'products' ? products : services
  
  // Obter opções únicas para filtros
  const uniqueStatus = useMemo(() => [
    { value: "ativo", label: "Ativo", count: currentItems.filter(p => p.ativo).length },
    { value: "inativo", label: "Inativo", count: currentItems.filter(p => !p.ativo).length }
  ], [currentItems])
  
  const uniqueDestacado = useMemo(() => [
    { value: "sim", label: "Destacado", count: currentItems.filter(p => p.destacado).length },
    { value: "nao", label: "Normal", count: currentItems.filter(p => !p.destacado).length }
  ], [currentItems])
  // Type guards
  const isProduct = (item: Product | Service): item is Product => 'estoque' in item
  const isService = (item: Product | Service): item is Service => 'tipoPrecificacao' in item

  // Filtro de estoque apenas para produtos
  const uniqueEstoque = useMemo(() => currentTab !== 'services' ? [
    { value: "baixo", label: "Estoque Baixo", count: products.filter(p => p.estoque < 10).length },
    { value: "normal", label: "Estoque Normal", count: products.filter(p => p.estoque >= 10).length },
    { value: "zerado", label: "Sem Estoque", count: products.filter(p => p.estoque === 0).length }
  ] : [], [currentTab, products])
  
  const uniquePreco = useMemo(() => [
    { value: "variacao", label: "Variação de Preço", count: currentItems.filter(p => isProduct(p) ? p.temVariacaoPreco : !!(p as Service).precoMinimo).length },
    { value: "fixo", label: "Preço Fixo", count: currentItems.filter(p => isProduct(p) ? !p.temVariacaoPreco : !(p as Service).precoMinimo).length }
  ], [currentItems])

  // 🚀 Memoizar itens únicos para performance
  const uniqueCategories = useMemo(() => [...new Set(currentItems.map(p => p.categoria))], [currentItems])
  
  // Filtrar items
  const filteredProducts = useMemo(() => currentItems.filter(product => {
    const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (isProduct(product) && product.sku?.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
                           (isProduct(product) && (
                             (filters.estoque.includes("baixo") && product.estoque < 10 && product.estoque > 0) ||
                             (filters.estoque.includes("normal") && product.estoque >= 10) ||
                             (filters.estoque.includes("zerado") && product.estoque === 0)
                           ))
    
    const matchesPreco = filters.preco.length === 0 ||
                         (isProduct(product) ? (
                           (filters.preco.includes("variacao") && product.temVariacaoPreco) ||
                           (filters.preco.includes("fixo") && !product.temVariacaoPreco)
                         ) : (
                           (filters.preco.includes("variacao") && !!product.precoMinimo) ||
                           (filters.preco.includes("fixo") && !product.precoMinimo)
                         ))
    
    return matchesSearch && matchesStatus && matchesCategoria && matchesDestacado && matchesEstoque && matchesPreco
  }), [currentItems, searchTerm, filters])

  const handleSelectProduct = (productId: number, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId])
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId))
    }
  }

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedProducts(filteredProducts.map(p => Number(p.id)))
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

  const handleToggleStatus = (productId: number | string) => {
    const product = products.find(p => String(p.id) === String(productId))
    if (!product) return
    
    updateProduct.mutate(
      { id: String(productId), data: { ativo: !product.ativo } },
      {
        onSuccess: () => {
          toast({
            title: product.ativo ? "Produto desativado!" : "Produto ativado!",
            description: `O produto foi ${product.ativo ? "desativado" : "ativado"} com sucesso.`,
          })
        },
        onError: () => {
          toast({
            title: "Erro!",
            description: "Não foi possível atualizar o produto.",
            variant: "destructive",
          })
        },
      }
    )
  }

  const handleToggleFeatured = (productId: number | string) => {
    const product = products.find(p => String(p.id) === String(productId))
    if (!product) return
    
    updateProduct.mutate(
      { id: String(productId), data: { destacado: !product.destacado } },
      {
        onSuccess: () => {
          toast({
            title: product.destacado ? "Produto removido dos destaques!" : "Produto destacado!",
            description: `O produto foi ${product.destacado ? "removido dos destaques" : "adicionado aos destaques"}.`,
          })
        },
        onError: () => {
          toast({
            title: "Erro!",
            description: "Não foi possível atualizar o produto.",
            variant: "destructive",
          })
        },
      }
    )
  }

  const handleDuplicate = (item: Product | Service) => {
    if (isProduct(item)) {
      const duplicatedProduct = {
        ...item,
        nome: `${item.nome} (Cópia)`,
        sku: item.sku ? `${item.sku}-COPY` : undefined,
        estoque: 0,
      }
      
      createProduct.mutate(duplicatedProduct, {
        onSuccess: () => {
          toast({
            title: "Produto duplicado!",
            description: `Uma cópia de "${item.nome}" foi criada.`,
          })
        },
        onError: () => {
          toast({
            title: "Erro!",
            description: "Não foi possível duplicar o produto.",
            variant: "destructive",
          })
        },
      })
    } else {
      const duplicatedService = {
        ...item,
        nome: `${item.nome} (Cópia)`,
      }
      
      createService.mutate(duplicatedService, {
        onSuccess: () => {
          toast({
            title: "Serviço duplicado!",
            description: `Uma cópia de "${item.nome}" foi criada.`,
          })
        },
        onError: () => {
          toast({
            title: "Erro!",
            description: "Não foi possível duplicar o serviço.",
            variant: "destructive",
          })
        },
      })
    }
  }

  const handleDelete = (item: Product | Service) => {
    if (isProduct(item)) {
      deleteProduct.mutate(item.id, {
        onSuccess: () => {
          setDeleteProductState(null)
          toast({
            title: "Produto excluído!",
            description: `O produto "${item.nome}" foi removido.`,
          })
        },
        onError: () => {
          toast({
            title: "Erro!",
            description: "Não foi possível excluir o produto.",
            variant: "destructive",
          })
        },
      })
    } else {
      deleteService.mutate(item.id, {
        onSuccess: () => {
          setDeleteProductState(null)
          toast({
            title: "Serviço excluído!",
            description: `O serviço "${item.nome}" foi removido.`,
          })
        },
        onError: () => {
          toast({
            title: "Erro!",
            description: "Não foi possível excluir o serviço.",
            variant: "destructive",
          })
        },
      })
    }
  }

  const handleBulkDelete = () => {
    const count = selectedProducts.length
    
    if (count === 0) {
      toast({
        title: "Nenhum item selecionado",
        description: currentTab === 'products' 
          ? "Selecione ao menos um produto para excluir." 
          : "Selecione ao menos um serviço para excluir.",
        variant: "destructive",
      })
      return
    }
    
    // 🚀 Usar função correta baseada na aba ativa
    if (currentTab === 'services') {
      deleteServices.mutate(selectedProducts.map(id => String(id)), {
        onSuccess: () => {
          setSelectedProducts([])
          setShowBulkDeleteDialog(false)
          toast({
            title: "Serviços excluídos!",
            description: `${count} serviço${count > 1 ? 's' : ''} ${count > 1 ? 'foram' : 'foi'} removido${count > 1 ? 's' : ''}.`,
          })
        },
        onError: () => {
          toast({
            title: "Erro!",
            description: "Não foi possível excluir os serviços.",
            variant: "destructive",
          })
        },
      })
    } else {
      deleteProducts.mutate(selectedProducts.map(id => String(id)), {
        onSuccess: () => {
          setSelectedProducts([])
          setShowBulkDeleteDialog(false)
          toast({
            title: "Produtos excluídos!",
            description: `${count} produto${count > 1 ? 's' : ''} foram removidos.`,
          })
        },
        onError: () => {
          toast({
            title: "Erro!",
            description: "Não foi possível excluir os produtos.",
            variant: "destructive",
          })
        },
      })
    }
  }

  const handleBulkToggleStatus = (active: boolean) => {
    const count = selectedProducts.length
    
    if (count === 0) {
      toast({
        title: "Nenhum item selecionado",
        description: currentTab === 'products' 
          ? "Selecione ao menos um produto para continuar." 
          : "Selecione ao menos um serviço para continuar.",
        variant: "destructive",
      })
      return
    }
    
    // 🚀 Usar função correta baseada na aba ativa
    if (currentTab === 'services') {
      updateServices.mutate(
        { ids: selectedProducts.map(id => String(id)), data: { ativo: active } },
        {
          onSuccess: () => {
            setSelectedProducts([])
            toast({
              title: `Serviços ${active ? "ativados" : "desativados"}!`,
              description: `${count} serviço${count > 1 ? 's' : ''} ${count > 1 ? 'foram' : 'foi'} ${active ? "ativado" : "desativado"}${count > 1 ? 's' : ''}.`,
            })
          },
          onError: () => {
            toast({
              title: "Erro!",
              description: "Não foi possível atualizar os serviços.",
              variant: "destructive",
            })
          },
        }
      )
    } else {
      updateProducts.mutate(
        { ids: selectedProducts.map(id => String(id)), data: { ativo: active } },
        {
          onSuccess: () => {
            setSelectedProducts([])
            toast({
              title: `Produtos ${active ? "ativados" : "desativados"}!`,
              description: `${count} produto${count > 1 ? 's' : ''} ${count > 1 ? 'foram' : 'foi'} ${active ? "ativado" : "desativado"}${count > 1 ? 's' : ''}.`,
            })
          },
          onError: () => {
            toast({
              title: "Erro!",
              description: "Não foi possível atualizar os produtos.",
              variant: "destructive",
            })
          },
        }
      )
    }
  }

  const handleProductFormSubmit = (formData: ProductFormData) => {
    if (editingProduct && isProduct(editingProduct)) {
      // Atualizar produto existente
      const productData = {
        ...formData,
        imagemUrl: formData.imagemUrl && formData.imagemUrl.trim() !== "" ? formData.imagemUrl : "",
      }
      
      updateProduct.mutate(
        { id: editingProduct.id, data: productData },
        {
          onSuccess: () => {
            setEditingProduct(null)
            toast({
              title: "Produto atualizado!",
              description: "O produto foi atualizado com sucesso.",
            })
          },
          onError: () => {
            toast({
              title: "Erro!",
              description: "Não foi possível atualizar o produto.",
              variant: "destructive",
            })
          },
        }
      )
    } else {
      // Criar novo produto
      const newProduct = {
        storeId: storeId,
        storeNome: "Construmax", // TODO: Pegar do usuário logado
        nome: formData.nome,
        categoria: formData.categoria,
        preco: formData.preco,
        estoque: formData.estoque,
        unidadeMedida: formData.unidadeMedida,
        rating: 0,
        ativo: formData.ativo,
        imagemUrl: formData.imagemUrl || "/placeholder.svg",
        sku: formData.sku,
        descricao: formData.descricao,
        destacado: formData.destacado,
        peso: formData.peso,
        dimensoes: formData.dimensoes,
        temVariacaoPreco: formData.temVariacaoPreco,
      }
      
      createProduct.mutate(newProduct, {
        onSuccess: () => {
          setShowCreateForm(false)
          toast({
            title: "Produto criado!",
            description: "O produto foi criado com sucesso.",
          })
        },
        onError: (err) => {
          console.error("Erro ao criar produto:", err)
          toast({
            title: "Erro!",
            description: "Não foi possível criar o produto. Verifique os dados e tente novamente.",
            variant: "destructive",
          })
        },
      })
    }
  }

  const handleServiceFormSubmit = (formData: ServiceFormData) => {
    if (editingProduct && isService(editingProduct)) {
      // Atualizar serviço existente
      updateService.mutate(
        { id: editingProduct.id, data: formData },
        {
          onSuccess: () => {
            setEditingProduct(null)
            toast({
              title: "Serviço atualizado!",
              description: "O serviço foi atualizado com sucesso.",
            })
          },
          onError: () => {
            toast({
              title: "Erro!",
              description: "Não foi possível atualizar o serviço.",
              variant: "destructive",
            })
          },
        }
      )
    } else {
      // Criar novo serviço
      const newService = {
        storeId: storeId,
        storeNome: "Construmax", // TODO: Pegar do usuário logado
        nome: formData.nome,
        categoria: formData.categoria,
        preco: formData.preco,
        precoMinimo: formData.precoMinimo,
        precoMaximo: formData.precoMaximo,
        tipoPrecificacao: formData.tipoPrecificacao,
        rating: 0,
        ativo: formData.ativo,
        imagemUrl: formData.imagemUrl || "/placeholder.svg",
        descricao: formData.descricao,
        destacado: formData.destacado,
      }
      
      createService.mutate(newService, {
        onSuccess: () => {
          setShowCreateForm(false)
          toast({
            title: "Serviço criado!",
            description: "O serviço foi criado com sucesso.",
          })
        },
        onError: (err) => {
          console.error("Erro ao criar serviço:", err)
          toast({
            title: "Erro!",
            description: "Não foi possível criar o serviço. Verifique os dados e tente novamente.",
            variant: "destructive",
          })
        },
      })
    }
  }


  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  const getTabLabel = () => {
    switch(currentTab) {
      case 'products': return 'Produtos'
      case 'services': return 'Serviços'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header com controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={currentTab === 'products' ? "Filtrar produtos..." : "Filtrar serviços..."}
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
                      className="group data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-900 pl-2"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <span className="mr-1.5 inline-flex h-4 w-4 rounded-[4px] border border-gray-400 group-data-[state=checked]:bg-blue-600 group-data-[state=checked]:border-blue-600"></span>
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
                        className="group data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-900 pl-2"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <span className="mr-1.5 inline-flex h-4 w-4 rounded-[4px] border border-gray-400 group-data-[state=checked]:bg-blue-600 group-data-[state=checked]:border-blue-600"></span>
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

            {/* Estoque Filter - Apenas para produtos */}
            {currentTab !== 'services' && (
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
                      className="group data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-900 pl-2"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <span className="mr-1.5 inline-flex h-4 w-4 rounded-[4px] border border-gray-400 group-data-[state=checked]:bg-blue-600 group-data-[state=checked]:border-blue-600"></span>
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
            )}

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
                      className="group data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-900 pl-2"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <span className="mr-1.5 inline-flex h-4 w-4 rounded-[4px] border border-gray-400 group-data-[state=checked]:bg-blue-600 group-data-[state=checked]:border-blue-600"></span>
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
                onClick={() => setShowBulkDeleteDialog(true)}
              >
                Excluir
              </Button>
            </div>
          )}
          
          {/* Dropdown de Tipo (Produtos/Serviços/Todos) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 min-w-[140px] justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>{getTabLabel()}</span>
                  <Badge variant="secondary" className="ml-1 h-5 w-auto px-1.5 text-xs">
                    {currentTab === 'products' ? products.length : services.length}
                  </Badge>
                </div>
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Tipo de Catálogo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  if (onTabChange) {
                    onTabChange('produtos')
                  } else {
                    setInternalTab('products')
                  }
                }}
                className={currentTab === 'products' ? 'bg-blue-50' : ''}
              >
                <Package className="h-4 w-4 mr-2" />
                <span className="flex-1">Produtos</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {products.length}
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  if (onTabChange) {
                    onTabChange('servicos')
                  } else {
                    setInternalTab('services')
                  }
                }}
                className={currentTab === 'services' ? 'bg-blue-50' : ''}
              >
                <Package className="h-4 w-4 mr-2" />
                <span className="flex-1">Serviços</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {services.length}
                </Badge>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {activeTab === 'produtos' && (
            <Button variant="outline" onClick={() => setShowImportDialog(true)}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Importar CSV
            </Button>
          )}
          
          <Button onClick={() => setShowCreateForm(true)}>
            <Package className="h-4 w-4 mr-2" />
            {activeTab === 'produtos' ? 'Novo Produto' : 'Novo Serviço'}
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
                    className="border border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">{currentTab === 'services' ? 'Serviço' : 'Produto'}</th>
                {activeTab !== 'servicos' && <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Unidade</th>}
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Preço</th>
                {activeTab !== 'servicos' && <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Estoque</th>}
                {activeTab === 'servicos' && <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Cobrança</th>}
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <ContextMenu key={product.id} modal={false}>
                  <ContextMenuTrigger asChild>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedProducts.includes(Number(product.id))}
                          onCheckedChange={(checked) => handleSelectProduct(Number(product.id), checked as boolean)}
                          className="border border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
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
                                {(isProduct(product) && product.temVariacaoPreco) || (isService(product) && product.precoMinimo) ? (
                                  <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    Consulta
                                  </Badge>
                                ) : null}
                                
                                {/* Badge de Estoque Baixo - Apenas produtos */}
                                {isProduct(product) && product.estoque < 10 && product.estoque > 0 && (
                                  <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Baixo
                                  </Badge>
                                )}
                                
                                {/* Badge de Sem Estoque - Apenas produtos */}
                                {isProduct(product) && product.estoque === 0 && (
                                  <Badge variant="outline" className="text-xs border-red-200 text-red-700">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Zerado
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {isProduct(product) && product.sku && (
                              <div className="text-xs text-gray-500 mt-1">
                                SKU: {product.sku}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      {currentTab !== 'services' && (
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {'unidadeMedida' in product ? product.unidadeMedida || "Unidade (un)" : "-"}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm font-medium">
                        {'temVariacaoPreco' in product ? (
                          product.temVariacaoPreco ? (
                            <span className="text-amber-600 font-medium">Sob consulta</span>
                          ) : (
                            `R$ ${product.preco.toFixed(2)}`
                          )
                        ) : (
                          (product as Service).precoMinimo != null && (product as Service).precoMaximo != null ? (
                            <div>
                              <span className="text-gray-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((product as Service).precoMinimo!)} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((product as Service).precoMaximo!)}</span>
                              <span className="text-xs text-gray-500 block">/{(product as Service).tipoPrecificacao}</span>
                            </div>
                          ) : (
                            <div>
                              <span className="text-gray-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.preco)}</span>
                              <span className="text-xs text-gray-500 block">/{(product as Service).tipoPrecificacao}</span>
                            </div>
                          )
                        )}
                      </td>
                      {currentTab !== 'services' && (
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={'estoque' in product && product.estoque > 0 ? "text-gray-900" : "text-red-600"}>
                              {'estoque' in product ? `${product.estoque} unidades` : "-"}
                            </span>
                            {isProduct(product) && product.estoque === 0 && (
                              <Badge variant="outline" className="text-xs border-red-200 text-red-700">
                                Zerado
                              </Badge>
                            )}
                            {isProduct(product) && product.estoque > 0 && product.estoque < 10 && (
                              <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                                Baixo
                              </Badge>
                            )}
                          </div>
                        </td>
                      )}
                      {currentTab === 'services' && (
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs capitalize">
                              {(product as Service).tipoPrecificacao}
                            </Badge>
                            {('precoMinimo' in product && (product as Service).precoMinimo != null) ? (
                              <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">Faixa</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Fixo</Badge>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTimeout(() => setEditingProduct(product), 0) }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleDuplicate(product) }}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleToggleStatus(product.id) }}>
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
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleToggleFeatured(product.id) }}>
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
                              onSelect={(e) => { e.preventDefault(); setDeleteProductState(product) }}
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
                    <ContextMenuItem onSelect={(e) => { e.preventDefault(); setTimeout(() => setEditingProduct(product), 0) }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Produto
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={(e) => { e.preventDefault(); handleDuplicate(product) }}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicar Produto
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onSelect={(e) => { e.preventDefault(); handleToggleStatus(product.id) }}>
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
                    <ContextMenuItem onSelect={(e) => { e.preventDefault(); handleToggleFeatured(product.id) }}>
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
                      onSelect={(e) => { e.preventDefault(); setDeleteProductState(product) }}
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

      {/* Forms - Produtos */}
      {editingProduct && isProduct(editingProduct) && (
        <ProductForm
          product={editingProduct}
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onSubmit={handleProductFormSubmit}
          storeId={storeId}
        />
      )}

      {showCreateForm && activeTab === 'produtos' && (
        <ProductForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleProductFormSubmit}
          storeId={storeId}
        />
      )}
      
      {/* Forms - Serviços */}
      {editingProduct && isService(editingProduct) && (
        <ServiceForm
          service={editingProduct}
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onSubmit={handleServiceFormSubmit}
        />
      )}

      {showCreateForm && activeTab === 'servicos' && (
        <ServiceForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleServiceFormSubmit}
        />
      )}

      {/* Delete Confirmation - Single Product */}
      <AlertDialog open={!!deleteProductState} onOpenChange={() => setDeleteProductState(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto "{deleteProductState?.nome}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductState && handleDelete(deleteProductState)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation - Bulk */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir {currentTab === 'products' ? 'Produtos' : 'Serviços'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedProducts.length} {currentTab === 'products' ? 'produto' : 'serviço'}{selectedProducts.length > 1 ? 's' : ''}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleBulkDelete()
                setShowBulkDeleteDialog(false)
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={currentTab === 'products' ? deleteProducts.isPending : deleteServices.isPending}
            >
              {currentTab === 'products' && deleteProducts.isPending ? "Excluindo..." : 
               currentTab === 'services' && deleteServices.isPending ? "Excluindo..." :
               `Excluir ${selectedProducts.length} ${currentTab === 'products' ? 'produto' : 'serviço'}${selectedProducts.length > 1 ? 's' : ''}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import CSV Dialog */}
      <ImportCSVDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        isImporting={bulkCreateProducts.isPending}
        onImport={(importedProducts) => {
          // Converter dados do CSV para formato de produto
          const productsToCreate = importedProducts.map(csvRow => ({
            storeId: String(storeId),
            nome: csvRow.nome || '',
            categoria: csvRow.categoria || '',
            preco: parseFloat(csvRow.preco) || 0,
            estoque: parseInt(csvRow.estoque) || 0,
            unidadeMedida: csvRow.unidadeMedida || 'Unidade (un)',
            sku: csvRow.sku || '',
            descricao: csvRow.descricao || '',
            imagemUrl: csvRow.imagemUrl || undefined,
            peso: csvRow.peso ? parseFloat(csvRow.peso) : undefined,
            ativo: true, // Todos criados como ativos
            destacado: false, // Nenhum criado como destacado
            temVariacaoPreco: false, // Sempre false
            rating: 0,
          }))

          // Executar importação em lote
          bulkCreateProducts.mutate(productsToCreate, {
            onSuccess: (results) => {
              toast({
                title: "Produtos importados!",
                description: `${results.length} produto(s) adicionados ao catálogo com sucesso.`,
              })
              setShowImportDialog(false)
            },
            onError: (error) => {
              toast({
                title: "Erro na importação",
                description: error instanceof Error ? error.message : "Não foi possível importar os produtos.",
                variant: "destructive",
              })
            },
          })
        }}
      />
    </div>
  )
}
