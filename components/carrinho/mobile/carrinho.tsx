"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trash2, Download, ListPlus, Package, ShoppingBag, FileText } from "lucide-react"
import Link from "next/link"
import { CartGroupByStore } from "@/components/features/cart-group-by-store"
import type { CartItem } from "@/stores/cart-store"
import { AdvertisementBanner } from "@/components/explorar/advertisement-banner"

interface CarrinhoMobileProps {
  cartItems: CartItem[]
  onUpdateQuantity: (itemId: string, qty: number) => void
  onRemoveItem: (itemId: string) => void
  onClearCart: () => void
  onGeneratePDF?: () => void
  onGenerateList: () => void
  stores?: any[]
}

export function CarrinhoMobile({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onGeneratePDF,
  onGenerateList,
  stores
}: CarrinhoMobileProps) {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Header Fixo */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-marlin">
              Carrinho
            </h1>
            <p className="text-xs text-gray-600 font-montserrat">
              {cartItems.length > 0 
                ? `${cartItems.length} ${cartItems.length === 1 ? 'produto' : 'produtos'}`
                : 'Vazio'
              }
            </p>
          </div>
          {cartItems.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onGenerateList} 
              className="text-white hover:text-[#0052FF]/80 hover:bg-[#0052FF]/10 hover:border-neutral-300 bg-blue-600"
              title="Gerar Orçamento"
            >
              <FileText className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <ShoppingBag className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2 font-marlin">
              Carrinho vazio
            </h2>
            <p className="text-sm text-gray-600 mb-6 text-center font-montserrat">
              Adicione produtos para começar
            </p>
            <Button asChild size="lg" className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-montserrat w-full max-w-xs">
              <Link href="/explorar">
                <Package className="h-4 w-4 mr-2" />
                Explorar Produtos
              </Link>
            </Button>
          </div>
        ) : (
          <div className="pb-24 overflow-x-hidden">
            {/* Banner de Anúncios - Full Width, Maior Altura, Ocupa Bordas, Colado no Topo */}
            <div className="-mx-4 overflow-x-hidden">
              <AdvertisementBanner height="h-[280px]" className="rounded-none border-x-0 border-t-0 border-b-2" />
            </div>
            
            {/* Cart Items - Full Width */}
            <div className="px-4 space-y-4 mt-4">
              <CartGroupByStore 
                cartItems={cartItems} 
                onUpdateQuantity={onUpdateQuantity} 
                onRemoveItem={onRemoveItem} 
                onGenerateList={onGenerateList}
                stores={stores}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

