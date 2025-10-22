"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Como funciona a plataforma para empresas?",
    answer: "Você escolhe um plano mensal (Básico, Plus ou Premium), cria seu perfil profissional, cadastra seus produtos ou serviços e começa a receber cotações de clientes interessados. Simples assim!"
  },
  {
    question: "Vocês cobram taxa por venda ou comissão?",
    answer: "NÃO! Você paga apenas a mensalidade do plano escolhido. Todo o lucro das suas vendas é 100% seu. Sem surpresas, sem taxas escondidas."
  },
  {
    question: "Como recebo os pagamentos dos clientes?",
    answer: "A plataforma apenas conecta você com o cliente. Pagamentos são feitos diretamente com a Empresa escolhida."
  },
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer: "Sim! Você pode cancelar quando quiser, sem multas ou taxas de cancelamento. Seu plano permanece ativo até o fim do período pago."
  },
  {
    question: "Prestadores de serviço também podem usar?",
    answer: "Sim! Pedreiros, eletricistas, encanadores, pintores e outros profissionais da construção podem divulgar seus serviços e receber orçamentos de clientes."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-marlin">
            Dúvidas Frequentes
          </h2>
          <p className="text-xl text-gray-600 font-montserrat">
            Tudo que você precisa saber sobre nossos planos de assinatura
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-[#0052FF]/5 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4 font-marlin">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-[#0052FF]" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-6">
                      <p className="text-gray-600 leading-relaxed font-montserrat">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
