export type Role = "admin" | "loja" | "usuario"

export type Store = {
  id: string
  nome: string
  cnpj: string
  status: "ativo" | "suspenso"
  priorityScore: number
  plano: "Basic" | "Pro"
  createdAt: string
}

export type Product = {
  id: string
  storeId: string
  storeNome: string
  nome: string
  categoria: string
  preco: number
  estoque: number
  rating: number
  imagemUrl?: string
  ativo: boolean
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
}

export type Plan = {
  id: string
  nome: string
  preco: number
  periodicidade: "mensal" | "anual"
  recursos: string[]
  ativo: boolean
}
