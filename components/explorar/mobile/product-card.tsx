"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Sparkles, Loader2, Check } from "lucide-react"
import type { Product } from "@/lib/types"
import { useSmartComparison } from "@/hooks/use-smart-comparison"
import { useCartStore } from "@/stores/cart-store"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ProductCardMobileProps {
  product: Product
}

export function ProductCardMobile({ product }: ProductCardMobileProps) {
  const { generateSmartComparison, isLoading } = useSmartComparison()
  const addToCart = useCartStore((state) => state.addToCart)
  const recentlyAdded = useCartStore((state) => state.recentlyAdded)
  const { toast } = useToast()
  
  const isRecentlyAdded = recentlyAdded === product.id

  const handleAddToCart = () => {
    addToCart(product)
    toast({
      title: "🛒 Produto adicionado!",
      description: `${product.nome} foi adicionado ao carrinho.`,
    })
  }

  const [imageSrc, setImageSrc] = useState(
    product.imagemUrl || "/placeholder.svg?height=1000&width=800"
  )

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < Math.floor(rating) ? "fill-yellow-500 text-yellow-500" : "fill-muted-foreground/20 text-muted-foreground/20"}`}
      />
    ))
  }

  return (
    <Card className="relative overflow-hidden h-full p-0 border border-gray-200 rounded-xl shadow-sm">
      <CardContent className="p-0">
        {/* Imagem com botões sempre visíveis */}
        <div className="relative w-full aspect-[4/5]">
          <Image
            src={imageSrc}
            alt={product.nome}
            fill
            className="object-cover w-full h-full"
            sizes="50vw"
            onError={() => setImageSrc("/placeholder.svg?height=1000&width=800")}
            referrerPolicy="no-referrer"
          />

          {/* Category badge sempre visível */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-semibold backdrop-blur-md bg-white/90 text-gray-900 border-0">
              {product.categoria}
            </Badge>
          </div>

          {/* Overlay sempre visível no mobile */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3 space-y-2">
              <h3 className="text-white font-bold text-xs leading-tight line-clamp-2 drop-shadow-lg font-marlin">
                {product.nome}
              </h3>
              <div className="flex items-center justify-between text-white/90 text-[10px]">
                <button 
                  className="uppercase tracking-wide hover:text-white transition-colors underline text-left font-montserrat"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.dispatchEvent(new CustomEvent('openSupplierModal', { 
                      detail: { storeId: product.storeId } 
                    }))
                  }}
                >
                  {product.storeNome}
                </button>
                <div className="flex items-center gap-0.5">{renderStars(product.rating)}</div>
              </div>
              {/* Botão Orçar/Comparar removido */}
              <motion.div whileTap={{ scale: 0.95 }} className="w-full">
                <Button
                  variant="secondary"
                  size="sm"
                  className={`w-full h-8 font-semibold relative overflow-hidden text-xs font-montserrat ${
                    isRecentlyAdded ? "bg-green-500 hover:bg-green-600 text-white" : "bg-[#0052FF] hover:bg-[#0052FF]/90 text-white"
                  }`}
                  onClick={handleAddToCart}
                  disabled={product.estoque === 0}
                >
                  <AnimatePresence mode="wait">
                    {isRecentlyAdded ? (
                      <motion.div
                        key="added"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="flex items-center"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Adicionado!
                      </motion.div>
                    ) : (
                      <motion.div
                        key="add"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="flex items-center"
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        {product.estoque === 0 ? "Indisponível" : "Carrinho"}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {isRecentlyAdded && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 bg-white/30 rounded-sm"
                    />
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

