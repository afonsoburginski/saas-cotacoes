"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useAuthStore } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import { User, Building2, ArrowRight, Check } from "lucide-react"
import Image from "next/image"

export default function OnboardingPage() {
  const router = useRouter()
  const { user, updateUser } = useAuthStore()
  const [selectedType, setSelectedType] = useState<'consumidor' | 'fornecedor' | null>(null)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 relative">
              <Image
                src="/logo.png"
                alt="Orça Norte"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Orça Norte</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Bem-vindo, {user.name}!
          </h2>
          <p className="text-gray-600 text-lg">
            Como você pretende usar o Orça Norte?
          </p>
        </motion.div>

        {/* Opções */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
        >
          {/* Consumidor */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
              selectedType === 'consumidor' 
                ? 'ring-2 ring-[#0052FF] shadow-xl bg-blue-50/50' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedType('consumidor')}
          >
            <CardHeader className="text-center pb-4">
              <div className="relative">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 transition-colors ${
                  selectedType === 'consumidor' 
                    ? 'bg-[#0052FF] text-white' 
                    : 'bg-blue-100 text-[#0052FF]'
                }`}>
                  <User className="w-10 h-10" />
                </div>
                {selectedType === 'consumidor' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Consumidor</h3>
              <p className="text-gray-600">
                Quero fazer cotações e comprar materiais
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Acesso gratuito completo</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Cotações ilimitadas</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Compare preços de fornecedores</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Histórico de compras</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800 text-center">
                  ✨ Comece a usar agora mesmo!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Fornecedor */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
              selectedType === 'fornecedor' 
                ? 'ring-2 ring-[#22C55E] shadow-xl bg-green-50/50' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedType('fornecedor')}
          >
            <CardHeader className="text-center pb-4">
              <div className="relative">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 transition-colors ${
                  selectedType === 'fornecedor' 
                    ? 'bg-[#22C55E] text-white' 
                    : 'bg-green-100 text-[#22C55E]'
                }`}>
                  <Building2 className="w-10 h-10" />
                </div>
                {selectedType === 'fornecedor' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Fornecedor</h3>
              <p className="text-gray-600">
                Quero vender materiais e serviços
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Anuncie seus produtos/serviços</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Receba cotações de clientes</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Relatórios de vendas</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Gestão de estoque</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm font-medium text-orange-800 text-center">
                  💳 Planos a partir de R$ 99/mês
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Botão Continuar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <Button
            onClick={handleContinue}
            disabled={!selectedType || isLoading}
            size="lg"
            className={`h-14 px-12 text-lg font-semibold transition-all ${
              selectedType === 'fornecedor'
                ? 'bg-[#22C55E] hover:bg-[#22C55E]/90'
                : 'bg-[#0052FF] hover:bg-[#0052FF]/90'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Configurando...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span>
                  {selectedType === 'fornecedor' ? 'Escolher Plano' : 'Começar Agora'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </Button>
          
          {selectedType && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-sm text-gray-500"
            >
              {selectedType === 'consumidor' 
                ? 'Você terá acesso completo e gratuito ao sistema'
                : 'Você será direcionado para escolher seu plano'
              }
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
