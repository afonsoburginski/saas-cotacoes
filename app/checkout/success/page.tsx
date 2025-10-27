"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CheckoutSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    async function redirect() {
      // Salvar flag de pagamento confirmado
      localStorage.setItem('payment_confirmed', 'true')
      
      // Aguardar webhook processar
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Buscar slug da loja
      const res = await fetch('/api/user/store')
      if (res.ok) {
        const data = await res.json()
        if (data.slug) {
          router.push(`/loja/${data.slug}/catalogo`)
        } else {
          // Tentar novamente após mais tempo
          await new Promise(resolve => setTimeout(resolve, 2000))
          const res2 = await fetch('/api/user/store')
          const data2 = await res2.json()
          if (data2.slug) {
            router.push(`/loja/${data2.slug}/catalogo`)
          } else {
            router.push('/loja/loading')
          }
        }
      } else {
        router.push('/loja/loading')
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

