"use client";
import { motion } from "framer-motion";
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

export function Pricing() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

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
                onClick={() => setAuthDialogOpen(true)}
                className="w-full mb-6 bg-[#0052FF] hover:bg-[#0052FF]/90 text-white border-0"
              >
                {plan.buttonText}
              </Button>
              
              <div className="border-t border-gray-100 pt-5">
                <p className="text-xs font-semibold text-gray-500 mb-3 font-montserrat">Features Incluídas:</p>
                <ul className="space-y-2.5">
                  {plan.features.map((feature, featureIndex) => (
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
      onOpenChange={setAuthDialogOpen}
      mode="login"
    />
    </>
  );
}
