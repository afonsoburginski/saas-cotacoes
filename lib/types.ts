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
  email?: string
  telefone?: string
  cnpj: string
  endereco?: string
  status: "active" | "suspended" | "pending" | "rejected"
  businessType?: "comercio" | "servico"
  priorityScore: number
  plano: "Basic" | "Pro" | "Premium"
  createdAt: string
  shippingPolicy: ShippingPolicy
  address?: {
    lat: number
    lng: number
    cidade: string
    estado: string
  }
  totalProducts?: number
  totalSales?: number
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

export type Service = {
  id: string
  storeId: string
  storeNome: string
  nome: string
  categoria: string // Ex: "Alvenaria", "Elétrica", "Pintura"
  preco: number
  precoMinimo?: number // Para serviços com variação
  precoMaximo?: number
  tipoPrecificacao: 'hora' | 'dia' | 'projeto' | 'm2' | 'visita' // Como é cobrado
  rating: number
  imagemUrl?: string
  imagens?: string[] // Portfolio de trabalhos
  ativo: boolean
  destacado?: boolean
  descricao?: string
}

export type CatalogItemType = 'product' | 'service'

// Tipo discriminado para catalog items
export type CatalogItem = 
  | (Product & { type: 'product' })
  | (Service & { type: 'service' })

export type Review = {
  id: string
  userNome: string
  rating: number
  comentario: string
  productId?: string
  storeId?: string
  status: "pending" | "approved" | "hidden"
  createdAt: string
}

export type CartItem = {
  id: string
  productId?: string
  serviceId?: string
  storeId: string
  qty: number
  productNome: string
  storeNome: string
  precoUnit: number
  imagemUrl?: string
  tipo?: 'product' | 'service' // Para diferenciar produtos de serviços
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
