"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useSession } from "@/lib/auth-client"

export default function ExternalCheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const createAccountAndRedirect = async () => {
      try {
        const session_id = searchParams.get('session_id')
        
        if (!session_id) {
          setError('ID de sessão não encontrado')
          setLoading(false)
          return
        }

        // Buscar dados da sessão do Stripe
        const res = await fetch(`/api/stripe/session-details?session_id=${session_id}`)
        const sessionData = await res.json()

        if (!res.ok) {
          setError('Erro ao buscar dados da sessão')
          setLoading(false)
          return
        }

        const { customer_email, subscription_id } = sessionData

        // Se não tem usuário logado, criar automaticamente
        if (!session?.user) {
          // Redirecionar para criação de conta
          router.push(`/signup?email=${encodeURIComponent(customer_email)}&from_stripe=true`)
          return
        }

        // Usuário já logado - só redirecionar para loja
        const storeResponse = await fetch('/api/user/store')
        const storeData = await storeResponse.json()
        
        if (storeData.slug) {
          router.push(`/loja/${storeData.slug}/catalogo`)
        } else {
          router.push('/loja/loading')
        }
      } catch (err) {
        console.error('Erro no checkout externo:', err)
        setError('Erro ao processar pagamento')
        setLoading(false)
      }
    }

    createAccountAndRedirect()
  }, [searchParams, session, router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/explorar')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Voltar para Início
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Processando seu pagamento...
        </h2>
        <p className="text-gray-600">
          Isso pode levar alguns segundos
        </p>
      </div>
    </div>
  )
}

