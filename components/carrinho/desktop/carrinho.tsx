"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trash2, Download, ListPlus, Package, ShoppingBag, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CartGroupByStore } from "@/components/features/cart-group-by-store"
import type { CartItem } from "@/stores/cart-store"

interface CarrinhoDesktopProps {
  cartItems: CartItem[]
  onUpdateQuantity: (itemId: string, qty: number) => void
  onRemoveItem: (itemId: string) => void
  onClearCart: () => void
  onGeneratePDF: () => void
  onGenerateList: () => void
  stores?: any[]
}

export function CarrinhoDesktop({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onGeneratePDF,
  onGenerateList,
  stores
}: CarrinhoDesktopProps) {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="font-montserrat"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-marlin">
                  Carrinho
                </h1>
                <p className="text-sm text-gray-600 mt-1 font-montserrat">
                  {cartItems.length > 0 
                    ? `${cartItems.length} ${cartItems.length === 1 ? 'produto' : 'produtos'} no carrinho`
                    : 'Vazio'
                  }
                </p>
              </div>
            </div>
            {cartItems.length > 0 && (
              <Button 
                variant="outline" 
                onClick={onClearCart} 
                className="border-red-200 text-red-600 hover:bg-red-50 font-montserrat"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Carrinho
              </Button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="rounded-full bg-gray-100 p-8 mb-6">
                <ShoppingBag className="h-16 w-16 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3 font-marlin">
                Carrinho vazio
              </h2>
              <p className="text-gray-600 mb-8 font-montserrat">
                Adicione produtos para começar
              </p>
              <Button asChild size="lg" className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-montserrat">
                <Link href="/explorar">
                  <Package className="h-5 w-5 mr-2" />
                  Explorar Produtos
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Cart Items - Mais Espaço */}
              <div className="xl:col-span-3">
                <CartGroupByStore 
                  cartItems={cartItems} 
                  onUpdateQuantity={onUpdateQuantity} 
                  onRemoveItem={onRemoveItem}
                  stores={stores}
                />
              </div>

              {/* Actions Sidebar - Compacta */}
              <div className="xl:col-span-1">
                <div className="sticky top-6 space-y-4">
                  <Card className="rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-white px-5 py-4 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 font-marlin">
                        Ações
                      </h3>
                    </div>
                    <CardContent className="p-5 space-y-3">
                      <Button 
                        onClick={onGenerateList} 
                        size="lg"
                        className="w-full bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-montserrat"
                      >
                        <ListPlus className="h-4 w-4 mr-2" />
                        Gerar Orçamento
                      </Button>
                      
                      <Button 
                        onClick={onGeneratePDF} 
                        size="lg"
                        variant="outline"
                        className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 font-montserrat"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar PDF
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-transparent p-5">
                    <div className="flex items-start gap-2">
                      <span className="text-xl">💡</span>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-1 font-marlin">
                          Dica
                        </h4>
                        <p className="text-xs text-gray-600 font-montserrat leading-relaxed">
                          Crie uma lista para compartilhar com fornecedores e comparar ofertas.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

