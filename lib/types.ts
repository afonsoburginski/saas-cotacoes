export type Role = "admin" | "loja" | "usuario"

export type ShippingPolicy = {
  type: "free" | "free_radius" | "per_km" | "fixed"
  freeRadius?: number // em km, para type: "free_radius"
  pricePerKm?: number // para type: "per_km" ou "free_radius" (após o raio)
  fixedPrice?: number // para type: "fixed"
  minOrderForFreeShipping?: number // valor mínimo para frete grátis
}

export type Store = {
  id: string
  nome: string
  cnpj: string
  status: "ativo" | "suspenso"
  priorityScore: number
  plano: "Basic" | "Pro"
  createdAt: string
  shippingPolicy: ShippingPolicy
  address?: {
    lat: number
    lng: number
    cidade: string
    estado: string
  }
}

export type Product = {
  id: string
  storeId: string
  storeNome: string
  nome: string
  categoria: string
  preco: number
  precoPromocional?: number
  estoque: number
  unidadeMedida?: string
  rating: number
  imagemUrl?: string
  imagens?: string[]
  ativo: boolean
  destacado?: boolean
  sku?: string
  descricao?: string
  temVariacaoPreco?: boolean
  peso?: number
  dimensoes?: {
    comprimento: number
    largura: number
    altura: number
  }
}

export type Review = {
  id: string
  userNome: string
  rating: number
  comentario: string
  productId?: string
  storeId?: string
  status: "pendente" | "aprovado" | "oculto"
  createdAt: string
}

export type CartItem = {
  id: string
  productId: string
  storeId: string
  qty: number
  productNome: string
  storeNome: string
  precoUnit: number
  imagemUrl?: string
}

export type PurchaseList = {
  id: string
  nome: string
  createdAt: string
  items: CartItem[]
  observacoes?: string
  totalEstimado: number
  shippingCosts?: Record<string, number> // storeId -> custo de frete
  totalComFrete?: number
}

export type Plan = {
  id: string
  nome: string
  preco: number
  periodicidade: "mensal" | "anual"
  recursos: string[]
  ativo: boolean
}
