"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { Product } from "@/lib/types"
import { findSimilarProducts, findBestProductsForCategory } from "@/lib/smart-comparison"
import { mockProducts } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

interface SmartComparisonContextType {
  comparisonProducts: Product[]
  isLoading: boolean
  loadingStates: Array<{ text: string }>

  generateSmartComparison: (baseProduct: Product) => Promise<void>
  generateCategoryComparison: (categoria: string) => Promise<void>
  clearComparison: () => void
  isInComparison: (productId: string) => boolean
}

const SmartComparisonContext = createContext<SmartComparisonContextType | undefined>(undefined)

export function SmartComparisonProvider({ children }: { children: React.ReactNode }) {
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStates, setLoadingStates] = useState<Array<{ text: string }>>([])
  const { toast } = useToast()
  const router = useRouter()

  const generateSmartComparison = useCallback(
    async (baseProduct: Product) => {
      console.log("[v0] Starting smart comparison for product:", baseProduct.nome)
      setIsLoading(true)

      setLoadingStates([
        { text: "🔍 Analisando produto selecionado..." },
        { text: "🧠 Processando características técnicas..." },
        { text: "📊 Comparando com produtos similares..." },
        { text: "⚡ Calculando compatibilidade..." },
        { text: "✨ Finalizando comparação inteligente..." },
      ])

      await new Promise((resolve) => setTimeout(resolve, 1200))
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await new Promise((resolve) => setTimeout(resolve, 800))
      await new Promise((resolve) => setTimeout(resolve, 600))

      const similarProducts = findSimilarProducts(baseProduct, mockProducts, 3)
      console.log("[v0] Found similar products:", similarProducts.length)

      const productsToCompare = [baseProduct, ...similarProducts.map((s) => s.product)]
      console.log(
        "[v0] Products to compare:",
        productsToCompare.map((p) => p.nome),
      )

      setComparisonProducts(productsToCompare)

      await new Promise((resolve) => setTimeout(resolve, 400))

      setIsLoading(false)

      toast({
        title: "✨ Comparação pronta!",
        description: `${similarProducts.length + 1} produtos selecionados para comparação`,
      })

      console.log("[v0] Navigating to comparison page with products:", productsToCompare.length)
      router.push("/comparar")
    },
    [toast, router],
  )

  const generateCategoryComparison = useCallback(
    async (categoria: string) => {
      console.log("[v0] Starting category comparison for:", categoria)
      setIsLoading(true)

      setLoadingStates([
        { text: `🎯 Selecionando produtos de ${categoria}...` },
        { text: "📊 Analisando avaliações e preços..." },
        { text: "🏆 Ordenando por qualidade..." },
        { text: "⚖️ Comparando custo-benefício..." },
        { text: "✅ Seleção dos melhores concluída!" },
      ])

      await new Promise((resolve) => setTimeout(resolve, 1000))
      await new Promise((resolve) => setTimeout(resolve, 800))
      await new Promise((resolve) => setTimeout(resolve, 600))
      await new Promise((resolve) => setTimeout(resolve, 500))

      const bestProducts = findBestProductsForCategory(categoria, mockProducts, 4)
      console.log("[v0] Found best products for category:", bestProducts.length)

      setComparisonProducts(bestProducts)

      await new Promise((resolve) => setTimeout(resolve, 300))

      setIsLoading(false)

      toast({
        title: "🏆 Top produtos selecionados!",
        description: `${bestProducts.length} melhores produtos de ${categoria}`,
      })

      console.log("[v0] Navigating to comparison page with category products:", bestProducts.length)
      router.push("/comparar")
    },
    [toast, router],
  )

  const clearComparison = useCallback(() => {
    console.log("[v0] Clearing comparison")
    setComparisonProducts([])
    toast({
      title: "🗑️ Comparação limpa",
      description: "Pronto para uma nova comparação!",
    })
  }, [toast])

  const isInComparison = useCallback(
    (productId: string) => {
      return comparisonProducts.some((p) => p.id === productId)
    },
    [comparisonProducts],
  )

  console.log("[v0] Current comparison products count:", comparisonProducts.length)

  return (
    <SmartComparisonContext.Provider
      value={{
        comparisonProducts,
        isLoading,
        loadingStates,
        generateSmartComparison,
        generateCategoryComparison,
        clearComparison,
        isInComparison,
      }}
    >
      {children}
    </SmartComparisonContext.Provider>
  )
}

export function useSmartComparison() {
  const context = useContext(SmartComparisonContext)
  if (context === undefined) {
    throw new Error("useSmartComparison must be used within a SmartComparisonProvider")
  }
  return context
}
