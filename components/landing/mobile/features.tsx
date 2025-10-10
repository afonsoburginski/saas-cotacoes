"use client";
import { Store, TrendingUp, Users, Rocket, Video, BarChart3 } from "lucide-react";
import { VerticalInfiniteCards } from "@/components/ui/vertical-infinite-cards";

const features = [
  {
    icon: Users,
    title: "Receba Cotações Diárias",
    description: "Clientes interessados entram em contato direto com você.",
    color: "bg-gradient-to-br from-[#0052FF] to-[#0052FF]/80"
  },
  {
    icon: Store,
    title: "Perfil Profissional",
    description: "Cadastre produtos com fotos, preços e descrições completas.",
    color: "bg-[#0052FF]"
  },
  {
    icon: TrendingUp,
    title: "Divulgação Automática",
    description: "Promovemos sua empresa para novos clientes todos os dias.",
    color: "bg-[#0052FF]"
  },
  {
    icon: Video,
    title: "Vídeos Promocionais",
    description: "Publique vídeos dos produtos e aumente conversões.",
    color: "bg-[#0052FF]"
  },
  {
    icon: BarChart3,
    title: "Relatórios Completos",
    description: "Acompanhe visualizações, cotações recebidas e conversões.",
    color: "bg-[#0052FF]"
  },
  {
    icon: Rocket,
    title: "0% de Taxa por Venda",
    description: "Todo o lucro é seu. Pague apenas a assinatura mensal.",
    color: "bg-[#0052FF]"
  }
];

export function FeaturesMobile() {
  return (
    <section className="py-8 px-4 bg-white">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-5">
          <h2 className="text-xl font-bold text-gray-900 mb-1 font-marlin">
            O que você recebe
          </h2>
          <p className="text-xs text-gray-600 font-montserrat">
            Recursos principais
          </p>
        </div>

        <VerticalInfiniteCards items={features} speed="normal" pauseOnHover={true} />
      </div>
    </section>
  );
}
