import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ShippingPolicy } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para calcular distância entre dois pontos (fórmula de Haversine)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Função para calcular o custo de frete
export function calculateShippingCost(
  policy: ShippingPolicy,
  orderTotal: number,
  distanceKm: number = 12 // distância padrão para simulação
): number {
  // Se o pedido atinge o mínimo para frete grátis
  if (policy.minOrderForFreeShipping && orderTotal >= policy.minOrderForFreeShipping) {
    return 0
  }

  switch (policy.type) {
    case "free":
      return 0

    case "free_radius":
      if (distanceKm <= (policy.freeRadius || 0)) {
        return 0
      }
      // Cobra pela distância além do raio grátis
      const extraDistance = distanceKm - (policy.freeRadius || 0)
      return extraDistance * (policy.pricePerKm || 0)

    case "per_km":
      return distanceKm * (policy.pricePerKm || 0)

    case "fixed":
      return policy.fixedPrice || 0

    default:
      return 0
  }
}

// Função para formatar informação de frete
export function formatShippingInfo(policy: ShippingPolicy | null): string {
  if (!policy) return "Consultar frete"
  
  switch (policy.type) {
    case "free":
      return "Frete Grátis"

    case "free_radius":
      return `Grátis até ${policy.freeRadius}km, depois R$ ${policy.pricePerKm?.toFixed(2)}/km`

    case "per_km":
      if (policy.minOrderForFreeShipping) {
        return `R$ ${policy.pricePerKm?.toFixed(2)}/km (grátis acima de R$ ${policy.minOrderForFreeShipping})`
      }
      return `R$ ${policy.pricePerKm?.toFixed(2)}/km`

    case "fixed":
      if (policy.minOrderForFreeShipping) {
        return `R$ ${policy.fixedPrice?.toFixed(2)} (grátis acima de R$ ${policy.minOrderForFreeShipping})`
      }
      return `R$ ${policy.fixedPrice?.toFixed(2)}`

    default:
      return "Consultar"
  }
}
