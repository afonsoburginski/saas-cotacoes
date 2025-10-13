"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCardAdaptive } from "@/components/explorar/product-card-adaptive"
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

  const storeProducts = mockProducts.filter(p => p.storeId === store.id).slice(0, 16)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] md:w-auto md:max-w-7xl max-h-[95vh] md:max-h-[90vh] p-0 overflow-hidden">
        {/* Header */}
        <div className="relative">
          {/* Cover */}
          <div className="h-24 md:h-40 bg-gradient-to-br from-[#0052FF] to-[#0052FF]/80 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="absolute top-3 md:top-4 right-3 md:right-4 text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Profile Section */}
          <div className="px-4 md:px-6 pb-4 md:pb-6">
            {/* Avatar */}
            <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4 -mt-10 md:-mt-12 relative z-10">
              <Avatar className="h-16 w-16 md:h-20 md:w-20 rounded-xl md:rounded-2xl ring-4 ring-white shadow-xl">
                <AvatarFallback className="bg-gradient-to-br from-[#0052FF] to-[#0052FF]/80 text-white text-xl md:text-2xl font-bold rounded-xl md:rounded-2xl font-marlin">
                  {store.nome.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 md:mt-12 w-full">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h1 className="text-lg md:text-2xl font-bold text-gray-900 font-marlin">{store.nome}</h1>
                      <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs font-montserrat px-2 py-0.5">
                        <Shield className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900 font-montserrat text-sm">4.8</span>
                        <span className="text-gray-500 text-sm font-montserrat">(127)</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <Badge variant="secondary" className="text-xs font-montserrat px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                        {store.plano}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 text-sm font-montserrat">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>São Paulo, SP • 2.5 km</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                    <Button className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white rounded-lg flex-1 md:flex-none h-10 md:h-auto text-sm md:text-base font-montserrat">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Mensagem
                    </Button>
                    <Button variant="outline" className="rounded-lg flex-1 md:flex-none h-10 md:h-auto text-sm md:text-base font-montserrat">
                      <Phone className="h-4 w-4 mr-2" />
                      Ligar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-4 md:mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="p-3 md:p-4 bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-xl border border-blue-100">
                <div className="text-2xl md:text-3xl font-bold text-[#0052FF] font-marlin">150+</div>
                <div className="text-xs md:text-sm text-gray-600 font-montserrat mt-0.5">Produtos</div>
              </div>
              <div className="p-3 md:p-4 bg-gradient-to-br from-green-50 to-green-50/50 rounded-xl border border-green-100">
                <div className="text-lg md:text-xl font-bold text-green-700 font-marlin">Aberto</div>
                <div className="text-xs md:text-sm text-gray-600 font-montserrat mt-0.5">Seg-Sex 8h-18h</div>
              </div>
              <div className="hidden md:block p-3 md:p-4 bg-gradient-to-br from-orange-50 to-orange-50/50 rounded-xl border border-orange-100">
                <div className="text-lg md:text-xl font-bold text-orange-700 font-marlin">2.5 km</div>
                <div className="text-xs md:text-sm text-gray-600 font-montserrat mt-0.5">Distância</div>
              </div>
              <div className="hidden md:block p-3 md:p-4 bg-gradient-to-br from-purple-50 to-purple-50/50 rounded-xl border border-purple-100">
                <div className="text-lg md:text-xl font-bold text-purple-700 font-marlin">4.8★</div>
                <div className="text-xs md:text-sm text-gray-600 font-montserrat mt-0.5">Avaliação</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 md:px-6 pb-4 md:pb-6 overflow-y-auto max-h-[55vh] md:max-h-[50vh]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-gray-100 border border-gray-200 rounded-xl p-1 w-full">
              <TabsTrigger 
                value="produtos" 
                className="rounded-lg px-3 md:px-4 py-2 flex-1 text-sm data-[state=active]:bg-[#0052FF] data-[state=active]:text-white font-montserrat"
              >
                Produtos
              </TabsTrigger>
              <TabsTrigger 
                value="sobre" 
                className="rounded-lg px-3 md:px-4 py-2 flex-1 text-sm data-[state=active]:bg-[#0052FF] data-[state=active]:text-white font-montserrat"
              >
                Informações
              </TabsTrigger>
            </TabsList>

            {/* Produtos Tab */}
            <TabsContent value="produtos" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {storeProducts.map((product) => (
                  <ProductCardAdaptive key={product.id} product={product} alwaysShowButtons={true} />
                ))}
              </div>
              
              {storeProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500 font-montserrat">
                  <p>Nenhum produto encontrado</p>
                </div>
              )}
            </TabsContent>

            {/* Sobre Tab */}
            <TabsContent value="sobre" className="space-y-3 md:space-y-4">
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm font-montserrat">(11) 99999-9999</p>
                    <p className="text-xs text-gray-600 font-montserrat">Telefone</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm font-montserrat">Rua das Construções, 123</p>
                    <p className="text-xs text-gray-600 font-montserrat">Vila Madalena, São Paulo - SP</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm font-montserrat">Segunda a Sexta: 08:00 - 18:00</p>
                    <p className="text-xs text-gray-600 font-montserrat">Sábado: 08:00 - 12:00 | Domingo: Fechado</p>
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

