"use client"

import { useState } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import { CheckoutAdaptive } from "@/components/checkout"

export default function CheckoutPage() {
  const router = useRouter()
  const { user, updateUser } = useAuthStore()
  const [selectedPlan, setSelectedPlan] = useState<'basico' | 'plus' | 'premium'>('plus')
  const [isLoading, setIsLoading] = useState(false)

  // Redirecionar se não estiver logado
  if (!user) {
    router.push('/')
    return null
  }

  const handleSubscribe = async () => {
    setIsLoading(true)
    
    try {
      // Simular processo de pagamento
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Atualizar usuário com o plano escolhido
      await updateUser({ 
        role: 'fornecedor',
        plan: selectedPlan,
        businessName: `${user.name} Materiais`,
        businessType: 'comercio'
      })
      
      // Redirecionar para o dashboard
      router.push('/loja/produtos')
      
    } catch (error) {
      console.error('Erro no checkout:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CheckoutAdaptive 
      selectedPlan={selectedPlan}
      setSelectedPlan={setSelectedPlan}
      isLoading={isLoading}
      handleSubscribe={handleSubscribe}
    />
  )
}
