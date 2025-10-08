"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, MapPin, Phone, Clock, TrendingUp, Package } from "lucide-react"
import type { Store } from "@/lib/types"
import { mockProducts, mockReviews } from "@/lib/mock-data"
import Image from "next/image"

interface StoreDetailProps {
  store: Store
}

export function StoreDetail({ store }: StoreDetailProps) {
  // Produtos da loja
  const storeProducts = mockProducts.filter(p => p.storeId === store.id && p.ativo).slice(0, 6)
  
  // Reviews da loja
  const storeReviews = mockReviews.filter(r => r.storeId === store.id && r.status === "aprovado").slice(0, 3)
  
  const avgRating = storeReviews.length > 0 
    ? (storeReviews.reduce((sum, r) => sum + r.rating, 0) / storeReviews.length).toFixed(1)
    : "N/A"

  return (
    <div className="space-y-6">
      {/* Header da Loja */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-xl">
                <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold rounded-xl">
                  {store.nome.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{store.nome}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">CNPJ: {store.cnpj}</p>
              </div>
            </div>
            <Badge variant={store.status === "ativo" ? "default" : "secondary"}>
              {store.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Plano</p>
              <p className="font-semibold">{store.plano}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Score Prioridade</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="font-semibold">{store.priorityScore}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Avaliação</p>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <p className="font-semibold">{avgRating}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Produtos</p>
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4 text-primary" />
                <p className="font-semibold">{mockProducts.filter(p => p.storeId === store.id).length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Produtos da Loja */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Produtos em Destaque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {storeProducts.map((product) => (
              <div key={product.id} className="space-y-2">
                <div className="aspect-square relative bg-muted/30 rounded-lg overflow-hidden">
                  <Image
                    src={product.imagemUrl || "/placeholder.svg"}
                    alt={product.nome}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold line-clamp-1">{product.nome}</p>
                  <p className="text-lg font-bold text-primary">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.preco)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews */}
      {storeReviews.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Avaliações Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {storeReviews.map((review) => (
              <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm">{review.userNome}</p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < review.rating ? "fill-yellow-500 text-yellow-500" : "fill-muted text-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.comentario}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

