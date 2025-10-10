"use client";
import { Check, Store, Rocket, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useState } from "react";

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
      "Cadastro de até 50 produtos/serviços",
      "Painel de controle",
      "Relatórios básicos de desempenho",
      "Otimização SEO básica",
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
      "Cadastro de até 300 produtos/serviços",
      "Divulgação automática nas buscas",
      "Destaque nos resultados",
      "Campanhas de marketing mensais",
      "Relatórios avançados e analytics",
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
      "Produtos/serviços ilimitados",
      "2 vídeos promocionais por mês",
      "Cada vídeo fica 15 dias no ar",
      "Campanhas de marketing semanais",
      "Divulgação em múltiplas plataformas",
      "Relatórios completos detalhados",
      "Suporte prioritário 24/7"
    ],
    buttonText: "Começar Agora",
    popular: false,
    color: "bg-[#0052FF]"
  }
];

export function PricingMobile() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
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
                onClick={() => setAuthDialogOpen(true)}
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
      onOpenChange={setAuthDialogOpen}
      mode="login"
    />
    </>
  );
}

