"use client"

import { PageBackground } from "@/components/layout/page-background"
import { FornecedorAdaptive } from "@/components/fornecedor/fornecedor-adaptive"
import { useStore } from "@/hooks/use-stores"
import { useProducts } from "@/hooks/use-products"
import { useParams } from "next/navigation"

export default function FornecedorPage() {
  const params = useParams()
  const storeId = params.id as string
  
  const { data: storeData, isLoading: isLoadingStore } = useStore(storeId)
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({ storeId })

  const store = storeData
  const storeProducts = productsData?.data || []

  if (isLoadingStore || isLoadingProducts) {
    return (
      <>
        <PageBackground />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052FF] mx-auto mb-4"></div>
            <p className="text-gray-600 font-montserrat">Carregando fornecedor...</p>
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
      <FornecedorAdaptive store={store} storeProducts={storeProducts} />
    </>
  )
}
