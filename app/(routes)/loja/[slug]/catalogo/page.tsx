"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "@/lib/auth-client"
import { useQueryClient } from "@tanstack/react-query"
import { createRealtimeSubscription } from "@/lib/supabase"
import { ProductTable } from "@/components/products/product-table"
import { LojaHeader } from "@/components/loja/loja-header"
import { useProducts } from "@/hooks/use-products"
import { useServices } from "@/hooks/use-services"
import { Package, Star, TrendingUp, TrendingDown, AlertTriangle, Wrench, Clock, DollarSign } from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardAction, 
  CardFooter 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { CatalogoSkeleton } from "@/components/loja/catalogo-skeleton"
import { useStoreSlug } from "@/hooks/use-store-slug"

interface CatalogoPageProps {
  params: { slug: string }
}

export default function CatalogoPage({ params }: CatalogoPageProps) {
  const { slug } = params
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  
  // 🚀 Usar hook otimizado com cache (já disponível instantaneamente)
  const { data: storeSlugData } = useStoreSlug()
  const storeId = storeSlugData?.id?.toString()
  
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<'produtos' | 'servicos'>('produtos')
  
  // Carregar tab salva do localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem('catalogo_active_tab') as 'produtos' | 'servicos'
    if (savedTab && (savedTab === 'produtos' || savedTab === 'servicos')) {
      setActiveTab(savedTab)
    }
  }, [])
  
  // Salvar tab no localStorage quando mudar
  const handleTabChange = (tab: 'produtos' | 'servicos') => {
    setActiveTab(tab)
    localStorage.setItem('catalogo_active_tab', tab)
  }
  
  // Verificar pagamento confirmado
  useEffect(() => {
    if (storeId) {
      const paymentConfirmed = localStorage.getItem('payment_confirmed')
      if (paymentConfirmed === 'true') {
        localStorage.removeItem('payment_confirmed')
        setTimeout(() => setShowSuccessDialog(true), 1000)
      }
    }
  }, [storeId])
  
  // 🚀 Buscar dados com hooks otimizados (cache automático)
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({ 
    storeId: storeId || undefined,
    includeInactive: true
  })
  
  const { data: servicesData, isLoading: isLoadingServices } = useServices({ 
    storeId: storeId || undefined,
    includeInactive: true
  })

  const products = productsData?.data || []
  const services = servicesData?.data || []
  
  // 🚀 Não mostrar loading se já tem dados em cache
  const hasProducts = products.length > 0
  const hasServices = services.length > 0
  const hasCachedData = hasProducts || hasServices
  
  // Só mostrar skeleton se realmente está carregando E não tem dados em cache
  const isLoading = (isLoadingProducts || isLoadingServices) && !hasCachedData
  
  // 🔴 REALTIME para catálogo da loja
  useEffect(() => {
    if (!storeId) return
    
    console.log('🔴 Realtime ativado para catálogo da loja:', storeId)
    
    const channelProducts = createRealtimeSubscription('products', () => {
      console.log('🔄 Produtos do catálogo atualizados')
      queryClient.invalidateQueries({ queryKey: ["products"] })
    })
    
    const channelServices = createRealtimeSubscription('services', () => {
      console.log('🔄 Serviços do catálogo atualizados')
      queryClient.invalidateQueries({ queryKey: ["services"] })
    })
    
    return () => {
      channelProducts.unsubscribe()
      channelServices.unsubscribe()
      console.log('🔴 Realtime desativado para loja:', storeId)
    }
  }, [storeId, queryClient])
  
  // 🚀 Estatísticas memoizadas para performance
  const isProductsTab = activeTab === 'produtos'
  const currentItems = isProductsTab ? products : services
  
  const stats = useMemo(() => {
    const totalItems = currentItems.length
    const activeItems = currentItems.filter(item => item.ativo).length
    const featuredItems = currentItems.filter(item => item.destacado).length
    const warningItems = isProductsTab 
      ? products.filter(p => p.estoque < 10).length
      : services.filter(s => !s.preco || s.preco <= 0).length
    
    return { totalItems, activeItems, featuredItems, warningItems }
  }, [currentItems, isProductsTab, products, services])
  
  const { totalItems, activeItems, featuredItems, warningItems } = stats

  return (
    <>
      <LojaHeader storeName={storeSlugData?.storeName} title="Catálogo" />
      
      {isLoading ? (
        <CatalogoSkeleton />
      ) : (
        <>
          {/* Estatísticas Dinâmicas - Mudam conforme a tab */}
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <Card className="@container/card">
              <CardHeader className="grid grid-cols-[1fr_auto] grid-rows-[auto_auto]">
                <CardDescription className="text-gray-600">
                  Total de {isProductsTab ? 'Produtos' : 'Serviços'}
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-gray-900">
                  {totalItems}
                </CardTitle>
                <CardAction className="col-start-2 row-start-1 row-end-2 self-center">
                  <Badge variant="outline" className="gap-1.5 px-2.5 py-1">
                    <TrendingUp className="size-3" />
                    {activeItems}/{totalItems}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Catálogo ativo <TrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  {activeItems} {isProductsTab ? 'produtos' : 'serviços'} disponíveis
                </div>
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader className="grid grid-cols-[1fr_auto] grid-rows-[auto_auto]">
                <CardDescription className="text-gray-600">
                  {isProductsTab ? 'Produtos' : 'Serviços'} Ativos
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-gray-900">
                  {activeItems}
                </CardTitle>
                <CardAction className="col-start-2 row-start-1 row-end-2 self-center">
                  <Badge variant="outline" className="gap-1.5 px-2.5 py-1">
                    <TrendingUp className="size-3" />
                    {totalItems > 0 ? Math.round((activeItems / totalItems) * 100) : 0}%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Alta disponibilidade <TrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  {isProductsTab ? 'Produtos prontos para venda' : 'Serviços prontos para contratação'}
                </div>
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader className="grid grid-cols-[1fr_auto] grid-rows-[auto_auto]">
                <CardDescription className="text-gray-600">Em Destaque</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-gray-900">
                  {featuredItems}
                </CardTitle>
                <CardAction className="col-start-2 row-start-1 row-end-2 self-center">
                  <Badge variant="outline" className="gap-1.5 px-2.5 py-1">
                    <Star className="size-3" />
                    Promovidos
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  {isProductsTab ? 'Produtos' : 'Serviços'} em destaque <Star className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Maior visibilidade no marketplace
                </div>
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader className="grid grid-cols-[1fr_auto] grid-rows-[auto_auto]">
                <CardDescription className="text-gray-600">
                  {isProductsTab ? 'Estoque Baixo' : 'Sem Preço'}
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-gray-900">
                  {warningItems}
                </CardTitle>
                <CardAction className="col-start-2 row-start-1 row-end-2 self-center">
                  {warningItems > 0 ? (
                    <Badge variant="outline" className="text-red-600 gap-1.5 px-2.5 py-1">
                      <AlertTriangle className="size-3" />
                      Atenção
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600 gap-1.5 px-2.5 py-1">
                      <TrendingUp className="size-3" />
                      OK
                    </Badge>
                  )}
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  {warningItems > 0 ? (
                    <>
                      {isProductsTab ? 'Requer reposição' : 'Precisa definir preço'} 
                      <AlertTriangle className="size-4" />
                    </>
                  ) : (
                    <>
                      {isProductsTab ? 'Estoque saudável' : 'Preços definidos'} 
                      <TrendingUp className="size-4" />
                    </>
                  )}
                </div>
                <div className="text-muted-foreground">
                  {isProductsTab 
                    ? (warningItems > 0 ? "Produtos com menos de 10 unidades" : "Todos os produtos estocados")
                    : (warningItems > 0 ? "Serviços sem preço definido" : "Todos os serviços com preço")
                  }
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Tabela de Catálogo (Produtos e Serviços) - só renderiza com storeId válido */}
          {storeId ? (
            <ProductTable 
              storeId={storeId}
              isLoading={isLoading}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">Carregando catálogo...</div>
          )}
        </>
      )}

      {/* Dialog de Sucesso de Pagamento */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex justify-center mb-6"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-3 font-marlin">
                Pagamento Confirmado! 🎉
              </h2>
              <p className="text-gray-600 mb-6 font-montserrat">
                Sua assinatura está ativa! Comece cadastrando seus produtos e serviços.
              </p>

              <Button
                onClick={() => setShowSuccessDialog(false)}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12"
              >
                Começar Agora
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
