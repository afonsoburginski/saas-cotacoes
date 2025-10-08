"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import type { CartItem } from "@/lib/types"

function FallbackImage({ src, alt }: { src?: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src || "/placeholder.svg?height=80&width=80")
  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover rounded-lg"
      onError={() => setImgSrc("/placeholder.svg?height=80&width=80")}
      referrerPolicy="no-referrer"
    />
  )
}

interface CartGroupByStoreProps {
  cartItems: CartItem[]
  onUpdateQuantity: (itemId: string, qty: number) => void
  onRemoveItem: (itemId: string) => void
}

export function CartGroupByStore({ cartItems, onUpdateQuantity, onRemoveItem }: CartGroupByStoreProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  // Group items by store
  const groupedItems = cartItems.reduce(
    (groups, item) => {
      const storeId = item.storeId
      if (!groups[storeId]) {
        groups[storeId] = {
          storeNome: item.storeNome,
          items: [],
          subtotal: 0,
        }
      }
      groups[storeId].items.push(item)
      groups[storeId].subtotal += item.precoUnit * item.qty
      return groups
    },
    {} as Record<string, { storeNome: string; items: CartItem[]; subtotal: number }>,
  )

  const totalGeral = Object.values(groupedItems).reduce((total, group) => total + group.subtotal, 0)

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Seu carrinho está vazio</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([storeId, group]) => (
        <Card key={storeId}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{group.storeNome}</Badge>
                <span className="text-sm text-muted-foreground">
                  {group.items.length} {group.items.length === 1 ? "item" : "itens"}
                </span>
              </div>
              <div className="text-lg font-bold">{formatPrice(group.subtotal)}</div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {group.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-2">
                  {/* Product Image */}
                  <div className="w-16 h-16 relative bg-gray-50 rounded-lg overflow-hidden shrink-0">
                    <FallbackImage
                      src={item.imagemUrl}
                      alt={item.productNome}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium">{item.productNome}</h4>
                    <p className="text-sm text-muted-foreground">{formatPrice(item.precoUnit)} por unidade</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.id, item.qty - 1)}
                      disabled={item.qty <= 1}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>

                    <Input
                      type="number"
                      value={item.qty}
                      onChange={(e) => onUpdateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                      className="w-16 text-center h-8"
                      min="1"
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.id, item.qty + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="text-right min-w-20">
                    <div className="font-medium">{formatPrice(item.precoUnit * item.qty)}</div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total Geral</span>
            <span>{formatPrice(totalGeral)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
