"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCard } from "@/components/features/product-card"
import { mockProducts } from "@/lib/mock-data"
import { 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  Shield, 
  X,
  MessageCircle
} from "lucide-react"

interface Store {
  id: string
  nome: string
  plano: string
  priorityScore: number
  status: string
}

interface SupplierModalProps {
  store: Store | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SupplierModal({ store, open, onOpenChange }: SupplierModalProps) {
  const [activeTab, setActiveTab] = useState("produtos")
  
  if (!store) return null

  const storeProducts = mockProducts.filter(p => p.storeId === store.id).slice(0, 8)

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        {/* Header */}
        <div className="relative">
          {/* Cover */}
          <div className="h-32 md:h-48 bg-gradient-to-br from-[#0052FF] to-[#22C55E] relative">
            <div className="absolute inset-0 bg-black/10" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Profile Section */}
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex items-start gap-4 -mt-12 relative z-10">
              <Avatar className="h-20 w-20 md:h-24 md:w-24 rounded-2xl ring-4 ring-white shadow-lg">
                <AvatarFallback className="bg-white text-[#0052FF] text-2xl md:text-3xl font-bold rounded-2xl">
                  {store.nome.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 mt-12 md:mt-16">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">{store.nome}</h1>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">4.8</span>
                        <span className="text-gray-600 text-sm">(127 avaliações)</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <Shield className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-gray-600 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>São Paulo, SP • 2.5 km de distância</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white rounded-lg">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Mensagem
                    </Button>
                    <Button variant="outline" className="rounded-lg">
                      <Phone className="h-4 w-4 mr-2" />
                      Ligar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-gray-900">150+</div>
                  <div className="text-xs text-gray-600">Produtos</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">Aberto</div>
                  <div className="text-xs text-gray-600">Seg-Sex 8h-18h</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto max-h-[50vh]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-gray-100 border border-gray-200 rounded-xl p-1 w-full">
              <TabsTrigger 
                value="produtos" 
                className="rounded-lg px-4 py-2 flex-1 text-sm data-[state=active]:bg-[#0052FF] data-[state=active]:text-white"
              >
                Produtos
              </TabsTrigger>
              <TabsTrigger 
                value="sobre" 
                className="rounded-lg px-4 py-2 flex-1 text-sm data-[state=active]:bg-[#0052FF] data-[state=active]:text-white"
              >
                Informações
              </TabsTrigger>
            </TabsList>

            {/* Produtos Tab */}
            <TabsContent value="produtos" className="space-y-4">
              <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                {storeProducts.map((product) => (
                  <ProductCard key={product.id} product={product} variant="modal" />
                ))}
              </div>
              
              {storeProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum produto encontrado</p>
                </div>
              )}
            </TabsContent>


            {/* Sobre Tab */}
            <TabsContent value="sobre" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm">(11) 99999-9999</p>
                    <p className="text-xs text-gray-600">Telefone</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm">Rua das Construções, 123</p>
                    <p className="text-xs text-gray-600">Vila Madalena, São Paulo - SP</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm">Segunda a Sexta: 08:00 - 18:00</p>
                    <p className="text-xs text-gray-600">Sábado: 08:00 - 12:00 | Domingo: Fechado</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

