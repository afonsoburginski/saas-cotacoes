"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Como funciona para consumidores?",
    answer: "É grátis! Você cadastra sua lista de materiais, compara preços de diferentes lojistas da sua região e pode comprar diretamente pela plataforma com entrega na obra."
  },
  {
    question: "Como os lojistas se cadastram?",
    answer: "Lojistas escolhem um plano mensal (R$ 99 ou R$ 129,99), cadastram seus produtos e começam a receber cotações de clientes interessados. Sem taxas por venda!"
  },
  {
    question: "Que tipos de materiais posso encontrar?",
    answer: "Temos todos os materiais de construção: cimento, tijolos, telhas, ferragens, tintas, pisos, azulejos, madeiras, tubulações e muito mais. Milhares de produtos disponíveis."
  },
  {
    question: "A entrega é garantida?",
    answer: "Sim! Todos os lojistas são verificados e devem cumprir prazos de entrega. Temos sistema de avaliações e em caso de problemas, nossa equipe intervém para resolver."
  },
  {
    question: "Posso negociar preços?",
    answer: "Claro! Você pode entrar em contato direto com os lojistas através da plataforma para negociar preços, especialmente em compras grandes ou recorrentes."
  },
  {
    question: "Como funciona o pagamento?",
    answer: "Oferecemos várias formas: cartão, PIX, boleto ou direto com o lojista. Para lojistas, cobramos apenas a mensalidade do plano escolhido."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Dúvidas Frequentes
          </h2>
          <p className="text-xl text-gray-600">
            Tudo que você precisa saber sobre materiais de construção na nossa plataforma
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
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
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
                      <p className="text-gray-600 leading-relaxed">
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
