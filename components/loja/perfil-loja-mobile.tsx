"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TypographyH4, TypographySmall, TypographyMuted, TypographyP } from "@/components/ui/typography"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase"
import { buscarCep, formatarCep } from "@/lib/cep-service"
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
  Camera,
  Image as ImageIcon,
  Search
} from "lucide-react"
import Image from "next/image"

interface PerfilLojaMobileProps {
  profile: {
    id: string
    nome: string
    email?: string | null
    telefone?: string | null
    cnpj?: string | null
    endereco?: string | null
    horarioFuncionamento?: string | null
    logo?: string | null
    coverImage?: string | null
    cep?: string | null
    rua?: string | null
    numero?: string | null
    complemento?: string | null
    bairro?: string | null
    cidade?: string | null
    estado?: string | null
  }
  setProfile: (profile: any) => void
  storeId: string | null
}

export function PerfilLojaMobile({ profile, setProfile, storeId }: PerfilLojaMobileProps) {
  const [activeTab, setActiveTab] = useState("sobre")
  const [uploading, setUploading] = useState(false)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleBlur = async (field: keyof typeof profile, newValue: string) => {
    console.log('🔄 handleBlur chamado:', { field, newValue, storeId })
    
    // Sempre salva, mesmo se o valor for igual (pode ter mudado)
    setProfile({ ...profile, [field]: newValue })
    
    if (!storeId) {
      console.log('❌ storeId não encontrado')
      return
    }
    
    try {
      console.log('📡 Enviando para API:', { field, newValue })
      const res = await fetch(`/api/stores/${storeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, [field]: newValue })
      })
      
      console.log('📡 Resposta da API:', res.status, res.ok)
      
      if (res.ok) {
        toast({
          title: "Salvo!",
          description: "Alteração salva.",
        })
      } else {
        console.error('❌ Erro na API:', await res.text())
      }
    } catch (error) {
      console.error('❌ Erro no handleBlur:', error)
      toast({
        title: "Erro!",
        description: "Não foi possível salvar.",
        variant: "destructive",
      })
    }
  }

  const handleCepBlur = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return
    
    setBuscandoCep(true)
    const dados = await buscarCep(cepLimpo)
    setBuscandoCep(false)
    
    if (dados) {
      const updatedProfile = {
        ...profile,
        cep: formatarCep(cepLimpo),
        rua: dados.logradouro,
        bairro: dados.bairro,
        cidade: dados.localidade,
        estado: dados.uf
      }
      setProfile(updatedProfile)
      
      if (storeId) {
        await fetch(`/api/stores/${storeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProfile)
        })
        toast({
          title: "CEP encontrado!",
          description: "Endereço preenchido.",
        })
      }
    } else {
      toast({
        title: "CEP inválido",
        description: "Verifique o CEP.",
        variant: "destructive",
      })
    }
  }

  const uploadImage = async (file: File, type: 'logo' | 'cover'): Promise<string | null> => {
    if (!supabase || !storeId) return null
    try {
      setUploading(true)
      const ext = file.name.split('.')?.pop()?.toLowerCase() || 'jpg'
      const uid = Math.random().toString(36).slice(2)
      const path = `stores/${storeId}/${type}/${uid}.${ext}`

      const res = await fetch('/api/storage/signed-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucket: 'images', path })
      })
      if (!res.ok) {
        console.error('Falha ao criar URL assinada:', await res.text())
        return null
      }
      const signed = await res.json()

      const { error } = await supabase.storage
        .from('images')
        .uploadToSignedUrl(signed.path, signed.token, file)

      if (error) {
        console.error('Upload error (signed):', error)
        return null
      }

      const { data } = supabase.storage.from('images').getPublicUrl(path)
      return data.publicUrl || null
    } catch (error) {
      console.error('Failed to upload:', error)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const url = await uploadImage(file, 'logo')
    if (url) {
      setProfile({ ...profile, logo: url })
      await handleBlur('logo', url)
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const url = await uploadImage(file, 'cover')
    if (url) {
      setProfile({ ...profile, coverImage: url })
      await handleBlur('coverImage', url)
    }
  }

  const enderecoCompleto = profile.rua && profile.cidade && profile.estado
    ? `${profile.rua}${profile.numero ? `, ${profile.numero}` : ''} - ${profile.bairro || ''}, ${profile.cidade} - ${profile.estado}`
    : profile.endereco || 'Endereço não cadastrado'

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
      {/* Cover Photo - Clicável para upload */}
      <div className="relative">
        <div 
          className="h-52 relative overflow-hidden"
          onClick={() => coverInputRef.current?.click()}
        >
          {profile.coverImage ? (
            <Image
              src={profile.coverImage}
              alt="Capa"
              fill
              className="object-cover"
            />
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
          
          {/* Overlay de edição */}
          <div className="absolute inset-0 bg-black/0 active:bg-black/40 transition-colors flex items-center justify-center">
            <div className="opacity-0 active:opacity-100 transition-opacity">
              <div className="bg-white/90 rounded-full p-2">
                <ImageIcon className="h-5 w-5 text-gray-700" />
              </div>
            </div>
          </div>
          
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverUpload}
            disabled={uploading}
          />
          
          {/* Header Buttons */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/40 h-10 w-10 p-0"
              onClick={(e) => {
                e.stopPropagation()
                router.push('/loja/burginski-134EtP')
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Avatar + Name - Overlapping between blue and white */}
        <div className="px-4 -mt-14 relative z-10">
          <div className="flex items-end gap-3">
            <div 
              className="relative"
              onClick={() => logoInputRef.current?.click()}
            >
              <Avatar className="h-20 w-20 rounded-full ring-4 ring-white shadow-lg">
                {profile.logo ? (
                  <AvatarImage src={profile.logo} alt={profile.nome} />
                ) : (
                  <AvatarFallback className="bg-white text-[#0052FF] text-2xl font-bold">
                    {profile.nome.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute inset-0 bg-black/0 active:bg-black/50 transition-colors rounded-full flex items-center justify-center">
                <Camera className="h-5 w-5 text-white opacity-0 active:opacity-100 transition-opacity" />
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={uploading}
              />
            </div>
            <div className="flex-1 pb-10">
              <h3 
                className="text-xl font-bold text-white font-montserrat mb-0 leading-tight text-shadow-lg cursor-text outline-none"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleBlur('nome', e.currentTarget.textContent?.replace('@', '') || '')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    e.currentTarget.blur()
                  }
                }}
              >
                @{profile.nome}
              </h3>
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
            <TypographyMuted>{enderecoCompleto}</TypographyMuted>
          </div>
        </div>
      </div>

      {/* Tabs - Facebook Style */}
      <div className="border-t border-gray-200 bg-white">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-0">
          <div className="px-4">
            <TabsList className="w-full bg-transparent justify-start h-auto p-0 gap-0">
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
              <div className="px-4 py-4 space-y-4">
                <TypographyH4 className="mb-4">Informações da Empresa</TypographyH4>
                
                {/* Contact Info */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <TypographySmall className="font-semibold mb-3 block">Contato</TypographySmall>
                  <div className="space-y-3">
                    {/* Telefone */}
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <p 
                          className="font-medium font-montserrat cursor-text active:bg-gray-100 rounded px-1 -mx-1 outline-none text-sm"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleBlur('telefone', e.currentTarget.textContent || '')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              e.currentTarget.blur()
                            }
                          }}
                        >
                          {profile.telefone || '(00) 00000-0000'}
                        </p>
                        <p className="text-xs text-gray-600 font-montserrat">Telefone</p>
                      </div>
                    </div>
                    
                    {/* Email */}
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <p 
                          className="font-medium font-montserrat cursor-text active:bg-gray-100 rounded px-1 -mx-1 outline-none text-sm"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleBlur('email', e.currentTarget.textContent || '')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              e.currentTarget.blur()
                            }
                          }}
                        >
                          {profile.email || 'contato@empresa.com'}
                        </p>
                        <p className="text-xs text-gray-600 font-montserrat">Email</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* CEP */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="h-4 w-4 text-blue-600" />
                    <Label className="text-sm font-medium text-gray-700">CEP</Label>
                  </div>
                  <Input
                    value={profile.cep || ''}
                    onChange={(e) => setProfile({ ...profile, cep: formatarCep(e.target.value) })}
                    onBlur={(e) => handleCepBlur(e.target.value)}
                    placeholder="00000-000"
                    className="font-montserrat"
                    disabled={buscandoCep}
                  />
                  {buscandoCep && <p className="text-xs text-blue-600 mt-1">Buscando...</p>}
                </div>
                
                {/* Endereço estruturado */}
                <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
                  <TypographySmall className="font-semibold block">Endereço</TypographySmall>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-600 mb-1 block">Rua</Label>
                      <Input
                        value={profile.rua || ''}
                        onChange={(e) => setProfile({ ...profile, rua: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleBlur('rua', e.currentTarget.value)
                          }
                        }}
                        placeholder="Rua"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">Nº</Label>
                      <Input
                        value={profile.numero || ''}
                        onChange={(e) => setProfile({ ...profile, numero: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleBlur('numero', e.currentTarget.value)
                          }
                        }}
                        placeholder="123"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">Bairro</Label>
                    <Input
                      value={profile.bairro || ''}
                      onChange={(e) => setProfile({ ...profile, bairro: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleBlur('bairro', e.currentTarget.value)
                        }
                      }}
                      placeholder="Bairro"
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-600 mb-1 block">Cidade</Label>
                      <Input
                        value={profile.cidade || ''}
                        onChange={(e) => setProfile({ ...profile, cidade: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleBlur('cidade', e.currentTarget.value)
                          }
                        }}
                        placeholder="Cidade"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">UF</Label>
                      <Input
                        value={profile.estado || ''}
                        onChange={(e) => setProfile({ ...profile, estado: e.target.value.toUpperCase().slice(0, 2) })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleBlur('estado', e.currentTarget.value)
                          }
                        }}
                        placeholder="SP"
                        maxLength={2}
                        className="text-sm uppercase"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Hours */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <TypographySmall className="font-semibold mb-3 block">Horário de funcionamento</TypographySmall>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <p 
                        className="font-medium font-montserrat cursor-text active:bg-gray-100 rounded px-1 -mx-1 outline-none text-sm"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleBlur('horarioFuncionamento', e.currentTarget.textContent || '')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            e.currentTarget.blur()
                          }
                        }}
                      >
                        {profile.horarioFuncionamento || 'Seg-Sex: 08:00-18:00 | Sáb: 08:00-12:00'}
                      </p>
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
