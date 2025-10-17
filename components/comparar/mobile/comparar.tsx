"use client"

import { useEffect, useMemo, useState } from "react"
import { useSmartComparison } from "@/hooks/use-smart-comparison"
import { Button } from "@/components/ui/button"
import { TypographyH4, TypographyMuted, TypographySmall } from "@/components/ui/typography"
import { Star, Sparkles, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { PageBackground } from "@/components/layout/page-background"
import { useCartStore } from "@/stores/cart-store"
import { useToast } from "@/hooks/use-toast"

export function CompararMobile() {
  const { comparisonProducts, clearComparison } = useSmartComparison()
  const addToCart = useCartStore((state) => state.addToCart)
  const { toast } = useToast()
  const [activeProductId, setActiveProductId] = useState<string>("")
  const topRated = useMemo(() => {
    return [...comparisonProducts].sort((a, b) => b.rating - a.rating)[0]
  }, [comparisonProducts])
  const visibleProducts = useMemo(() => {
    return comparisonProducts.filter(p => !activeProductId || p.id === activeProductId)
  }, [comparisonProducts, activeProductId])

  useEffect(() => {
    // mobile page analytics/logs
  }, [comparisonProducts])

  if (comparisonProducts.length === 0) {
    return (
      <>
        <PageBackground />
        <div className="px-4 pt-4">
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 mx-auto text-white/70 mb-4" />
            <p className="text-lg font-bold text-white mb-2 font-marlin">Nenhuma comparação ativa</p>
            <p className="text-white/80 font-montserrat">Clique em "Comparação Inteligente" em qualquer produto para começar</p>
            <Button asChild className="mt-6 bg-white text-[#0052FF] hover:bg-white/90 font-montserrat">
              <Link href="/explorar">Explorar Produtos</Link>
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-[#0052FF] relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'url(/texture.png)',
            backgroundSize: '150px 150px',
            backgroundRepeat: 'repeat',
            mixBlendMode: 'overlay'
          }}
        />
        <div className="px-4 pt-4 pb-5 relative z-10 text-center">
          <TypographyH4 className="text-white font-montserrat mb-0">Comparação Inteligente</TypographyH4>
          <TypographyMuted className="text-white/80 font-montserrat">Veja diferenças principais entre produtos</TypographyMuted>
        </div>
      </div>

      {/* Summary chips */}
      <div className="px-4 mt-3">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 py-2">
            <button
              onClick={() => setActiveProductId("")}
              className={`px-3 py-2 rounded-full text-sm font-montserrat ${
                activeProductId === "" ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Todos
            </button>
            {comparisonProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProductId(p.id)}
                className={`px-3 py-2 rounded-full text-sm whitespace-nowrap font-montserrat ${
                  activeProductId === p.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {p.nome}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-5 py-4">
        {visibleProducts.map((product, idx) => (
          <div key={product.id} className={`bg-white rounded-2xl shadow-sm mx-4 overflow-hidden ${product.id === topRated?.id ? 'ring-2 ring-blue-500/50' : ''}`}>
            <div className="flex gap-3 p-4">
              <div className="relative h-16 w-16 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                <Image src={product.imagemUrl || "/placeholder.svg?height=80&width=80"} alt={product.nome} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <TypographySmall className="font-semibold truncate font-montserrat">{product.nome}</TypographySmall>
                  <Button
                    size="icon"
                    aria-label="Adicionar ao carrinho"
                    onClick={() => {
                      addToCart(product)
                      toast({ title: "🛒 Produto adicionado!", description: `${product.nome} foi adicionado ao carrinho.` })
                    }}
                    className="h-8 w-8 rounded-full bg-[#0052FF] hover:bg-[#0052FF]/90 text-white relative"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                  <span className="text-xs text-gray-600 ml-1 font-montserrat">({product.rating})</span>
                </div>
                <div className="mt-1 text-xs text-gray-600 font-montserrat">@{product.storeNome}</div>
                {/* No price on mobile */}
              </div>
            </div>

            {/* Highlight badge */}
            {product.id === topRated?.id && (
              <div className="px-4 pb-1 -mt-2">
                <span className="inline-block text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-montserrat">Recomendado</span>
              </div>
            )}

            {/* Key specs row */}
            <div className="border-t border-gray-100 px-4 py-3 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 font-montserrat">Categoria</div>
                <div className="text-sm text-gray-900 font-montserrat">{product.categoria}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-montserrat">Estoque</div>
                <div className="text-sm text-gray-900 font-montserrat">{product.estoque} un.</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-24">
        <Button variant="outline" onClick={clearComparison} className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 font-montserrat rounded-xl">Nova Comparação</Button>
      </div>
    </div>
  )
}


