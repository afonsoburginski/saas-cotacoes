"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TypographyH1, TypographyH3 } from "@/components/ui/typography"
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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { QrCode, Banknote, Receipt, ShoppingCart, Hammer, Wrench, Package, Boxes, BadgeDollarSign } from "lucide-react"
import Image from "next/image"

interface PerfilLojaDesktopProps {
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
    servicesOffered?: Array<{ label: string; icon?: string }>
  }
  setProfile: (profile: any) => void
  storeId: string | null
}

export function PerfilLojaDesktop({ profile, setProfile, storeId }: PerfilLojaDesktopProps) {
  const [activeTab, setActiveTab] = useState("sobre")
  const [uploading, setUploading] = useState(false)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const [selectedIcon, setSelectedIcon] = useState<string | undefined>(undefined)

  const renderIcon = (key?: string, cls = "h-4 w-4") => {
    switch (key) {
      case 'truck': return <Truck className={cls} />
      case 'credit-card': return <CreditCard className={cls} />
      case 'clock': return <Clock className={cls} />
      case 'shield': return <Shield className={cls} />
      case 'map-pin': return <MapPin className={cls} />
      case 'phone': return <Phone className={cls} />
      case 'star': return <Star className={cls} />
      case 'qr-code': return <QrCode className={cls} />
      case 'banknote': return <Banknote className={cls} />
      case 'receipt': return <Receipt className={cls} />
      case 'shopping-cart': return <ShoppingCart className={cls} />
      case 'hammer': return <Hammer className={cls} />
      case 'wrench': return <Wrench className={cls} />
      case 'package': return <Package className={cls} />
      case 'boxes': return <Boxes className={cls} />
      case 'badge-dollar-sign': return <BadgeDollarSign className={cls} />
      default: return <Star className={cls + " opacity-30"} />
    }
  }

  const ICON_KEYS = [
    // Pagamentos
    'credit-card','qr-code','banknote','receipt','badge-dollar-sign',
    // Produtos/Serviços
    'shopping-cart','package','boxes','hammer','wrench',
    // Gerais
    'truck','clock','shield','map-pin','phone','star'
  ] as const

  const handleBlur = async (field: keyof typeof profile, newValue: string) => {
    // Sempre salva, mesmo se o valor for igual (pode ter mudado)
    setProfile({ ...profile, [field]: newValue })
    
    if (!storeId) return
    try {
      const res = await fetch(`/api/stores/${storeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, [field]: newValue })
      })
      if (res.ok) {
        toast({
          title: "Salvo!",
          description: "Alteração salva automaticamente.",
        })
      }
    } catch (error) {
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
          description: "Endereço preenchido automaticamente.",
        })
      }
    } else {
      toast({
        title: "CEP não encontrado",
        description: "Verifique o CEP digitado.",
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

      // pede url assinada ao backend
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-8">
      <div className="container mx-auto max-w-[1400px] px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" className="rounded-xl font-montserrat" onClick={() => router.push('/loja/burginski-134EtP')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Store Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Cover Photo - Clicável para upload */}
          <div 
            className="h-64 relative group cursor-pointer"
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
              <div className="h-full bg-gradient-to-br from-[#0052FF] to-[#22C55E]">
                <div className="absolute inset-0 bg-black/10" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 rounded-full p-3">
                  <ImageIcon className="h-6 w-6 text-gray-700" />
                </div>
                <p className="text-white text-sm font-semibold mt-2">Alterar capa</p>
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
          </div>
          
          {/* Profile Section */}
          <div className="px-6 pb-6">
            {/* Avatar - Clicável para upload */}
            <div className="flex items-start gap-4 -mt-16 relative z-10">
              <div 
                className="relative group cursor-pointer"
                onClick={() => logoInputRef.current?.click()}
              >
                <Avatar className="h-32 w-32 rounded-2xl ring-4 ring-white shadow-lg">
                  {profile.logo ? (
                    <AvatarImage src={profile.logo} alt={profile.nome} />
                  ) : (
                    <AvatarFallback className="bg-white text-[#0052FF] text-4xl font-bold rounded-2xl font-marlin">
                      {profile.nome.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-2xl flex items-center justify-center">
                  <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
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
              
              <div className="flex-1 mt-20">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h1 
                      className="text-3xl font-bold text-gray-900 font-marlin cursor-text hover:bg-gray-100 rounded px-2 -mx-2 transition-colors outline-none"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleBlur('nome', e.currentTarget.textContent || '')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          e.currentTarget.blur()
                        }
                      }}
                    >
                      {profile.nome}
                    </h1>
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
                      <span className="font-montserrat">{enderecoCompleto}</span>
                    </div>
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
                {/* Telefone */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <p 
                      className="font-medium font-montserrat cursor-text hover:bg-gray-200/50 rounded px-1 -mx-1 transition-colors outline-none"
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
                    <p className="text-sm text-gray-600 font-montserrat">Telefone</p>
                  </div>
                </div>
                
                {/* Email */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <p 
                      className="font-medium font-montserrat cursor-text hover:bg-gray-200/50 rounded px-1 -mx-1 transition-colors outline-none"
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
                    <p className="text-sm text-gray-600 font-montserrat">Email</p>
                  </div>
                </div>
                
                {/* CEP com busca automática */}
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Search className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-700 mb-1 block">CEP</Label>
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
                </div>
                
                {/* Rua + Número */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-700 mb-1 block">Rua</Label>
                    <Input
                      value={profile.rua || ''}
                      onChange={(e) => setProfile({ ...profile, rua: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleBlur('rua', e.currentTarget.value)
                        }
                      }}
                      placeholder="Ex: Rua das Cerejeiras"
                      className="font-montserrat"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1 block">Número</Label>
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
                      className="font-montserrat"
                    />
                  </div>
                </div>
                
                {/* Bairro */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Label className="text-sm font-medium text-gray-700 mb-1 block">Bairro</Label>
                  <Input
                    value={profile.bairro || ''}
                    onChange={(e) => setProfile({ ...profile, bairro: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleBlur('bairro', e.currentTarget.value)
                      }
                    }}
                    placeholder="Ex: Vila Madalena"
                    className="font-montserrat"
                  />
                </div>
                
                {/* Cidade + Estado */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-700 mb-1 block">Cidade</Label>
                    <Input
                      value={profile.cidade || ''}
                      onChange={(e) => setProfile({ ...profile, cidade: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleBlur('cidade', e.currentTarget.value)
                        }
                      }}
                      placeholder="Ex: São Paulo"
                      className="font-montserrat"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1 block">Estado</Label>
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
                      className="font-montserrat uppercase"
                    />
                  </div>
                </div>
                
                {/* Horário de Funcionamento */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <p 
                      className="font-medium font-montserrat cursor-text hover:bg-gray-200/50 rounded px-1 -mx-1 transition-colors outline-none"
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
                    <p className="text-sm text-gray-600 font-montserrat">Horário de funcionamento</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium mb-3 font-montserrat">Serviços oferecidos</h4>
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative max-w-sm w-full">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-10 p-0 flex items-center justify-center">
                          {renderIcon(selectedIcon)}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="grid grid-cols-6 gap-1 p-2 max-w-xs">
                        {ICON_KEYS.map((key) => (
                          <DropdownMenuItem key={key} className="p-2 h-8 w-8 justify-center" onSelect={() => setSelectedIcon(key)} title={key}>
                            {renderIcon(key)}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem className="col-span-6 justify-center" onSelect={() => setSelectedIcon(undefined)}>
                          Nenhum
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Input
                      placeholder="Adicionar serviço (ex: Entrega grátis)"
                      className="pl-12"
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          const target = e.currentTarget as HTMLInputElement
                          const label = target.value.trim()
                          if (!label) return
                          const icon = selectedIcon
                          const next = [ ...(profile.servicesOffered || []), { label, icon } ]
                          setProfile({ ...profile, servicesOffered: next })
                          target.value = ''
                          setSelectedIcon(undefined)
                          if (storeId) {
                            await fetch(`/api/stores/${storeId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ servicesOffered: next }) })
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                {profile.servicesOffered && profile.servicesOffered.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.servicesOffered.map((s, idx) => (
                      <Badge key={`${s.label}-${idx}`} variant="outline" className="font-montserrat group cursor-pointer" onClick={async () => {
                        const next = (profile.servicesOffered || []).filter((x) => !(x.label === s.label && x.icon === s.icon))
                        setProfile({ ...profile, servicesOffered: next })
                        if (storeId) {
                          await fetch(`/api/stores/${storeId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ servicesOffered: next }) })
                        }
                      }}>
                        {s.icon && (
                          <span className="mr-1" title={s.label}>{renderIcon(s.icon)}</span>
                        )}
                        <span>{s.label}</span>
                      </Badge>
                    ))}
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
