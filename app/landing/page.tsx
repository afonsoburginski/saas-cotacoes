import { Metadata } from "next"
import { LandingPageClient } from "./landing-client"

export const metadata: Metadata = {
  title: "Início - Plataforma de Cotações de Materiais de Construção",
  description: "Descubra a plataforma que conecta consumidores e fornecedores de materiais de construção. Compare preços, encontre os melhores fornecedores e simplifique suas cotações.",
  keywords: [
    "plataforma cotação materiais construção",
    "cotação online materiais construção",
    "fornecedores materiais construção Manaus",
    "comparação preços construção",
    "cotação inteligente materiais",
  ],
  openGraph: {
    title: "Orça Norte - Plataforma de Cotações de Materiais de Construção",
    description: "Descubra a plataforma que conecta consumidores e fornecedores de materiais de construção.",
    url: "https://orcanorte.com.br/landing",
  },
}

export default function LandingPage() {
  return <LandingPageClient />
}

