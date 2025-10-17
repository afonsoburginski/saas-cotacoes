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

export function CompararDesktop() {
  const { comparisonProducts, clearComparison } = useSmartComparison()
  const addToCart = useCartStore((state) => state.addToCart)
  const recentlyAdded = useCartStore((state) => state.recentlyAdded)
  const createList = useListsStore((state) => state.createList)
  const { toast } = useToast()
  const [sortBy, setSortBy] = useState<"preco" | "rating">("preco")

  useEffect(() => {
    // desktop page analytics/logs
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
              <Sparkles className="h-16 w-16 mx-auto text-[#0052FF]/40 mb-4" />
              <p className="text-lg font-bold text-gray-900 mb-2 font-marlin">Nenhuma comparação ativa</p>
              <p className="text-gray-600 font-montserrat">Clique em "Comparação Inteligente" em qualquer produto para começar</p>
            </div>
            <Button asChild className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-montserrat">
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="flex items-center justify-end pt-4 px:4 md:px-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSortBy(sortBy === "preco" ? "rating" : "preco")} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-montserrat">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Ordenar por {sortBy === "preco" ? "Avaliação" : "Preço"}
            </Button>
            <Button variant="outline" onClick={clearComparison} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-montserrat">
              Nova Comparação
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}>
          <Card className="border-gray-200 bg-white rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 font-marlin">
                <Sparkles className="h-5 w-5 text-[#0052FF]" />
                Comparação Inteligente ({comparisonProducts.length} produtos)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32 text-gray-700 font-bold font-montserrat">Produto</TableHead>
                      {sortedProducts.map((product) => (
                        <TableHead key={product.id} className="min-w-48 text-gray-900 font-montserrat">
                          <div className="flex items-center justify-between">
                            <span className="truncate font-semibold">{product.nome}</span>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-semibold text-gray-700 font-montserrat">Imagem</TableCell>
                      {sortedProducts.map((product) => (
                        <TableCell key={product.id}>
                          <div className="aspect-square w-20 relative bg-gray-50 rounded-lg overflow-hidden">
                            <FallbackImage src={product.imagemUrl} alt={product.nome} />
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold text-gray-700 font-montserrat">Loja</TableCell>
                      {sortedProducts.map((product) => (
                        <TableCell key={product.id}>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700 font-montserrat">{product.storeNome}</Badge>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold text-gray-700 font-montserrat">Preço</TableCell>
                      {sortedProducts.map((product) => (
                        <TableCell key={product.id}>
                          <div className="text-lg font-bold text-[#0052FF] font-montserrat">{formatPrice(product.preco)}</div>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold text-gray-700 font-montserrat">Estoque</TableCell>
                      {sortedProducts.map((product) => (
                        <TableCell key={product.id}>
                          <span className={`${product.estoque > 0 ? "text-gray-600" : "text-red-600"} font-montserrat`}>
                            {product.estoque} unidades
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold text-gray-700 font-montserrat">Avaliação</TableCell>
                      {sortedProducts.map((product) => (
                        <TableCell key={product.id}>
                          <div className="flex items-center gap-1">
                            {renderStars(product.rating)}
                            <span className="text-sm text-gray-600 ml-1 font-montserrat">({product.rating})</span>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold text-gray-700 font-montserrat">Categoria</TableCell>
                      {sortedProducts.map((product) => (
                        <TableCell key={product.id}>
                          <Badge variant="outline" className="border-gray-200 text-gray-700 font-montserrat">{product.categoria}</Badge>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="text-center pb-6">
          <Button asChild variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 font-montserrat">
            <Link href="/explorar">Continuar Explorando</Link>
          </Button>
        </motion.div>
      </motion.div>
    </>
  )
}


