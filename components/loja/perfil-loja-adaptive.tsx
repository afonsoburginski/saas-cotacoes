"use client"

import { PerfilLojaMobile } from "./perfil-loja-mobile"
import { PerfilLojaDesktop } from "./perfil-loja-desktop"

interface PerfilLojaAdaptiveProps {
  profile: {
    id: string
    nome: string
    email?: string | null
    telefone?: string | null
    cnpj?: string | null
    endereco?: string | null
  }
  setProfile: (profile: any) => void
  storeId: string | null
}

export function PerfilLojaAdaptive({ profile, setProfile, storeId }: PerfilLojaAdaptiveProps) {
  return (
    <>
      {/* Mobile version */}
      <div className="block md:hidden">
        <PerfilLojaMobile profile={profile} setProfile={setProfile} storeId={storeId} />
      </div>
      
      {/* Desktop version */}
      <div className="hidden md:block">
        <PerfilLojaDesktop profile={profile} setProfile={setProfile} storeId={storeId} />
      </div>
    </>
  )
}

