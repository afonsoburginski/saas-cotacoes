"use client"

import { PageBackground } from "@/components/layout/page-background"
import { FornecedorAdaptive } from "@/components/fornecedor/fornecedor-adaptive"
import { mockStores, mockProducts } from "@/lib/mock-data"
import { useParams } from "next/navigation"

export default function FornecedorPage() {
  const params = useParams()
  const storeId = params.id as string
  
  // Mock data - em produção viria da API
  const store = mockStores.find(s => s.id === storeId) || mockStores[0]
  const storeProducts = mockProducts.filter(p => p.storeId === storeId).slice(0, 12)

  return (
    <>
      <PageBackground />
      <FornecedorAdaptive store={store} storeProducts={storeProducts} />
    </>
  )
}
