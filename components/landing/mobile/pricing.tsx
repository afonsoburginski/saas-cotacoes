"use client";
import { Check, Store, Rocket, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStoreSlug } from "@/hooks/use-store-slug";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const plans = [
  {
    name: "Básico",
    price: "R$ 99",
    period: "/mês",
    description: "Ideal para pequenas empresas começando",
    icon: Store,
    features: [
      "Perfil profissional no diretório",
      "Receber cotações ilimitadas",
      "Cadastro ilimitado de produtos/serviços",
      "Painel de controle",
      "Relatórios básicos de desempenho",
      "Suporte por email 7 dias/semana"
    ],
    buttonText: "Começar Agora",
    popular: false,
    color: "bg-[#0052FF]"
  },
  {
    name: "Plus",
    price: "R$ 189,99",
    period: "/mês",
    description: "Para empresas crescerem rápido",
    icon: Rocket,
    features: [
      "Tudo do plano Básico",
      "Divulgação automática nas buscas",
      "Destaque nos resultados",
      "Campanhas de marketing mensais",
      "Design de artes digitais",
      "Análises de desempenho",
      "Suporte prioritário"
    ],
    buttonText: "Começar Agora",
    popular: true,
    color: "bg-[#0052FF]"
  },
  {
    name: "Premium",
    price: "R$ 249,99",
    period: "/mês",
    description: "Vídeos e campanhas avançadas",
    icon: Video,
    features: [
      "Tudo do plano Plus",
      "2 vídeos promocionais por mês",
      "Cada vídeo fica 15 dias no ar",
      "Campanhas de marketing semanais",
      "Divulgação em múltiplas plataformas",
      "Suporte prioritário 24/7"
    ],
    buttonText: "Começar Agora",
    popular: false,
    color: "bg-[#0052FF]"
  }
];

export function PricingMobile() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [selectedPlanForAuth, setSelectedPlanForAuth] = useState<string | null>(null);
  const [showExistingSubDialog, setShowExistingSubDialog] = useState(false);
  const { data: session } = useSession();
  const { data: storeSlug } = useStoreSlug();
  const router = useRouter();
  
  const handlePlanClick = (planName: string) => {
    // Converter nome para ID (sem acentos)
    const planId = planName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
    
    if (session?.user) {
      createStripeCheckout(planId);
    } else {
      setSelectedPlanForAuth(planId);
      setAuthDialogOpen(true);
    }
  };
  
  const createStripeCheckout = async (plan: string) => {
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      
      // Detectar se já tem assinatura ativa (409 Conflict)
      if (res.status === 409) {
        setShowExistingSubDialog(true);
        return;
      }
      
      if (res.ok) {
        const { url } = await res.json();
        if (url) window.location.href = url;
      }
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
    }
  };
  const [currentSlide, setCurrentSlide] = useState(1); // Começa no Plus (mais popular)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    setCurrentSlide(newIndex);
  };

  return (
    <>
    <section className="py-10 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1 font-marlin">
            Planos para Empresas
          </h2>
          <p className="text-xs text-gray-600 font-montserrat">
            Arraste para ver os planos
          </p>
        </div>

        {/* Carousel Container */}
        <div 
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-2 pt-4"
          onScroll={handleScroll}
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-xl p-5 border flex-shrink-0 w-full snap-center ${
                plan.popular ? 'border-[#0052FF]' : 'border-gray-200'
              }`}
              style={{ scrollSnapAlign: 'center' }}
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
                    <plan.icon className="w-full h-full text-white" />
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
              
              <Button 
                onClick={() => handlePlanClick(plan.name)}
                className="w-full mb-4 bg-[#0052FF] hover:bg-[#0052FF]/90 text-white border-0 active:scale-95 transition-transform"
              >
                {plan.buttonText}
              </Button>
              
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
            </div>
          ))}
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
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
      </div>
    </section>

    <AuthDialog 
      open={authDialogOpen} 
      onOpenChange={(open) => {
        setAuthDialogOpen(open);
        if (!open) setSelectedPlanForAuth(null);
      }}
      mode="login"
      selectedPlan={selectedPlanForAuth}
    />

    {/* Dialog para quando já tem assinatura ativa */}
    <AlertDialog open={showExistingSubDialog} onOpenChange={setShowExistingSubDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você já tem um plano ativo! 🎉</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Sua conta já possui uma assinatura ativa no Orça Norte.
            </p>
            <p>
              Para alterar seu plano atual, acesse a página de{" "}
              <span className="font-semibold text-[#0052FF]">Gerenciamento de Assinatura</span>.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Fechar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-[#0052FF] hover:bg-[#0052FF]/90"
            onClick={() => {
              const slug = storeSlug?.slug;
              if (slug) {
                router.push(`/loja/${slug}/assinatura`);
              } else {
                router.push('/loja/loading');
              }
            }}
          >
            Ir para Assinatura
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

