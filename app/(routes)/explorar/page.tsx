import { Metadata } from "next"
import { ExplorarPageClient } from "./explorar-client"

export const metadata: Metadata = {
  title: "Explorar Produtos",
  description: "Explore milhares de produtos de materiais de construção. Compare preços, veja detalhes e faça suas cotações.",
  keywords: [
    "produtos materiais construção",
    "explorar materiais construção",
    "buscar materiais construção",
    "catálogo materiais construção",
  ],
  openGraph: {
    title: "Explorar Produtos - Orça Norte",
    description: "Explore milhares de produtos de materiais de construção. Compare preços e veja detalhes.",
    url: "https://orcanorte.com.br/explorar",
  },
}

export default function ExplorarPage() {
  return <ExplorarPageClient />
}
