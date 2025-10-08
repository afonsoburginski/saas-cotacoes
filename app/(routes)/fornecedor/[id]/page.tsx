"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCard } from "@/components/features/product-card"
import { PageBackground } from "@/components/layout/page-background"
import { mockStores, mockProducts } from "@/lib/mock-data"
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
  ExternalLink,
  MessageCircle,
  Share2
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function FornecedorPage() {
  const params = useParams()
  const storeId = params.id as string
  
  // Mock data - em produção viria da API
  const store = mockStores.find(s => s.id === storeId) || mockStores[0]
  const storeProducts = mockProducts.filter(p => p.storeId === storeId).slice(0, 12)
  
  const [activeTab, setActiveTab] = useState("produtos")

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
      comment: "Melhor fornecedor da região. Produtos sempre em estoque.",
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
    <>
      <PageBackground />
      <div className="min-h-screen pt-4 px-2 md:px-4 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/explorar">
            <Button variant="outline" size="sm" className="rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="rounded-xl">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>

        {/* Store Header - Facebook Marketplace Style */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="h-48 md:h-64 bg-gradient-to-br from-[#0052FF] to-[#22C55E] relative">
            <div className="absolute inset-0 bg-black/10" />
          </div>
          
          {/* Profile Section */}
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex items-start gap-4 -mt-16 relative z-10">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 rounded-2xl ring-4 ring-white shadow-lg">
                <AvatarFallback className="bg-white text-[#0052FF] text-2xl md:text-4xl font-bold rounded-2xl">
                  {store.nome.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 mt-16 md:mt-20">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{store.nome}</h1>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">4.8</span>
                        <span className="text-gray-600">(127 avaliações)</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <Shield className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>São Paulo, SP • 2.5 km de distância</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white rounded-lg px-6">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Mensagem
                    </Button>
                    <Button variant="outline" className="rounded-lg px-6">
                      <Phone className="h-4 w-4 mr-2" />
                      Ligar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-gray-900">150+</div>
                  <div className="text-sm text-gray-600">Produtos</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Taxa de resposta</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">24h</div>
                  <div className="text-sm text-gray-600">Tempo de resposta</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Simplified */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-gray-200 rounded-xl p-1 w-full">
            <TabsTrigger value="produtos" className="rounded-lg px-6 py-2 flex-1">
              Produtos
            </TabsTrigger>
            <TabsTrigger value="avaliacoes" className="rounded-lg px-6 py-2 flex-1">
              Avaliações
            </TabsTrigger>
            <TabsTrigger value="sobre" className="rounded-lg px-6 py-2 flex-1">
              Informações
            </TabsTrigger>
          </TabsList>

          {/* Produtos Tab */}
          <TabsContent value="produtos" className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {storeProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {storeProducts.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-gray-500">Nenhum produto encontrado</p>
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
                          <span className="font-semibold">{review.userName}</span>
                          {review.verified && (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sobre Tab */}
          <TabsContent value="sobre" className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Informações do Fornecedor</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">(11) 99999-9999</p>
                    <p className="text-sm text-gray-600">Telefone</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">contato@{store.nome.toLowerCase().replace(/\s+/g, '')}.com</p>
                    <p className="text-sm text-gray-600">Email</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Rua das Construções, 123</p>
                    <p className="text-sm text-gray-600">Vila Madalena, São Paulo - SP</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Seg-Sex: 08:00-18:00 | Sáb: 08:00-12:00</p>
                    <p className="text-sm text-gray-600">Horário de funcionamento</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium mb-3">Serviços oferecidos</h4>
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
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
