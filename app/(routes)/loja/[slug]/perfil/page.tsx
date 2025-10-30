"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { PageBackground } from "@/components/layout/page-background"
import { PerfilLojaAdaptive } from "@/components/loja/perfil-loja-adaptive"

interface StoreProfile {
  id: string
  nome: string
  email?: string | null
  telefone?: string | null
  cnpj?: string | null
  endereco?: string | null
  cep?: string | null
  rua?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  horarioFuncionamento?: string | null
  logo?: string | null
  coverImage?: string | null
  servicesOffered?: Array<{ label: string; icon?: string }>
}

export default function LojaPerfilPage() {
  const { data: session } = useSession()
  const [storeId, setStoreId] = useState<string | null>(null)
  const [profile, setProfile] = useState<StoreProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      const res = await fetch('/api/user/store')
      if (!res.ok) {
        setIsLoading(false)
        return
      }
      const data = await res.json()
      if (!data?.storeId) {
        setIsLoading(false)
        return
      }
      setStoreId(String(data.storeId))

      const resStore = await fetch(`/api/stores/${data.storeId}`)
      if (!resStore.ok) {
        setIsLoading(false)
        return
      }
      const json = await resStore.json()
      setProfile({
        id: json.data.id,
        nome: json.data.nome || '',
        email: json.data.email || '',
        telefone: json.data.telefone || '',
        cnpj: json.data.cnpj || '',
        endereco: json.data.endereco || '',
        cep: json.data.cep || '',
        rua: json.data.rua || '',
        numero: json.data.numero || '',
        complemento: json.data.complemento || '',
        bairro: json.data.bairro || '',
        cidade: json.data.cidade || '',
        estado: json.data.estado || '',
        horarioFuncionamento: json.data.horarioFuncionamento || '',
        logo: json.data.logo || '',
        coverImage: json.data.coverImage || '',
        servicesOffered: (json.data.servicesOffered || []).map((it: any) => (
          typeof it === 'string' ? { label: it } : { label: it.label, icon: it.icon }
        ))
      })
      setIsLoading(false)
    })()
  }, [])

  if (isLoading) {
    return (
      <>
        <PageBackground />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052FF] mx-auto mb-4"></div>
            <p className="text-gray-600 font-montserrat">Carregando...</p>
          </div>
        </div>
      </>
    )
  }

  if (!profile) {
    return (
      <>
        <PageBackground />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600 font-montserrat">Perfil não encontrado</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageBackground />
      <PerfilLojaAdaptive profile={profile} setProfile={setProfile} storeId={storeId} />
    </>
  )
}
