"use client"

import { useState, useMemo, useEffect, useRef } from "react"
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
import { useReviews } from "@/hooks/use-reviews"
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
import { calculateDistance } from "@/lib/utils"
import { formatServicePrice } from "@/lib/service-price-formatter"

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
  const [distanceKm, setDistanceKm] = useState<number | null>(null)
  const resultsRef = useRef<HTMLDivElement | null>(null)

  // Motion refs for search animations
  const searchContainerRef = useRef<HTMLDivElement | null>(null)
  
  const animateBoxShadow = (el: Element, from: string, to: string) => {
    ;(el as HTMLElement).animate(
      [ { boxShadow: from }, { boxShadow: to } ],
      { duration: 200, easing: 'ease-out', fill: 'forwards' }
    )
  }

  // 🔴 Buscar avaliações reais da database
  const { data: reviews = [], isLoading: isLoadingReviews } = useReviews({ 
    storeId: store.id.toString() 
  })

  useEffect(() => {
    if (!store?.address?.lat || !store?.address?.lng) return
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const d = calculateDistance(
          pos.coords.latitude,
          pos.coords.longitude,
          store.address.lat,
          store.address.lng
        )
        setDistanceKm(d)
      },
      () => setDistanceKm(null),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [store?.address?.lat, store?.address?.lng])
  
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
    
    // Usar o telefone da loja se disponível, senão usar URL genérica
    if (store.telefone) {
      const phoneNumber = store.telefone.replace(/\D/g, '') // Remove caracteres não numéricos
      const whatsappUrl = `https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    }
  }
  
  // Combinar produtos e serviços
  const catalogItems = [
    ...storeProducts,
    ...storeServices.map((s: any) => ({ ...s, isService: true }))
  ]
  
  const handleAddService = (service: any) => {
    // Adicionar serviço diretamente ao carrinho
    addToCart(service)
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

  // Suave: anima resultados quando a busca muda
  useEffect(() => {
    if (!resultsRef.current) return
    const items = resultsRef.current.querySelectorAll('[data-animate="item"]')
    items.forEach((el, idx) => {
      ;(el as HTMLElement).animate(
        [
          { opacity: 0, transform: 'translateY(6px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 300, delay: idx * 40, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
      )
    })
  }, [debouncedSearch])

  // Animate underline when search changes
  // underline animation removed

  const handleSearchFocus = () => {
    if (!searchContainerRef.current) return
    animateBoxShadow(
      searchContainerRef.current as Element,
      "0 0 0 0 rgba(0,82,255,0)",
      "0 0 0 4px rgba(0,82,255,0.15)"
    )
  }

  const handleSearchBlur = () => {
    if (!searchContainerRef.current) return
    animateBoxShadow(
      searchContainerRef.current as Element,
      "0 0 0 4px rgba(0,82,255,0.15)",
      "0 0 0 0 rgba(0,82,255,0)"
    )
  }

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
        <div className="h-52 relative overflow-hidden">
          {store.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.coverImage} alt="Capa" className="w-full h-full object-cover" />
          ) : (
            <div className="h-full bg-[#0052FF]">
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
            </div>
          )}
          
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
              {store.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={store.logo} alt={store.nome} className="h-full w-full object-cover rounded-full" />
              ) : (
                <AvatarFallback className="bg-white text-[#0052FF] text-2xl font-bold">
                  {store.nome.charAt(0)}
                </AvatarFallback>
              )}
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
            <TypographyMuted>
              {store.rua && store.cidade && store.estado
                ? `${store.rua}${store.numero ? `, ${store.numero}` : ''} - ${store.bairro || ''}, ${store.cidade} - ${store.estado}`
                : store.endereco || 'Endereço não informado'}
              {distanceKm !== null ? ` • ${distanceKm < 10 ? distanceKm.toFixed(1) : distanceKm.toFixed(0)} km de distância` : ''}
            </TypographyMuted>
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
            <div className="bg-[#FAFAFA] min-h-screen" ref={resultsRef}>
              {/* Search Bar */}
              <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-20">
                <div ref={searchContainerRef} className="relative rounded-2xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 z-10" />
                  <Input
                    placeholder="Buscar no catálogo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
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
                              <div key={item.id} className="flex-none w-[45vw]" data-animate="item">
                                {item.isService ? (
                                  <Card className="relative overflow-hidden h-full p-0 border border-gray-200 rounded-xl shadow-sm">
                                    <div className="relative w-full aspect-[4/5]">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={item.imagemUrl || "/placeholder.svg?height=1000&width=800"}
                                        alt={item.nome}
                                        className="object-cover w-full h-full"
                                      />

                                      {/* Badge serviço/categoria */}
                                      <div className="absolute top-2 left-2">
                                        <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-semibold backdrop-blur-md bg-white/90 text-gray-900 border-0">
                                          Serviço {item.categoria ? `• ${item.categoria}` : ''}
                                        </Badge>
                                      </div>

                                      {/* Overlay inferior com ação */}
                                      <div className="absolute inset-0">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                        <div className="absolute inset-x-0 bottom-0 p-3 space-y-2">
                                          <h4 className="text-white font-bold text-xs leading-tight line-clamp-2 drop-shadow-lg font-marlin">
                                            {item.nome}
                                          </h4>
                                          {formatServicePrice(item).includes('Sob consulta') && (
                                            <Badge className="bg-amber-500/90 text-white border-0 text-[9px] font-semibold w-fit">Sob consulta</Badge>
                                          )}
                                          <Button 
                                            size="sm" 
                                            className="w-full text-[10px] h-7 bg-green-600 text-white"
                                            onClick={() => handleAddService(item)}
                                          >
                                            Adicionar Serviço
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
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
                {isLoadingReviews ? (
                  <div className="bg-white rounded-2xl p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0052FF] mx-auto mb-4"></div>
                    <TypographyMuted className="font-montserrat">Carregando avaliações...</TypographyMuted>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Star className="h-8 w-8 text-gray-400" />
                    </div>
                    <TypographyH4 className="mb-2 font-montserrat">Nenhuma avaliação ainda</TypographyH4>
                    <TypographyMuted className="font-montserrat">Seja o primeiro a avaliar este fornecedor!</TypographyMuted>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <TypographyH4>Avaliações</TypographyH4>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <TypographySmall className="font-semibold">4.8</TypographySmall>
                        <TypographyMuted className="text-xs">({reviews.length})</TypographyMuted>
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
                                  {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                                </TypographyMuted>
                              </div>
                              {review.comentario && (
                                <TypographyP className="text-sm mt-0">{review.comentario}</TypographyP>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
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
                        <TypographySmall className="font-medium">{store.telefone || '(00) 00000-0000'}</TypographySmall>
                        <TypographyMuted className="text-xs">Telefone</TypographyMuted>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <TypographySmall className="font-medium">{store.email || `contato@${store.nome.toLowerCase().replace(/\s+/g, '')}.com`}</TypographySmall>
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
                      <TypographySmall className="font-medium">
                        {store.rua && store.cidade && store.estado
                          ? `${store.rua}${store.numero ? `, ${store.numero}` : ''} - ${store.bairro || ''}, ${store.cidade} - ${store.estado}`
                          : store.endereco || 'Endereço não informado'}
                      </TypographySmall>
                      {store.cep && (
                        <TypographyMuted className="text-xs">CEP: {store.cep}</TypographyMuted>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Hours */}
                <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                  <TypographySmall className="font-semibold mb-3 block">Horário de funcionamento</TypographySmall>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <TypographySmall className="font-medium">{store.horarioFuncionamento || 'Seg-Sex: 08:00-18:00 | Sáb: 08:00-12:00'}</TypographySmall>
                    </div>
                  </div>
                </div>
                
                {Array.isArray(store.servicesOffered) && store.servicesOffered.length > 0 && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <TypographySmall className="font-semibold mb-3 block">Serviços oferecidos</TypographySmall>
                    <div className="flex flex-wrap gap-2">
                      {store.servicesOffered.map((s: string) => (
                        <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
