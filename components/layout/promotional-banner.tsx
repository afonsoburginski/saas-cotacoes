"use client"

import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"

const promotionalItems = [
  {
    text: "🎉 Desconto de 30% em todas as assinaturas Premium! Use o código SAVE30",
    name: "Oferta Especial",
    title: "Válida até 31/12/2024",
  },
  {
    text: "⚡ Compare preços de mais de 10.000 produtos em tempo real",
    name: "Comparação Inteligente",
    title: "Tecnologia IA",
  },
  {
    text: "🚀 Novo: Alertas de preço personalizados para seus produtos favoritos",
    name: "Novidade",
    title: "Recurso Premium",
  },
  {
    text: "💰 Economize até R$ 500 por mês com nossas comparações inteligentes",
    name: "Economia Garantida",
    title: "Resultado Comprovado",
  },
  {
    text: "🏆 Mais de 50.000 usuários confiam em nossa plataforma",
    name: "Confiança",
    title: "Líderes do Mercado",
  },
  {
    text: "📊 Dashboard administrativo com métricas em tempo real",
    name: "Admin Tools",
    title: "Controle Total",
  },
  {
    text: "🔒 Segurança de nível empresarial para seus dados",
    name: "Segurança",
    title: "Proteção Máxima",
  },
]

export function PromotionalBanner() {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-primary/15 via-primary/8 to-primary/15 border-b border-border/30 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      <InfiniteMovingCards
        items={promotionalItems}
        direction="left"
        speed="normal"
        pauseOnHover={true}
        className="py-2.5"
      />
    </div>
  )
}
