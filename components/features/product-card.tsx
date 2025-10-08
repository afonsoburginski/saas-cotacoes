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
import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ProductCardProps {
  product: Product
  variant?: "compact" | "detailed" | "modal"
}

export function ProductCard({ product, variant = "compact" }: ProductCardProps) {
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
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-500 text-yellow-500" : "fill-muted-foreground/20 text-muted-foreground/20"}`}
      />
    ))
  }

  // Modal variant - same UI as main page but optimized for smaller spaces
  if (variant === "modal") {
    return (
      <Card className="group relative overflow-hidden h-full p-0">
        <CardContent className="p-0">
          {/* Full-image card occupying entire card area */}
          <div className="relative w-full aspect-[4/5]">
            <Image
              src={imageSrc}
              alt={product.nome}
              fill
              className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
              onError={() => setImageSrc("/placeholder.svg?height=1000&width=800")}
              referrerPolicy="no-referrer"
            />

            {/* Category badge on hover */}
            <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Badge variant="secondary" className="text-[11px] px-2 py-1 font-semibold backdrop-blur-md">
                {product.categoria}
              </Badge>
            </div>

            {/* Overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 space-y-3">
                <h3 className="pointer-events-auto text-white font-bold text-base leading-snug line-clamp-2 drop-shadow">
                  {product.nome}
                </h3>
                <div className="pointer-events-auto flex items-center justify-between text-white/90 text-xs">
                  <span className="uppercase tracking-wide">
                    {product.storeNome}
                  </span>
                  <div className="flex items-center gap-0.5">{renderStars(product.rating)}</div>
                </div>
                <div className="pointer-events-auto flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 h-9 font-semibold shadow-md bg-[#22C55E] hover:bg-[#22C55E]/90 text-white"
                    onClick={() => generateSmartComparison(product)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Orçar
                  </Button>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      className={`h-9 px-3 font-semibold relative overflow-hidden ${
                        isRecentlyAdded ? "bg-green-500 hover:bg-green-600 text-white" : ""
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
                            <Check className="h-4 w-4 mr-2" />
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
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {product.estoque === 0 ? "Indisp." : "Carrinho"}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {/* Ripple effect */}
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
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group relative overflow-hidden h-full p-0">
      <CardContent className="p-0">
        {/* Full-image card occupying entire card area */}
        <div className="relative w-full aspect-[4/5]">
          <Image
            src={imageSrc}
            alt={product.nome}
            fill
            priority
            className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onError={() => setImageSrc("/placeholder.svg?height=1000&width=800")}
            referrerPolicy="no-referrer"
          />

          {/* Category badge on hover */}
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Badge variant="secondary" className="text-[11px] px-2 py-1 font-semibold backdrop-blur-md">
              {product.categoria}
            </Badge>
          </div>

          {/* Overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 space-y-3">
              <h3 className="pointer-events-auto text-white font-bold text-base leading-snug line-clamp-2 drop-shadow">
                {product.nome}
              </h3>
              <div className="pointer-events-auto flex items-center justify-between text-white/90 text-xs">
            <button 
              className="uppercase tracking-wide hover:text-white transition-colors underline text-left"
              onClick={(e) => {
                e.stopPropagation()
                // Trigger supplier modal - will be handled by parent
                window.dispatchEvent(new CustomEvent('openSupplierModal', { 
                  detail: { storeId: product.storeId } 
                }))
              }}
            >
              {product.storeNome}
            </button>
                <div className="flex items-center gap-0.5">{renderStars(product.rating)}</div>
              </div>
              <div className="pointer-events-auto flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 h-9 font-semibold shadow-md bg-[#22C55E] hover:bg-[#22C55E]/90 text-white"
                  onClick={() => generateSmartComparison(product)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Orçar
                </Button>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    className={`h-9 px-3 font-semibold relative overflow-hidden ${
                      isRecentlyAdded ? "bg-green-500 hover:bg-green-600 text-white" : ""
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
                          <Check className="h-4 w-4 mr-2" />
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
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {product.estoque === 0 ? "Indisp." : "Carrinho"}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Ripple effect */}
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
        </div>
      </CardContent>
    </Card>
  )
}
