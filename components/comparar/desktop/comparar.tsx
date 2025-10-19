"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSmartComparison } from "@/hooks/use-smart-comparison"
import { useCartStore } from "@/stores/cart-store"
import { useToast } from "@/hooks/use-toast"
import { Star, ShoppingCart, ShoppingBag, Package } from "lucide-react"
import { TypographyH3, TypographyH4, TypographyMuted, TypographySmall } from "@/components/ui/typography"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"

function FallbackImage({ src, alt }: { src?: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src || "/placeholder.svg?height=80&width=80")
  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover"
      onError={() => setImgSrc("/placeholder.svg?height=80&width=80")}
      referrerPolicy="no-referrer"
    />
  )
}

export function CompararDesktop() {
  const { comparisonProducts, clearComparison } = useSmartComparison()
  const addToCart = useCartStore((state) => state.addToCart)
  const cartItems = useCartStore((state) => state.cartItems)
  const { toast } = useToast()
  const [activeProductId, setActiveProductId] = useState<string>("")

  const visibleProducts = useMemo(() => {
    return comparisonProducts.filter(p => !activeProductId || p.id === activeProductId)
  }, [comparisonProducts, activeProductId])

  useEffect(() => {
    // desktop page analytics/logs
  }, [comparisonProducts])

  if (comparisonProducts.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="bg-[#0052FF] relative overflow-hidden py-12">
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'url(/texture.png)',
              backgroundSize: '150px 150px',
              backgroundRepeat: 'repeat',
              mixBlendMode: 'overlay'
            }}
          />
          <div className="text-center relative z-10">
            <Package className="h-16 w-16 mx-auto text-white/70 mb-4" />
            <TypographyH3 className="text-white font-montserrat mb-2">Nenhuma comparação ativa</TypographyH3>
            <TypographyMuted className="text-white/80 font-montserrat">Clique em "Comparação Inteligente" em qualquer produto para começar</TypographyMuted>
            <Button asChild className="mt-6 bg-white text-[#0052FF] hover:bg-white/90 font-montserrat">
              <Link href="/explorar">Explorar Produtos</Link>
            </Button>
          </div>
        </div>
      </div>
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
        <div className="container mx-auto max-w-[1200px] px-6 py-8 relative z-10 text-center">
          <TypographyH3 className="text-white font-montserrat mb-2">Comparação Inteligente</TypographyH3>
          <TypographyMuted className="text-white/80 font-montserrat">Veja diferenças principais entre produtos</TypographyMuted>
        </div>
      </div>

      <div className="container mx-auto max-w-[1200px] px-6 py-6">
        {/* Filter chips */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveProductId("")}
              className={`px-4 py-2 rounded-lg text-sm font-montserrat transition-colors ${
                activeProductId === "" ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Todos ({comparisonProducts.length})
            </button>
            {comparisonProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProductId(p.id)}
                className={`px-4 py-2 rounded-lg text-sm font-montserrat transition-colors ${
                  activeProductId === p.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {p.nome}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="default" className="font-montserrat relative">
              <Link href="/carrinho">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Ver Carrinho
                {cartItems.length > 0 && (
                  <Badge className="ml-2 h-5 min-w-5 rounded-full px-1.5 text-xs">
                    {cartItems.length}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button variant="outline" onClick={clearComparison} className="font-montserrat">
              Nova Comparação
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleProducts.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all relative"
            >
              {/* Image - Full Width, Maior */}
              <div className="relative h-80 w-full bg-gray-50 overflow-hidden">
                <FallbackImage src={product.imagemUrl} alt={product.nome} />
              </div>

              <div className="p-4">
                {/* Product Info - Comprimido */}
                <div className="flex flex-col">
                  <TypographyH4 className="font-montserrat mb-2 line-clamp-2">{product.nome}</TypographyH4>

                  <div className="space-y-2 mb-3">
                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < Math.floor(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <TypographySmall className="text-gray-600 font-montserrat text-xs">{product.rating}</TypographySmall>
                    </div>

                    {/* Store & Category */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 font-montserrat text-xs">
                        {product.storeNome}
                      </Badge>
                      <Badge variant="outline" className="border-gray-200 text-gray-600 font-montserrat text-xs">
                        {product.categoria}
                      </Badge>
                    </div>

                    {/* Stock */}
                    <div>
                      <TypographySmall className={`font-montserrat text-xs ${product.estoque > 0 ? 'text-gray-600' : 'text-red-600'}`}>
                        {product.estoque > 0 ? `${product.estoque} unidades` : 'Sem estoque'}
                      </TypographySmall>
                    </div>
                  </div>

                  {/* Add to Cart - Sempre no final */}
                  <Button
                    onClick={() => {
                      addToCart(product, 1)
                      toast({
                        title: "Produto adicionado",
                        description: `${product.nome} foi adicionado ao carrinho`,
                      })
                    }}
                    className="w-full bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-montserrat text-sm h-9"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Adicionar ao Carrinho
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue */}
        <div className="text-center mt-8">
          <Button asChild variant="outline" className="font-montserrat">
            <Link href="/explorar">Continuar Explorando</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}


