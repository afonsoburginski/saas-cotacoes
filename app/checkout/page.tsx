"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useAuthStore } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import { Check, Crown, Store, ArrowLeft, CreditCard } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function CheckoutPage() {
  const router = useRouter()
  const { user, updateUser } = useAuthStore()
  const [selectedPlan, setSelectedPlan] = useState<'basico' | 'premium'>('basico')
  const [isLoading, setIsLoading] = useState(false)

  // Redirecionar se não estiver logado
  if (!user) {
    router.push('/')
    return null
  }

  const plans = [
    {
      id: 'basico' as const,
      name: 'Fornecedor Básico',
      price: 'R$ 99',
      period: '/mês',
      description: 'Perfeito para começar',
      icon: Store,
      color: 'blue',
      features: [
        'Até 500 produtos/serviços',
        'Receba cotações ilimitadas',
        'Painel de controle básico',
        'Suporte por email',
        'Relatórios mensais'
      ]
    },
    {
      id: 'premium' as const,
      name: 'Fornecedor Premium',
      price: 'R$ 129,99',
      period: '/mês',
      description: 'Para fornecedores que querem crescer',
      icon: Crown,
      color: 'green',
      popular: true,
      features: [
        'Produtos/serviços ilimitados',
        'Cotações e vendas ilimitadas',
        'Painel avançado com analytics',
        'Suporte prioritário',
        'Relatórios detalhados',
        'Destaque nos resultados',
        'API para integração'
      ]
    }
  ]

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

  const selectedPlanData = plans.find(p => p.id === selectedPlan)!

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Link 
            href="/onboarding" 
            className="inline-flex items-center gap-3 mb-6 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </Link>
          
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
            Escolha seu plano, {user.name}
          </h2>
          <p className="text-gray-600 text-lg">
            Comece a vender e receber cotações hoje mesmo
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Planos */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {plans.map((plan) => {
                const Icon = plan.icon
                const isSelected = selectedPlan === plan.id
                
                return (
                  <Card 
                    key={plan.id}
                    className={`cursor-pointer transition-all duration-300 relative ${
                      isSelected
                        ? 'ring-2 ring-[#22C55E] shadow-xl bg-green-50/50' 
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-[#22C55E] text-white px-4 py-1 rounded-full text-sm font-medium">
                          Mais Popular
                        </span>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                        isSelected 
                          ? 'bg-[#22C55E] text-white' 
                          : plan.color === 'blue' 
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-green-100 text-green-600'
                      }`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-gray-600 text-sm">{plan.description}</p>
                      
                      <div className="mt-4">
                        <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-600">{plan.period}</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </Card>
                )
              })}
            </motion.div>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="sticky top-6">
                <CardHeader>
                  <h3 className="text-xl font-bold text-gray-900">Resumo do Pedido</h3>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Plano selecionado:</span>
                      <span className="font-medium">{selectedPlanData.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Valor mensal:</span>
                      <span className="font-medium">{selectedPlanData.price}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-[#22C55E]">{selectedPlanData.price}/mês</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 font-medium">
                      ✨ 14 dias grátis para testar
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Cancele quando quiser, sem compromisso
                    </p>
                  </div>

                  <Button
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    size="lg"
                    className="w-full h-12 bg-[#22C55E] hover:bg-[#22C55E]/90 text-base font-semibold"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5" />
                        Assinar Agora
                      </div>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Ao continuar, você concorda com nossos{" "}
                    <a href="#" className="text-[#0052FF] hover:underline">
                      Termos de Uso
                    </a>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
