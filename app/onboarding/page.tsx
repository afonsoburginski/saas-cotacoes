"use client"

import { useState } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import { OnboardingAdaptive } from "@/components/onboarding"
import type { OnboardingType } from "@/components/onboarding/desktop/onboarding"

export default function OnboardingPage() {
  const router = useRouter()
  const { user, updateUser } = useAuthStore()
  const [selectedType, setSelectedType] = useState<OnboardingType>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Redirecionar se não estiver logado
  if (!user) {
    router.push('/')
    return null
  }

  const handleContinue = async () => {
    if (!selectedType) return
    
    setIsLoading(true)
    
    try {
      // Atualizar o tipo de usuário
      await updateUser({ role: selectedType })
      
      // Redirecionar baseado no tipo
      if (selectedType === 'consumidor') {
        router.push('/explorar') // Acesso direto ao sistema
      } else {
        router.push('/checkout') // Página de pagamento dos planos
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <OnboardingAdaptive
      userName={user.name}
      selectedType={selectedType}
      setSelectedType={(t) => setSelectedType(t)}
      isLoading={isLoading}
      onContinue={handleContinue}
    />
  )
}
