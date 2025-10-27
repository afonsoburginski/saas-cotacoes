"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, CheckCircle2, Store } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { useSession } from "@/lib/auth-client"

export default function StripeSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [readyForStore, setReadyForStore] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [buttonText, setButtonText] = useState('Tudo Pronto! 🎉')

  useEffect(() => {
    const session_id = searchParams.get('session_id')
    
    console.log('✅ Stripe success page carregado, session_id:', session_id)
    
    if (!session_id) {
      console.error('Sessão de pagamento inválida')
      router.push('/')
      return
    }

    // Aguardar 2 segundos e abrir dialog automaticamente
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      console.log('✅ Pagamento confirmado, abrindo dialog...')
      
      // Abrir dialog de login imediatamente
      setAuthDialogOpen(true)
    }, 2000)
  }, [searchParams, router])

  // Quando usuário fizer login, mostrar botão de loja
  useEffect(() => {
    if (session?.user && success) {
      console.log('✅ Usuário logado após pagamento!')
      setAuthDialogOpen(false) // Fecha o dialog
      setTimeout(() => {
        setReadyForStore(true)
        setButtonText('Ir para Minha Loja')
      }, 1000)
    }
  }, [session, success])

  // Quando dialog fechar E usuário logado, mostrar botão
  useEffect(() => {
    if (!authDialogOpen && session?.user && success && !readyForStore) {
      setReadyForStore(true)
      setButtonText('Ir para Minha Loja')
    }
  }, [authDialogOpen, session, success, readyForStore])

  const handleGoToStore = () => {
    console.log('🏪 Redirecionando para loja...')
    router.push('/loja/loading')
  }

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
            onClick={() => router.push('/')}
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
              Sua loja está sendo preparada!
            </p>
            {readyForStore && (
              <Button 
                onClick={handleGoToStore}
                size="lg"
                className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white"
              >
                <Store className="mr-2 h-5 w-5" />
                Ir para Minha Loja
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Auth Dialog */}
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        mode="register"
      />
    </>
  )
}

