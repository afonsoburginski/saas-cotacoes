"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { usePlans } from "@/hooks/use-plans";
import { useRouter } from "next/navigation";
import { Check, Store, Rocket, Video, ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const planIcons = {
  'Básico': Store,
  'Plus': Rocket,
  'Premium': Video,
}

interface CheckoutDesktopProps {
  selectedPlan: 'basico' | 'plus' | 'premium';
  setSelectedPlan: (plan: 'basico' | 'plus' | 'premium') => void;
  isLoading: boolean;
  handleSubscribe: () => void;
}

export function CheckoutDesktop({ selectedPlan, setSelectedPlan, isLoading, handleSubscribe }: CheckoutDesktopProps) {
  const { data: session } = useSession();
  const { data: plansData, isLoading: isLoadingPlans } = usePlans();

  const plans = plansData?.data || [];
  const selectedPlanData = plans.find(p => p.nome.toLowerCase() === selectedPlan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-6">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Link 
            href="/" 
            className="inline-flex items-center gap-3 mb-6 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-montserrat">Voltar para Home</span>
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
            <h1 className="text-4xl font-bold text-gray-900 font-marlin">Orça Norte</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2 font-marlin">
            Escolha seu plano, {session?.user?.name}
          </h2>
          <p className="text-gray-600 text-lg font-montserrat">
            Comece a vender e receber cotações hoje mesmo
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Planos */}
          <div className="lg:col-span-3">
            {isLoadingPlans ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl">
                {plans.map((plan, index) => {
                  const Icon = planIcons[plan.nome as keyof typeof planIcons] || Store;
                  const planId = plan.nome.toLowerCase() as 'basico' | 'plus' | 'premium';
                  const isSelected = selectedPlan === planId;
                  const isPopular = plan.nome === 'Plus';
                
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`relative bg-white rounded-2xl border p-6 transition-all duration-300 cursor-pointer ${
                      isPopular ? 'border-[#0052FF]' : 'border-gray-200'
                    } ${isSelected ? 'ring-2 ring-[#0052FF] shadow-xl' : 'hover:shadow-lg'}`}
                    onClick={() => setSelectedPlan(planId)}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-[#0052FF] text-white px-3 py-1 rounded-full text-xs font-bold font-montserrat">
                          Mais Popular
                        </span>
                      </div>
                    )}
                    
                    {/* Header com ícone, título e preço */}
                    <div className="relative mb-5">
                      <div className="flex items-start gap-3">
                        <div className="bg-[#0052FF] rounded-xl p-3 w-14 h-14 flex-shrink-0">
                          <Icon className="w-full h-full text-white" />
                        </div>
                        <div className="flex-1 pr-20">
                          <h3 className="text-lg font-bold text-gray-900 mb-0.5 font-marlin leading-tight">{plan.nome}</h3>
                          <p className="text-xs text-gray-600 font-montserrat leading-snug">
                            {plan.nome === 'Básico' ? 'Ideal para pequenas empresas começando' :
                             plan.nome === 'Plus' ? 'Para empresas crescerem rápido' :
                             'Vídeos e campanhas avançadas'}
                          </p>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 text-right">
                        <span className="text-2xl font-bold text-gray-900 block leading-none">
                          R$ {plan.preco.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-gray-500 text-xs font-montserrat mt-0.5 block">/mês</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-5">
                      <p className="text-xs font-semibold text-gray-500 mb-3 font-montserrat">Features Incluídas:</p>
                      <ul className="space-y-2.5">
                        {plan.recursos.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-[#0052FF]/10 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-[#0052FF]" />
                            </div>
                            <span className="text-xs font-montserrat text-gray-700">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-[#0052FF] rounded-full flex items-center justify-center"
                      >
                        <Check className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
              </div>
            )}
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="sticky top-6 border-gray-200 rounded-2xl shadow-sm">
                <CardHeader>
                  <h3 className="text-xl font-bold text-gray-900 font-marlin">Resumo do Pedido</h3>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-montserrat text-sm">Plano selecionado:</span>
                      <span className="font-medium font-marlin">{selectedPlanData?.nome || 'Plus'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-montserrat text-sm">Valor mensal:</span>
                      <span className="font-medium font-montserrat">
                        R$ {(selectedPlanData?.preco || 189.99).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span className="font-marlin">Total:</span>
                        <span className="text-[#22C55E] font-montserrat">
                          R$ {(selectedPlanData?.preco || 189.99).toFixed(2).replace('.', ',')}/mês
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 font-medium font-montserrat">
                      ✨ 14 dias grátis para testar
                    </p>
                    <p className="text-xs text-green-600 mt-1 font-montserrat">
                      Cancele quando quiser, sem compromisso
                    </p>
                  </div>

                  <Button
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    size="lg"
                    className="w-full h-12 bg-[#22C55E] hover:bg-[#22C55E]/90 text-base font-semibold font-montserrat rounded-full"
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

                  <p className="text-xs text-gray-500 text-center font-montserrat">
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
  );
}

