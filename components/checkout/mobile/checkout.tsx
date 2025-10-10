"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import { Check, Store, Rocket, Video, ArrowLeft, CreditCard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const plans = [
  {
    id: 'basico' as const,
    name: "Básico",
    price: "R$ 99",
    period: "/mês",
    description: "Ideal para pequenas empresas começando",
    icon: Store,
    features: [
      "Perfil profissional no diretório",
      "Receber cotações ilimitadas",
      "Cadastro de até 50 produtos/serviços",
      "Painel de controle",
      "Relatórios básicos de desempenho",
      "Otimização SEO básica",
      "Suporte por email 7 dias/semana"
    ],
    popular: false,
    color: "bg-[#0052FF]"
  },
  {
    id: 'plus' as const,
    name: "Plus",
    price: "R$ 189,99",
    period: "/mês",
    description: "Para empresas crescerem rápido",
    icon: Rocket,
    features: [
      "Tudo do plano Básico",
      "Cadastro de até 300 produtos/serviços",
      "Divulgação automática nas buscas",
      "Destaque nos resultados",
      "Campanhas de marketing mensais",
      "Relatórios avançados e analytics",
      "Análises de desempenho",
      "Suporte prioritário"
    ],
    popular: true,
    color: "bg-[#0052FF]"
  },
  {
    id: 'premium' as const,
    name: "Premium",
    price: "R$ 249,99",
    period: "/mês",
    description: "Vídeos e campanhas avançadas",
    icon: Video,
    features: [
      "Tudo do plano Plus",
      "Produtos/serviços ilimitados",
      "2 vídeos promocionais por mês",
      "Cada vídeo fica 15 dias no ar",
      "Campanhas de marketing semanais",
      "Divulgação em múltiplas plataformas",
      "Relatórios completos detalhados",
      "Suporte prioritário 24/7"
    ],
    popular: false,
    color: "bg-[#0052FF]"
  }
];

interface CheckoutMobileProps {
  selectedPlan: 'basico' | 'plus' | 'premium';
  setSelectedPlan: (plan: 'basico' | 'plus' | 'premium') => void;
  isLoading: boolean;
  handleSubscribe: () => void;
}

export function CheckoutMobile({ selectedPlan, setSelectedPlan, isLoading, handleSubscribe }: CheckoutMobileProps) {
  const { user } = useAuthStore();
  const [currentSlide, setCurrentSlide] = useState(1); // Começa no Plus (mais popular)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    setCurrentSlide(newIndex);
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6 px-4 pt-4"
      >
        <Link 
          href="/onboarding" 
          className="inline-flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-montserrat">Voltar</span>
        </Link>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 relative">
            <Image
              src="/logo.png"
              alt="Orça Norte"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-marlin">Orça Norte</h1>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1 font-marlin">
          Escolha seu plano
        </h2>
        <p className="text-gray-600 text-sm font-montserrat">
          {user?.name}, arraste para ver os planos
        </p>
      </motion.div>

      {/* Carousel Container */}
      <div 
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 pb-2 pt-4 mb-6 px-4"
        onScroll={handleScroll}
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl p-4 border flex-shrink-0 w-[calc(100%-2rem)] snap-center transition-all duration-300 ${
                plan.popular ? 'border-[#0052FF]' : 'border-gray-200'
              } ${isSelected ? 'ring-2 ring-[#0052FF]' : ''}`}
              style={{ scrollSnapAlign: 'center' }}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#0052FF] text-white px-3 py-0.5 rounded-full text-xs font-bold font-montserrat">
                    Mais Popular
                  </span>
                </div>
              )}
              
              {/* Header com ícone, título e preço */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`${plan.color} rounded-lg p-2.5 w-12 h-12 flex-shrink-0`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900 mb-1 font-marlin">{plan.name}</h3>
                    <p className="text-xs text-gray-600 font-montserrat">{plan.description}</p>
                  </div>
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                  </div>
                  <span className="text-gray-500 text-xs font-montserrat">{plan.period}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 mb-2.5 font-montserrat">Features Incluídas:</p>
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded bg-[#0052FF]/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-[#0052FF]" />
                      </div>
                      <span className="text-xs text-gray-700 font-montserrat">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-[#0052FF] rounded-full flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dots Indicator */}
      <div className="flex items-center justify-center gap-1.5 mb-6">
        {plans.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              const container = document.querySelector('.overflow-x-auto');
              if (container) {
                container.scrollTo({
                  left: index * container.clientWidth,
                  behavior: 'smooth'
                });
              }
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentSlide === index 
                ? 'w-6 bg-[#0052FF]' 
                : 'w-1.5 bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Resumo do Pedido */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-auto px-4 pb-4"
      >
        <Card className="border-gray-200 rounded-2xl shadow-sm">
          <CardHeader>
            <h3 className="text-lg font-bold text-gray-900 font-marlin">Resumo do Pedido</h3>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-montserrat text-sm">Plano:</span>
                <span className="font-medium font-marlin text-sm">{selectedPlanData.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-montserrat text-sm">Valor:</span>
                <span className="font-medium font-montserrat text-sm">{selectedPlanData.price}</span>
              </div>
              <div className="border-t pt-2.5">
                <div className="flex justify-between items-center text-base font-bold">
                  <span className="font-marlin">Total:</span>
                  <span className="text-[#22C55E] font-montserrat">{selectedPlanData.price}/mês</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium font-montserrat">
                ✨ 14 dias grátis para testar
              </p>
              <p className="text-xs text-green-600 mt-1 font-montserrat">
                Cancele quando quiser
              </p>
            </div>

            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              size="lg"
              className="w-full h-11 bg-[#22C55E] hover:bg-[#22C55E]/90 text-base font-semibold font-montserrat rounded-full active:scale-95 transition-transform"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Assinar Agora
                </div>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center font-montserrat">
              Ao continuar, você concorda com nossos{" "}
              <a href="#" className="text-[#0052FF] hover:underline">
                Termos
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

