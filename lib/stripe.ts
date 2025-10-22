import Stripe from 'stripe'

const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_SECRET

if (!stripeKey) {
  console.warn('⚠️ STRIPE_SECRET_KEY ou STRIPE_API_SECRET não configurado')
}

export const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
}) : null as any

// Chave pública (não precisa mais com price_data dinâmico)
export const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_API_PUBLIC

