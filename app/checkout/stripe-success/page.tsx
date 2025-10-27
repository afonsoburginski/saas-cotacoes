"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

export default function StripeSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const processPayment = async () => {
      try {
        const session_id = searchParams.get('session_id')
        
        if (!session_id) {
          setError('Sessão de pagamento inválida')
          setLoading(false)
          return
        }

        // Verificar status do pagamento
        const res = await fetch(`/api/stripe/session-details?session_id=${session_id}`)
        const data = await res.json()

        if (!res.ok || data.payment_status !== 'paid') {
          setError('Pagamento não confirmado')
          setLoading(false)
          return
        }

        // Criar/atualizar loja automaticamente
        const createStoreRes = await fetch('/api/store/create-from-stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id,
            customer_email: data.customer_email,
            customer_id: data.customer_id,
            subscription_id: data.subscription_id,
          })
        })

        if (!createStoreRes.ok) {
          const errorData = await createStoreRes.json()
          console.error('Erro ao criar loja:', errorData)
          // Continuar mesmo assim - webhook vai processar
        }

        setSuccess(true)
        setLoading(false)

        // Redirecionar para loja após 3 segundos
        setTimeout(async () => {
          if (createStoreRes.ok) {
            const storeData = await createStoreRes.json();
            if (storeData.slug) {
              router.push(`/loja/${storeData.slug}/catalogo`);
            } else {
              router.push('/loja/loading')
            }
          } else {
            // Esperar webhook processar
            setTimeout(() => router.push('/loja/loading'), 2000)
          }
        }, 3000)

      } catch (err) {
        console.error('Erro no sucesso do pagamento:', err)
        setError('Erro ao processar pagamento')
        setLoading(false)
      }
    }

    processPayment()
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Confirmando seu pagamento...
          </h2>
          <p className="text-gray-600">
            Preparando sua loja
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/explorar')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar para Início
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex justify-center mb-6"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Pagamento Confirmado! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              Redirecionando para sua loja...
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return null
}

