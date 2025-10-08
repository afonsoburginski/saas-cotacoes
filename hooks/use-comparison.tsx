"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Product } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface ComparisonContextType {
  compareProducts: Product[]
  addToCompare: (product: Product) => void
  removeFromCompare: (productId: string) => void
  clearComparison: () => void
  isInComparison: (productId: string) => boolean
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined)

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [compareProducts, setCompareProducts] = useState<Product[]>([])
  const { toast } = useToast()

  const addToCompare = (product: Product) => {
    setCompareProducts((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        toast({
          title: "Produto já está na comparação",
          description: `${product.nome} já foi adicionado à comparação.`,
          variant: "default",
        })
        return prev
      }

      if (prev.length >= 4) {
        toast({
          title: "Limite atingido",
          description: "Você pode comparar no máximo 4 produtos por vez.",
          variant: "destructive",
        })
        return prev
      }

      toast({
        title: "Produto adicionado à comparação",
        description: `${product.nome} foi adicionado à comparação.`,
        variant: "default",
      })

      return [...prev, product]
    })
  }

  const removeFromCompare = (productId: string) => {
    setCompareProducts((prev) => {
      const product = prev.find((p) => p.id === productId)
      if (product) {
        toast({
          title: "Produto removido da comparação",
          description: `${product.nome} foi removido da comparação.`,
          variant: "default",
        })
      }
      return prev.filter((p) => p.id !== productId)
    })
  }

  const clearComparison = () => {
    if (compareProducts.length > 0) {
      toast({
        title: "Comparação limpa",
        description: "Todos os produtos foram removidos da comparação.",
        variant: "default",
      })
    }
    setCompareProducts([])
  }

  const isInComparison = (productId: string) => {
    return compareProducts.some((p) => p.id === productId)
  }

  return (
    <ComparisonContext.Provider
      value={{
        compareProducts,
        addToCompare,
        removeFromCompare,
        clearComparison,
        isInComparison,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  )
}

export function useComparison() {
  const context = useContext(ComparisonContext)
  if (context === undefined) {
    throw new Error("useComparison must be used within a ComparisonProvider")
  }
  return context
}
