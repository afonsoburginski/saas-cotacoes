"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createRealtimeSubscription } from "@/lib/supabase"
import { PageBackground } from "@/components/layout/page-background"
import { FornecedorAdaptive } from "@/components/fornecedor/fornecedor-adaptive"
import { useStore } from "@/hooks/use-stores"
import { useProducts } from "@/hooks/use-products"
import { useServices } from "@/hooks/use-services"
import { useParams } from "next/navigation"

export default function FornecedorPage() {
  const params = useParams()
  const storeId = params.id as string
  const queryClient = useQueryClient()
  
  const { data: storeData, isLoading: isLoadingStore } = useStore(storeId)
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({ storeId })
  const { data: servicesData, isLoading: isLoadingServices } = useServices({ storeId })

  const store = storeData
  const storeProducts = productsData?.data || []
  const storeServices = servicesData?.data || []
  
  // 🔴 REALTIME específico para esta store
  useEffect(() => {
    console.log('🔴 Realtime ativado para perfil da loja:', storeId)
    
    const channelProducts = createRealtimeSubscription('products', () => {
      console.log('🔄 Produtos atualizados - refetch')
      queryClient.invalidateQueries({ queryKey: ["products", { storeId }] })
    })
    
    const channelServices = createRealtimeSubscription('services', () => {
      console.log('🔄 Serviços atualizados - refetch')
      queryClient.invalidateQueries({ queryKey: ["services", { storeId }] })
    })
    
    const channelStore = createRealtimeSubscription('stores', () => {
      console.log('🔄 Dados da loja atualizados - refetch')
      queryClient.invalidateQueries({ queryKey: ["store", storeId] })
    })
    
    return () => {
      channelProducts.unsubscribe()
      channelServices.unsubscribe()
      channelStore.unsubscribe()
      console.log('🔴 Realtime desativado para:', storeId)
    }
  }, [storeId, queryClient])

  if (isLoadingStore || isLoadingProducts || isLoadingServices) {
    return (
      <>
        <PageBackground />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052FF] mx-auto mb-4"></div>
            <p className="text-gray-600 font-montserrat">Carregando...</p>
          </div>
        </div>
      </>
    )
  }

  if (!store) {
    return (
      <>
        <PageBackground />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600 font-montserrat">Fornecedor não encontrado</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageBackground />
      <FornecedorAdaptive 
        store={store} 
        storeProducts={storeProducts}
        storeServices={storeServices}
      />
    </>
  )
}
