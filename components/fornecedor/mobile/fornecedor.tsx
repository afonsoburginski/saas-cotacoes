"use client"

import { useState, useMemo } from "react"
import { useCartStore } from "@/stores/cart-store"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCardAdaptive } from "@/components/explorar/product-card-adaptive"
import { TypographyH3, TypographyH4, TypographyP, TypographySmall, TypographyMuted } from "@/components/ui/typography"
import { Input } from "@/components/ui/input"
import { FaArrowRightLong } from "react-icons/fa6"
import { useDebounce } from "@/hooks/use-debounce"
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
  Share2,
  MoreHorizontal,
  Heart,
  Send,
  Search
} from "lucide-react"
import Link from "next/link"

interface FornecedorMobileProps {
  store: any
  storeProducts: any[]
  storeServices: any[]
}

export function FornecedorMobile({ store, storeProducts, storeServices }: FornecedorMobileProps) {
  const [activeTab, setActiveTab] = useState("produtos")
  const [searchTerm, setSearchTerm] = useState("")
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
        // User cancelou
      }
    } else {
      navigator.clipboard.writeText(url)
      toast({
        title: "Link copiado!",
        description: "O link do perfil foi copiado.",
      })
    }
  }
  
  const handleWhatsApp = () => {
    const profileUrl = `${window.location.origin}/fornecedor/${store.id}`
    const message = `Olá! Vi seu perfil no Orça Norte e gostaria de fazer um orçamento.\n\n${profileUrl}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }
  
  // Combinar produtos e serviços
  const catalogItems = [
    ...storeProducts,
    ...storeServices.map((s: any) => ({ ...s, isService: true }))
  ]
  
  const handleAddService = (service: any) => {
    const serviceAsProduct = {
      ...service,
      preco: service.precoMinimo || 0,
      estoque: 999,
    }
    addToCart(serviceAsProduct as any)
    toast({
      title: "Serviço adicionado!",
      description: `${service.nome} foi adicionado ao orçamento.`,
    })
  }
  
  // Debounce search
  const debouncedSearch = useDebounce(searchTerm)
  
  // Filter catalog items (products + services) by search
  const filteredProducts = useMemo(() => {
    return debouncedSearch 
      ? catalogItems.filter(item => item.nome.toLowerCase().includes(debouncedSearch.toLowerCase()))
      : catalogItems
  }, [catalogItems, debouncedSearch])
    
  // Group products by category
  const productsByCategory = filteredProducts.reduce((acc: any, product: any) => {
    if (!acc[product.categoria]) {
      acc[product.categoria] = []
    }
    acc[product.categoria].push(product)
    return acc
  }, {})

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
    <div className="min-h-screen bg-white pb-32">
      {/* Cover Photo - Facebook Marketplace Style */}
      <div className="relative">
        <div className="h-52 bg-[#0052FF] relative overflow-hidden">
          {/* Texture overlay */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'url(/texture.png)',
              backgroundSize: '150px 150px',
              backgroundRepeat: 'repeat',
              mixBlendMode: 'overlay'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />
          
          {/* Header Buttons */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <Link href="/explorar">
              <Button variant="ghost" size="sm" className="rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/40 h-10 w-10 p-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/40 h-10 w-10 p-0"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Avatar + Name - Overlapping between blue and white */}
        <div className="px-4 -mt-14 relative z-10">
          <div className="flex items-end gap-3">
            <Avatar className="h-20 w-20 rounded-full ring-4 ring-white shadow-lg">
              <AvatarFallback className="bg-white text-[#0052FF] text-2xl font-bold">
                {store.nome.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-10">
              <h3 className="text-xl font-bold text-white font-montserrat mb-0 leading-tight text-shadow-lg">@{store.nome}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pt-4 bg-white">
        {/* Store Info */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <TypographySmall className="font-semibold text-gray-900">4.8</TypographySmall>
              <TypographyMuted className="text-xs">(127 avaliações)</TypographyMuted>
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Verificado
            </Badge>
          </div>
          
          <div className="flex items-center gap-1 mb-4">
            <MapPin className="h-4 w-4 text-gray-500" />
            <TypographyMuted>São Paulo, SP • 2.5 km de distância</TypographyMuted>
          </div>
          
          {/* Action Button - WhatsApp */}
          <div className="mb-4">
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg w-full font-semibold"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs - Facebook Style */}
      <div className="border-t border-gray-200 bg-white">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-0">
          <div className="px-4">
            <TabsList className="w-full bg-transparent justify-start h-auto p-0 gap-0">
              <TabsTrigger 
                value="produtos" 
                className="relative px-4 py-3 text-sm text-gray-600 bg-transparent border-0 rounded-none shadow-none data-[state=active]:bg-transparent data-[state=active]:text-[#1877F2] data-[state=active]:shadow-none data-[state=active]:font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent data-[state=active]:after:bg-[#1877F2]"
              >
                Catálogo ({catalogItems.length})
              </TabsTrigger>
              <TabsTrigger 
                value="avaliacoes"
                className="relative px-4 py-3 text-sm text-gray-600 bg-transparent border-0 rounded-none shadow-none data-[state=active]:bg-transparent data-[state=active]:text-[#1877F2] data-[state=active]:shadow-none data-[state=active]:font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent data-[state=active]:after:bg-[#1877F2]"
              >
                Avaliações
              </TabsTrigger>
              <TabsTrigger 
                value="sobre"
                className="relative px-4 py-3 text-sm text-gray-600 bg-transparent border-0 rounded-none shadow-none data-[state=active]:bg-transparent data-[state=active]:text-[#1877F2] data-[state=active]:shadow-none data-[state=active]:font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent data-[state=active]:after:bg-[#1877F2]"
              >
                Informações
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Produtos Tab */}
          <TabsContent value="produtos" className="mt-0">
            <div className="bg-[#FAFAFA] min-h-screen">
              {/* Search Bar */}
              <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-20">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 z-10" />
                  <Input
                    placeholder="Buscar no catálogo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 h-11 !bg-gray-50 border-0 rounded-2xl text-base placeholder:text-gray-400 focus:!bg-white focus:ring-2 focus:ring-blue-500 font-medium font-montserrat"
                  />
                </div>
              </div>

              <div className="py-4">
                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center mx-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <TypographyH4 className="mb-2 font-montserrat">Nenhum produto encontrado</TypographyH4>
                    <TypographyMuted className="font-montserrat">Tente buscar por outros termos</TypographyMuted>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Products organized by category - Netflix style */}
                    {Object.entries(productsByCategory).map(([categoria, produtos]: [string, any]) => (
                      <div key={categoria} className="space-y-3">
                        <div className="flex items-center justify-between px-4">
                          <div className="flex items-center gap-2">
                            <TypographyH4 className="text-lg text-gray-700 font-montserrat">{categoria}</TypographyH4>
                            <FaArrowRightLong className="h-5 w-5 text-gray-700" />
                          </div>
                          <TypographySmall className="text-gray-500 font-montserrat">
                            {produtos.length} itens
                          </TypographySmall>
                        </div>
                        
                        {/* Horizontal Scrollable Row */}
                        <div className="overflow-x-auto scrollbar-hide">
                          <div className="flex gap-3 px-4 pb-2">
                            {produtos.map((item: any) => (
                              <div key={item.id} className="flex-none w-[45vw]">
                                {item.isService ? (
                                  <Card className="p-3 hover:shadow-lg transition-shadow border-green-100">
                                    <Badge className="mb-2 bg-green-600 text-white text-[10px]">Serviço</Badge>
                                    <h4 className="font-bold text-xs mb-1 line-clamp-2">{item.nome}</h4>
                                    <p className="text-[10px] text-gray-600 mb-2">{item.categoria}</p>
                                    {item.precoMinimo && item.precoMaximo ? (
                                      <p className="text-[10px] font-semibold text-green-700 mb-2">
                                        R$ {item.precoMinimo} - {item.precoMaximo}
                                      </p>
                                    ) : (
                                      <p className="text-[10px] text-amber-600 mb-2">Sob consulta</p>
                                    )}
                                    <Button 
                                      size="sm" 
                                      className="w-full text-[10px] h-7 bg-green-600 text-white"
                                      onClick={() => handleAddService(item)}
                                    >
                                      Adicionar Serviço
                                    </Button>
                                  </Card>
                                ) : (
                                  <ProductCardAdaptive product={item} alwaysShowButtons={true} />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Avaliações Tab */}
          <TabsContent value="avaliacoes" className="mt-0">
            <div className="bg-gray-50 min-h-screen">
              <div className="px-4 py-4">
                <div className="flex items-center justify-between mb-4">
                  <TypographyH4>Avaliações</TypographyH4>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <TypographySmall className="font-semibold">4.8</TypographySmall>
                    <TypographyMuted className="text-xs">(127)</TypographyMuted>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gray-100 text-gray-600">
                            {review.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <TypographySmall className="font-semibold">{review.userName}</TypographySmall>
                            {review.verified && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Verificado
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <TypographyMuted className="text-xs">
                              {new Date(review.date).toLocaleDateString('pt-BR')}
                            </TypographyMuted>
                          </div>
                          <TypographyP className="text-sm mt-0">{review.comment}</TypographyP>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Sobre Tab */}
          <TabsContent value="sobre" className="mt-0">
            <div className="bg-gray-50 min-h-screen">
              <div className="px-4 py-4">
                <TypographyH4 className="mb-4">Informações da Empresa</TypographyH4>
                
                {/* Contact Info */}
                <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                  <TypographySmall className="font-semibold mb-3 block">Contato</TypographySmall>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div>
                        <TypographySmall className="font-medium">(11) 99999-9999</TypographySmall>
                        <TypographyMuted className="text-xs">Telefone</TypographyMuted>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <TypographySmall className="font-medium">contato@{store.nome.toLowerCase().replace(/\s+/g, '')}.com</TypographySmall>
                        <TypographyMuted className="text-xs">Email</TypographyMuted>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Location */}
                <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                  <TypographySmall className="font-semibold mb-3 block">Localização</TypographySmall>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <TypographySmall className="font-medium">Rua das Construções, 123</TypographySmall>
                      <TypographyMuted className="text-xs">Vila Madalena, São Paulo - SP</TypographyMuted>
                    </div>
                  </div>
                </div>
                
                {/* Hours */}
                <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                  <TypographySmall className="font-semibold mb-3 block">Horário de funcionamento</TypographySmall>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <TypographySmall className="font-medium">Seg-Sex: 08:00-18:00</TypographySmall>
                      <TypographyMuted className="text-xs">Sáb: 08:00-12:00</TypographyMuted>
                    </div>
                  </div>
                </div>
                
                {/* Services */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <TypographySmall className="font-semibold mb-3 block">Serviços oferecidos</TypographySmall>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Truck className="h-3 w-3 mr-1" />
                      Entrega grátis
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <CreditCard className="h-3 w-3 mr-1" />
                      Cartão aceito
                    </Badge>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      <Clock className="h-3 w-3 mr-1" />
                      Entrega rápida
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Garantia
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
