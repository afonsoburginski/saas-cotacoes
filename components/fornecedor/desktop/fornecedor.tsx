"use client"

import { useState } from "react"
import { useCartStore } from "@/stores/cart-store"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCardAdaptive } from "@/components/explorar/product-card-adaptive"
import { TypographyH1, TypographyH3, TypographyH4, TypographyP, TypographySmall, TypographyMuted } from "@/components/ui/typography"
import { 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Shield, 
  Truck, 
  CreditCard,
  ArrowLeft,
  MessageCircle,
  Share2
} from "lucide-react"
import Link from "next/link"

interface FornecedorDesktopProps {
  store: any
  storeProducts: any[]
  storeServices: any[]
}

export function FornecedorDesktop({ store, storeProducts, storeServices }: FornecedorDesktopProps) {
  const [activeTab, setActiveTab] = useState("produtos")
  const addToCart = useCartStore((state) => state.addToCart)
  const { toast } = useToast()
  
  const handleShare = async () => {
    const url = `${window.location.origin}/fornecedor/${store.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: store.nome,
          text: `Confira ${store.nome} no Orça Norte!`,
          url: url,
        })
      } catch (error) {
        // User cancelou ou erro
      }
    } else {
      // Fallback: copiar para clipboard
      navigator.clipboard.writeText(url)
      toast({
        title: "Link copiado!",
        description: "O link do perfil foi copiado para área de transferência.",
      })
    }
  }
  
  const handleWhatsApp = () => {
    const profileUrl = `${window.location.origin}/fornecedor/${store.id}`
    const message = `Olá! Vi seu perfil no Orça Norte e gostaria de fazer um orçamento.\n\n${profileUrl}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }
  
  // Combinar produtos e serviços em um só catálogo
  const catalogItems = [
    ...storeProducts,
    ...storeServices.map((s: any) => ({ ...s, isService: true }))
  ]
  
  const handleAddService = (service: any) => {
    // Converter serviço para formato de produto para adicionar ao carrinho
    const serviceAsProduct = {
      ...service,
      preco: service.precoMinimo || 0,
      estoque: 999, // Serviços sempre disponíveis
    }
    addToCart(serviceAsProduct as any)
    toast({
      title: "Serviço adicionado!",
      description: `${service.nome} foi adicionado ao orçamento.`,
    })
  }

  // Mock reviews data
  const reviews = [
    {
      id: "1",
      userName: "João Silva",
      rating: 5,
      comment: "Excelente atendimento e produtos de qualidade. Recomendo!",
      date: "2024-01-15",
      verified: true
    },
    {
      id: "2", 
      userName: "Maria Santos",
      rating: 4,
      comment: "Bom preço e entrega rápida. Voltarei a comprar.",
      date: "2024-01-10",
      verified: true
    },
    {
      id: "3",
      userName: "Pedro Costa",
      rating: 5,
      comment: "Melhor empresa da região. Produtos sempre em estoque.",
      date: "2024-01-08",
      verified: false
    }
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-8">
      <div className="container mx-auto max-w-[1400px] px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/explorar">
            <Button variant="outline" size="sm" className="rounded-xl font-montserrat">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex-1" />
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl font-montserrat"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>

        {/* Store Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="h-64 bg-gradient-to-br from-[#0052FF] to-[#22C55E] relative">
            <div className="absolute inset-0 bg-black/10" />
          </div>
          
          {/* Profile Section */}
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex items-start gap-4 -mt-16 relative z-10">
              <Avatar className="h-32 w-32 rounded-2xl ring-4 ring-white shadow-lg">
                <AvatarFallback className="bg-white text-[#0052FF] text-4xl font-bold rounded-2xl font-marlin">
                  {store.nome.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 mt-20">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <TypographyH1 className="text-3xl">{store.nome}</TypographyH1>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900 font-montserrat">4.8</span>
                        <span className="text-gray-600 font-montserrat">(127 avaliações)</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <Badge className="bg-green-100 text-green-700 border-green-200 font-montserrat">
                        <Shield className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="font-montserrat">São Paulo, SP • 2.5 km de distância</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 font-montserrat"
                      onClick={handleWhatsApp}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Tabs - Pill style */}
          <TabsList className="bg-gray-100 border border-gray-200 rounded-lg p-1 font-montserrat">
            <TabsTrigger 
              value="produtos" 
              className="rounded-md px-4 py-2 text-sm data-[state=active]:bg-[#0052FF] data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Catálogo ({catalogItems.length})
            </TabsTrigger>
            <TabsTrigger 
              value="avaliacoes"
              className="rounded-md px-4 py-2 text-sm data-[state=active]:bg-[#0052FF] data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Avaliações
            </TabsTrigger>
            <TabsTrigger 
              value="sobre"
              className="rounded-md px-4 py-2 text-sm data-[state=active]:bg-[#0052FF] data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Informações
            </TabsTrigger>
          </TabsList>

          {/* Catálogo Tab - Produtos + Serviços */}
          <TabsContent value="produtos" className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {catalogItems.map((item) => (
                item.isService ? (
                  <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow border-green-100 flex flex-col">
                    <Badge className="mb-2 bg-green-600 text-white self-start">Serviço</Badge>
                    <h4 className="font-bold text-sm mb-1 line-clamp-2">{item.nome}</h4>
                    <p className="text-xs text-gray-600 mb-3">{item.categoria}</p>
                    <div className="mt-auto">
                      {item.precoMinimo && item.precoMaximo ? (
                        <p className="text-xs font-semibold text-green-700 mb-2">
                          R$ {item.precoMinimo} - {item.precoMaximo}
                        </p>
                      ) : (
                        <p className="text-xs text-amber-600 mb-2">Sob consulta</p>
                      )}
                      <Button 
                        size="sm" 
                        className="w-full text-xs bg-green-600 text-white hover:bg-green-700"
                        onClick={() => handleAddService(item)}
                      >
                        Adicionar Serviço
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <ProductCardAdaptive key={item.id} product={item} />
                )
              ))}
            </div>
            
            {catalogItems.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-gray-500 font-montserrat">Nenhum produto ou serviço cadastrado</p>
              </Card>
            )}
          </TabsContent>

          {/* Avaliações Tab */}
          <TabsContent value="avaliacoes" className="space-y-6">
            <div className="grid gap-4">
              {reviews.map((review) => (
                <Card key={review.id} className="p-6 rounded-2xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gray-100 text-gray-600">
                          {review.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold font-montserrat">{review.userName}</span>
                          {review.verified && (
                            <Badge variant="outline" className="text-xs font-montserrat">
                              <Shield className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-gray-500 font-montserrat">
                            {new Date(review.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 font-montserrat">{review.comment}</p>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sobre Tab */}
          <TabsContent value="sobre" className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <TypographyH3>Informações da Empresa</TypographyH3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium font-montserrat">(11) 99999-9999</p>
                    <p className="text-sm text-gray-600 font-montserrat">Telefone</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium font-montserrat">contato@{store.nome.toLowerCase().replace(/\s+/g, '')}.com</p>
                    <p className="text-sm text-gray-600 font-montserrat">Email</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium font-montserrat">Rua das Construções, 123</p>
                    <p className="text-sm text-gray-600 font-montserrat">Vila Madalena, São Paulo - SP</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium font-montserrat">Seg-Sex: 08:00-18:00 | Sáb: 08:00-12:00</p>
                    <p className="text-sm text-gray-600 font-montserrat">Horário de funcionamento</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium mb-3 font-montserrat">Serviços oferecidos</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-montserrat">
                    <Truck className="h-3 w-3 mr-1" />
                    Entrega grátis
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-montserrat">
                    <CreditCard className="h-3 w-3 mr-1" />
                    Cartão aceito
                  </Badge>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 font-montserrat">
                    <Clock className="h-3 w-3 mr-1" />
                    Entrega rápida
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-montserrat">
                    <Shield className="h-3 w-3 mr-1" />
                    Garantia
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
