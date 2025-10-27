"use client";
import { motion } from "framer-motion";
import { Check, Store, Rocket, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStoreSlug } from "@/hooks/use-store-slug";
import { usePlans } from "@/hooks/use-plans";
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

// Mapear ícones
const iconMap: Record<string, React.ElementType> = {
  store: Store,
  rocket: Rocket,
  video: Video,
}

const staticPlans = [
  {
    name: "Básico",
    price: "R$ 129,99",
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
    price: "R$ 219,99",
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
    price: "R$ 289,99",
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

export function Pricing() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [selectedPlanForAuth, setSelectedPlanForAuth] = useState<string | null>(null);
  const [showExistingSubDialog, setShowExistingSubDialog] = useState(false);
  const { data: session } = useSession();
  const { data: storeSlug } = useStoreSlug();
  const router = useRouter();
  const { data: dynamicPlans, isLoading } = usePlans();

  // Combinar dados dinâmicos com dados estáticos
  const plans = dynamicPlans && dynamicPlans.length > 0 ? dynamicPlans.map((dp: any) => {
    const staticPlan = staticPlans.find(sp => sp.name === dp.nome);
    return {
      ...dp,
      name: dp.nome,
      price: dp.precoFormatted,
      period: "/mês",
      icon: iconMap[dp.icon] || Store,
      description: dp.description || staticPlan?.description || "",
      features: staticPlan?.features || [],
      buttonText: "Começar Agora",
      popular: dp.id === 'plus',
      color: "bg-[#0052FF]",
    };
  }) : staticPlans;

  if (isLoading) {
    return <div>Carregando planos...</div>
  }
  
  const handlePlanClick = (planName: string) => {
    // Converter nome para ID (sem acentos)
    const planId = planName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove acentos: básico → basico
    
    if (session?.user) {
      // Se já estiver logado, cria checkout Stripe direto
      createStripeCheckout(planId);
    } else {
      // Salva o plano selecionado no state
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

  return (
    <>
    <section className="py-16 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 font-marlin">
            Planos para Empresas e Prestadores
          </h2>
          <p className="text-base text-gray-600 font-montserrat">
            Escolha o plano ideal para seu negócio
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative bg-white rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg ${
                plan.popular ? 'border-[#0052FF]' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#0052FF] text-white px-3 py-1 rounded-full text-xs font-bold font-montserrat">
                    Mais Popular
                  </span>
                </div>
              )}
              
              {/* Header com ícone, título e preço */}
              <div className="relative mb-5">
                <div className="flex items-start gap-3">
                  <div className={`${plan.color} rounded-xl p-3 w-14 h-14 flex-shrink-0`}>
                    <plan.icon className="w-full h-full text-white" />
                  </div>
                  <div className="flex-1 pr-20">
                    <h3 className="text-lg font-bold text-gray-900 mb-0.5 font-marlin leading-tight">{plan.name}</h3>
                    <p className="text-xs text-gray-600 font-montserrat leading-snug">{plan.description}</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 text-right">
                  <span className="text-2xl font-bold text-gray-900 block leading-none">{plan.price}</span>
                  <span className="text-gray-500 text-xs font-montserrat mt-0.5 block">{plan.period}</span>
                </div>
              </div>
              
                     <Button 
                       onClick={() => handlePlanClick(plan.name)}
                       className="w-full mb-6 bg-[#0052FF] hover:bg-[#0052FF]/90 text-white border-0"
                     >
                       {plan.buttonText}
                     </Button>
              
              <div className="border-t border-gray-100 pt-5">
                <p className="text-xs font-semibold text-gray-500 mb-3 font-montserrat">Features Incluídas:</p>
                <ul className="space-y-2.5">
                  {(plan.features || []).map((feature: any, featureIndex: number) => (
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
            </motion.div>
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
