"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CheckoutSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    async function redirect() {
      // Salvar flag de pagamento confirmado
      localStorage.setItem('payment_confirmed', 'true')
      
      // Buscar slug da loja
      const res = await fetch('/api/user/store')
      if (res.ok) {
        const data = await res.json()
        if (data.slug) {
          router.push(`/loja/${data.slug}`)
        } else {
          router.push('/') // Fallback
        }
      }
    }
    
    redirect()
  }, [router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )
}

