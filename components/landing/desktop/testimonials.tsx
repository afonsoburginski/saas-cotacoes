"use client";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

const testimonials = [
  {
    text: "Assinei o plano Plus e em 2 meses aumentei minhas vendas em 45%. Recebo cotações todos os dias e sem pagar nada por venda!",
    name: "Carlos Mendes",
    title: "Proprietário - Depósito São Paulo"
  },
  {
    text: "Como prestador de serviço, o plano Básico já me trouxe mais de 20 clientes. Melhor investimento que já fiz!",
    name: "João Silva",
    title: "Pedreiro Autônomo - Silva Construções"
  },
  {
    text: "O plano Premium com vídeos aumentou nossa conversão em 60%. Os clientes confiam mais quando veem os produtos em ação.",
    name: "Maria Santos",
    title: "Gerente Comercial - Casa & Obra Materiais"
  },
  {
    text: "A divulgação automática do plano Plus trouxe 3x mais clientes para minha loja. Vale cada centavo!",
    name: "Pedro Oliveira",
    title: "Dono - Materiais Forte"
  },
  {
    text: "Sem taxas por venda foi o que me convenceu. Já recuperei o investimento na primeira semana!",
    name: "Ana Costa",
    title: "Eletricista - AC Elétrica"
  }
];

export function Testimonials() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-marlin">
            Empresas e Prestadores Crescendo
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-montserrat">
            Mais de 500 empresas e prestadores já aumentaram suas vendas com nossos planos
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
