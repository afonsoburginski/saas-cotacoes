"use client";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

const testimonials = [
  {
    text: "Plano Plus aumentou vendas em 45% em 2 meses. Recebo cotações todo dia!",
    name: "Carlos M.",
    title: "Depósito São Paulo"
  },
  {
    text: "Plano Básico já trouxe +20 clientes. Melhor investimento que fiz!",
    name: "João S.",
    title: "Pedreiro Autônomo"
  },
  {
    text: "Premium com vídeos: +60% conversão. Clientes confiam mais!",
    name: "Maria S.",
    title: "Casa & Obra"
  },
  {
    text: "Divulgação do Plus trouxe 3x mais clientes. Vale cada centavo!",
    name: "Pedro O.",
    title: "Materiais Forte"
  }
];

export function TestimonialsMobile() {
  return (
    <section className="py-8 px-4 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-5">
          <h2 className="text-xl font-bold text-gray-900 mb-1 font-marlin">
            Empresas Crescendo
          </h2>
          <p className="text-xs text-gray-600 font-montserrat">
            +500 empresas aumentaram vendas
          </p>
        </div>

        <InfiniteMovingCards
          items={testimonials}
          direction="left"
          speed="slow"
          pauseOnHover={true}
        />
      </div>
    </section>
  );
}

