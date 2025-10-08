"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useSmartComparison } from "@/hooks/use-smart-comparison"
import { useCartStore } from "@/stores/cart-store"
import { useListsStore } from "@/stores/lists-store"
import { useToast } from "@/hooks/use-toast"
import { Star, ShoppingCart, ArrowUpDown, Sparkles, Check } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PageBackground } from "@/components/layout/page-background"

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

export default function CompararPage() {
  const { comparisonProducts, clearComparison } = useSmartComparison()
  const addToCart = useCartStore((state) => state.addToCart)
  const recentlyAdded = useCartStore((state) => state.recentlyAdded)
  const createList = useListsStore((state) => state.createList)
  const { toast } = useToast()
  const [sortBy, setSortBy] = useState<"preco" | "rating">("preco")

  const handleQuoteAll = () => {
    const cartItems = comparisonProducts.map(product => ({
      id: `quote-${Date.now()}-${product.id}`,
      productId: product.id,
      storeId: product.storeId,
      qty: 1,
      productNome: product.nome,
      storeNome: product.storeNome,
      precoUnit: product.preco,
    }))
    
    createList(
      `Orçamento Comparativo - ${comparisonProducts[0]?.categoria || 'Produtos'}`,
      cartItems,
      `Orçamento gerado automaticamente com ${comparisonProducts.length} produtos da comparação inteligente`
    )
    
    toast({
      title: "🧾 Orçamento comparativo gerado!",
      description: `Orçamento com ${comparisonProducts.length} produtos foi criado nas suas listas.`,
    })
  }

  useEffect(() => {
    console.log("[v0] Comparison page loaded, products:", comparisonProducts.length)
    console.log(
      "[v0] Products:",
      comparisonProducts.map((p) => p.nome),
    )
  }, [comparisonProducts])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  const sortedProducts = [...comparisonProducts].sort((a, b) => {
    if (sortBy === "preco") return a.preco - b.preco
    return b.rating - a.rating
  })

  if (comparisonProducts.length === 0) {
    return (
      <>
        <PageBackground />
        <div className="space-y-6 pt-4 px-4">

        <div className="text-center py-12">
          <div className="mb-6">
            <Sparkles className="h-16 w-16 mx-auto text-primary/40 mb-4" />
            <p className="text-lg font-medium mb-2">Nenhuma comparação ativa</p>
            <p className="text-muted-foreground">Clique em "Comparação Inteligente" em qualquer produto para começar</p>
          </div>
          <Button asChild>
            <Link href="/explorar">Explorar Produtos</Link>
          </Button>
        </div>
      </div>
      </>
    )
  }

  return (
    <>
      <PageBackground />
      <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-6"
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="flex items-center justify-end pt-4 px-4"
      >
        <div className="flex gap-2">
          <Button onClick={handleQuoteAll} className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white">
            <Sparkles className="h-4 w-4 mr-2" />
            Gerar Orçamento
          </Button>
          <Button variant="outline" onClick={() => setSortBy(sortBy === "preco" ? "rating" : "preco")}>
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Ordenar por {sortBy === "preco" ? "Avaliação" : "Preço"}
          </Button>
          <Button variant="outline" onClick={clearComparison}>
            Nova Comparação
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
      >
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Comparação Inteligente ({comparisonProducts.length} produtos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Produto</TableHead>
                  {sortedProducts.map((product) => (
                    <TableHead key={product.id} className="min-w-48">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{product.nome}</span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Imagem</TableCell>
                  {sortedProducts.map((product) => (
                    <TableCell key={product.id}>
                      <div className="aspect-square w-20 relative bg-gray-50 rounded-lg overflow-hidden">
                        <FallbackImage
                          src={product.imagemUrl}
                          alt={product.nome}
                        />
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Loja</TableCell>
                  {sortedProducts.map((product) => (
                    <TableCell key={product.id}>
                      <Badge variant="secondary">{product.storeNome}</Badge>
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Preço</TableCell>
                  {sortedProducts.map((product) => (
                    <TableCell key={product.id}>
                      <div className="text-lg font-bold text-primary">{formatPrice(product.preco)}</div>
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Estoque</TableCell>
                  {sortedProducts.map((product) => (
                    <TableCell key={product.id}>
                      <span className={product.estoque > 0 ? "text-neutral-600" : "text-red-600"}>
                        {product.estoque} unidades
                      </span>
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Avaliação</TableCell>
                  {sortedProducts.map((product) => (
                    <TableCell key={product.id}>
                      <div className="flex items-center gap-1">
                        {renderStars(product.rating)}
                        <span className="text-sm text-muted-foreground ml-1">({product.rating})</span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Categoria</TableCell>
                  {sortedProducts.map((product) => (
                    <TableCell key={product.id}>
                      <Badge variant="outline">{product.categoria}</Badge>
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Ações</TableCell>
                  {sortedProducts.map((product) => {
                    const isRecentlyAdded = recentlyAdded === product.id
                    return (
                      <TableCell key={product.id}>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            size="sm"
                            onClick={() => {
                              addToCart(product)
                              toast({
                                title: "🛒 Produto adicionado!",
                                description: `${product.nome} foi adicionado ao carrinho.`,
                              })
                            }}
                            disabled={product.estoque === 0}
                            className={`w-full relative overflow-hidden ${
                              isRecentlyAdded ? "bg-green-500 hover:bg-green-600 text-white" : ""
                            }`}
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
                                  Adicionar
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
                      </TableCell>
                    )
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
        </Card>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-center"
      >
        <Button asChild variant="outline">
          <Link href="/explorar">Continuar Explorando</Link>
        </Button>
      </motion.div>
    </motion.div>
    </>
  )
}
