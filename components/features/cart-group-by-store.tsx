"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, Store, ShoppingCart, Truck } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import type { CartItem } from "@/lib/types"
import { mockStores } from "@/lib/mock-data"
import { calculateShippingCost, formatShippingInfo } from "@/lib/utils"

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

  // Calcular frete para cada loja
  const shippingCosts: Record<string, number> = {}
  Object.entries(groupedItems).forEach(([storeId, group]) => {
    const store = mockStores.find(s => s.id === storeId)
    if (store) {
      shippingCosts[storeId] = calculateShippingCost(store.shippingPolicy, group.subtotal)
    }
  })

  const totalProdutos = Object.values(groupedItems).reduce((total, group) => total + group.subtotal, 0)
  const totalFrete = Object.values(shippingCosts).reduce((sum, cost) => sum + cost, 0)
  const totalGeral = totalProdutos + totalFrete

  if (cartItems.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Resumo por Loja */}
      <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl overflow-hidden shadow-sm">
        {Object.entries(groupedItems).map(([storeId, group], groupIndex) => (
          <div key={storeId}>
            {/* Header da Loja */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-3 md:px-5 py-3 md:py-3.5 border-b border-gray-100">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                  <div className="rounded-full bg-[#0052FF]/10 p-1.5 md:p-2 shrink-0">
                    <Store className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#0052FF]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm md:text-base font-bold text-gray-900 font-marlin truncate">{group.storeNome}</h3>
                    <p className="text-xs text-gray-600 font-montserrat">{group.items.length} {group.items.length === 1 ? "item" : "itens"}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500 font-montserrat hidden md:block">Subtotal</p>
                  <p className="text-sm md:text-base font-bold text-[#0052FF] font-montserrat">{formatPrice(group.subtotal)}</p>
                </div>
              </div>
            </div>

            {/* Produtos da Loja - Desktop */}
            <div className="hidden md:block divide-y divide-gray-100">
              {group.items.map((item) => (
                <div key={item.id} className="px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Imagem */}
                    <div className="w-18 h-18 relative bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                      <FallbackImage src={item.imagemUrl} alt={item.productNome} />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-gray-900 font-marlin truncate mb-1">{item.productNome}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-montserrat border-gray-200">
                          {formatPrice(item.precoUnit)} / un
                        </Badge>
                      </div>
                    </div>

                    {/* Quantidade */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(item.id, item.qty - 1)}
                        disabled={item.qty <= 1}
                        className="h-9 w-9 p-0 border-gray-200 hover:bg-gray-100 rounded-lg"
                      >
                        <Minus className="h-3.5 w-3.5 text-gray-600" />
                      </Button>

                      <Input
                        type="number"
                        value={item.qty}
                        onChange={(e) => onUpdateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                        className="w-16 text-center h-9 border-gray-200 font-montserrat font-bold text-sm rounded-lg"
                        min="1"
                      />

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(item.id, item.qty + 1)}
                        className="h-9 w-9 p-0 border-gray-200 hover:bg-gray-100 rounded-lg"
                      >
                        <Plus className="h-3.5 w-3.5 text-gray-600" />
                      </Button>
                    </div>

                    {/* Total */}
                    <div className="text-right min-w-24 shrink-0">
                      <p className="text-base font-bold text-gray-900 font-montserrat">{formatPrice(item.precoUnit * item.qty)}</p>
                    </div>

                    {/* Remover */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 w-9 p-0 rounded-lg shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Produtos da Loja - Mobile */}
            <div className="md:hidden divide-y divide-gray-100">
              {group.items.map((item) => (
                <div key={item.id} className="px-3 py-3">
                  <div className="flex gap-3">
                    {/* Imagem */}
                    <div className="w-20 h-20 relative bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                      <FallbackImage src={item.imagemUrl} alt={item.productNome} />
                    </div>
                    
                    {/* Info e Controles */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <h4 className="text-sm font-semibold text-gray-900 font-marlin line-clamp-2 mb-1">{item.productNome}</h4>
                      <p className="text-xs text-gray-600 font-montserrat mb-2">{formatPrice(item.precoUnit)} / un</p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        {/* Quantidade Compacta */}
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateQuantity(item.id, item.qty - 1)}
                            disabled={item.qty <= 1}
                            className="h-8 w-8 p-0 border-gray-200 rounded-md"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>

                          <span className="w-10 text-center text-sm font-bold font-montserrat">{item.qty}</span>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateQuantity(item.id, item.qty + 1)}
                            className="h-8 w-8 p-0 border-gray-200 rounded-md"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Total e Remover */}
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900 font-montserrat">{formatPrice(item.precoUnit * item.qty)}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveItem(item.id)}
                            className="text-red-600 h-8 w-8 p-0 rounded-md"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Frete da Loja */}
            <div className="bg-blue-50/50 px-3 md:px-5 py-2.5 border-t border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#0052FF]" />
                  <div>
                    <p className="text-xs md:text-sm font-semibold text-gray-900 font-marlin">Frete</p>
                    <p className="text-xs text-gray-600 font-montserrat">
                      {(() => {
                        const store = mockStores.find(s => s.id === storeId)
                        return store ? formatShippingInfo(store.shippingPolicy) : "Consultar"
                      })()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm md:text-base font-bold font-montserrat" style={{ color: shippingCosts[storeId] === 0 ? '#22C55E' : '#0052FF' }}>
                    {shippingCosts[storeId] === 0 ? 'Grátis' : formatPrice(shippingCosts[storeId])}
                  </p>
                </div>
              </div>
            </div>

            {groupIndex < Object.entries(groupedItems).length - 1 && <Separator />}
          </div>
        ))}

        {/* Total Geral - Responsivo */}
        <div className="bg-gradient-to-r from-blue-50 to-white border-t-2 border-blue-100 px-3 md:px-5 py-4">
          <div className="space-y-3">
            {/* Subtotais */}
            <div className="flex items-center justify-between text-sm font-montserrat">
              <span className="text-gray-600">Produtos ({cartItems.length})</span>
              <span className="font-semibold text-gray-900">{formatPrice(totalProdutos)}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-montserrat">
              <span className="text-gray-600">Frete Total</span>
              <span className="font-semibold" style={{ color: totalFrete === 0 ? '#22C55E' : '#0052FF' }}>
                {totalFrete === 0 ? 'Grátis' : formatPrice(totalFrete)}
              </span>
            </div>
            
            <Separator />
            
            {/* Total Final */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="rounded-full bg-[#0052FF] p-2">
                  <ShoppingCart className="h-4 w-4 text-white" />
                </div>
                <p className="text-base md:text-lg font-bold text-gray-900 font-marlin">Total Geral</p>
              </div>
              <div className="text-right">
                <p className="text-xl md:text-2xl font-bold text-[#0052FF] font-montserrat">{formatPrice(totalGeral)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
