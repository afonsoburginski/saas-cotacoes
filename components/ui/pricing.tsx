"use client";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Rocket, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Consumidor",
    price: "Grátis",
    period: "",
    description: "Para construtores e pessoas físicas",
    icon: User,
    features: [
      "Orçamentos ilimitados",
      "Comparação de preços",
      "Contato direto com lojistas",
      "Histórico de cotações",
      "Suporte por email"
    ],
    buttonText: "Começar Grátis",
    popular: false,
    color: "bg-[#0052FF]"
  },
  {
    name: "Lojista Básico",
    price: "R$ 99",
    period: "/mês",
    description: "Ideal para lojas pequenas e médias",
    icon: Crown,
    features: [
      "Cadastro de até 500 produtos",
      "Receber cotações dos clientes",
      "Painel de vendas",
      "Suporte prioritário",
      "Relatórios de performance",
      "Sem taxa por venda"
    ],
    buttonText: "Começar Teste Grátis",
    popular: true,
    color: "bg-[#22C55E]"
  },
  {
    name: "Lojista Premium",
    price: "R$ 129,99",
    period: "/mês",
    description: "Para grandes lojas e redes",
    icon: Rocket,
    features: [
      "Produtos ilimitados",
      "Destaque nos resultados",
      "API para integração",
      "Suporte 24/7",
      "Gerente de conta dedicado",
      "Sem taxa por venda"
    ],
    buttonText: "Falar com Vendas",
    popular: false,
    color: "bg-[#0052FF]"
  }
];

export function Pricing() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Planos para Lojistas e Consumidores
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Consumidores usam grátis. Lojistas vendem mais e pagam apenas pelo sucesso
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-[#22C55E] scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#22C55E] text-white px-4 py-2 rounded-full text-sm font-bold">
                    Mais Popular
                  </span>
                </div>
              )}
              
              <div className={`w-16 h-16 rounded-2xl ${plan.color} p-4 mb-6`}>
                <plan.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-600">{plan.period}</span>
              </div>
              
              <Button 
                className={`w-full mb-8 ${
                  plan.color === 'bg-[#22C55E]'
                    ? 'bg-[#22C55E] hover:bg-[#22C55E]/90 text-white' 
                    : 'bg-[#0052FF] hover:bg-[#0052FF]/90 text-white'
                }`}
              >
                {plan.buttonText}
              </Button>
              
              <ul className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className={`w-5 h-5 mr-3 flex-shrink-0 ${
                      plan.color === 'bg-[#22C55E]' ? 'text-[#22C55E]' : 'text-[#0052FF]'
                    }`} />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
