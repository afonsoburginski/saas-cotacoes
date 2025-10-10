"use client";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Como funciona?",
    answer: "Escolha um plano, crie seu perfil e comece a receber cotações!"
  },
  {
    question: "Cobram taxa por venda?",
    answer: "NÃO! Você paga apenas a mensalidade. Todo lucro é 100% seu."
  },
  {
    question: "Diferença entre planos?",
    answer: "Básico: 50 produtos. Plus: 300 + divulgação. Premium: ilimitado + vídeos."
  },
  {
    question: "Como recebo pagamentos?",
    answer: "A plataforma conecta você com o cliente. Vocês acertam como preferir."
  },
  {
    question: "Posso cancelar?",
    answer: "Sim! Cancele quando quiser, sem multas."
  }
];

export function FAQMobile() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-8 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-5">
          <h2 className="text-xl font-bold text-gray-900 mb-1 font-marlin">
            Dúvidas Frequentes
          </h2>
          <p className="text-xs text-gray-600 font-montserrat">
            Tudo sobre os planos
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-4 py-4 text-left flex items-center justify-between active:bg-gray-50 transition-colors"
              >
                <h3 className="text-sm font-semibold text-gray-900 pr-3 flex-1 font-marlin">
                  {faq.question}
                </h3>
                <ChevronDown 
                  className={`w-5 h-5 text-[#0052FF] flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {openIndex === index && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-600 leading-relaxed font-montserrat">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

