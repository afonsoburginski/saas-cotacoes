"use client"

import { useEffect, useState, useMemo } from "react"
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

    // Aguardar 2 segundos e mostrar sucesso
    const timer = setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      console.log('✅ Pagamento confirmado!')
      
      // Abrir dialog automaticamente se usuário não estiver logado
      if (!session?.user) {
        console.log('🔑 Abrindo dialog de cadastro/login...')
        setAuthDialogOpen(true)
      }
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [searchParams, router, session])

  // Fechar dialog quando usuário fizer login
  useEffect(() => {
    if (session?.user && authDialogOpen) {
      console.log('✅ Usuário logado, fechando dialog')
      setAuthDialogOpen(false)
    }
  }, [session, authDialogOpen])

  // Quando usuário fizer login, mostrar "Tudo Pronto!" depois "Ir para Minha Loja"
  useEffect(() => {
    if (session?.user && success) {
      console.log('✅ Usuário logado após pagamento!')
      console.log('📧 Email:', session.user.email)
      console.log('🆔 ID:', session.user.id)
      console.log('🎯 Estado: readyForStore =', readyForStore)
      
      // Mostrar "Tudo Pronto!" primeiro
      if (!readyForStore) {
        console.log('🎉 Mudando botão para "Tudo Pronto! 🎉"')
        setButtonText('Tudo Pronto! 🎉')
        
        // Aguardar 2 segundos e mudar para "Ir para Minha Loja"
        const timer = setTimeout(() => {
          console.log('🏪 Mudando botão para "Ir para Minha Loja"')
          setButtonText('Ir para Minha Loja')
          setReadyForStore(true)
        }, 2000)
        
        return () => clearTimeout(timer)
      }
    }
  }, [session, success, readyForStore])

  const handleFinalizarCadastro = () => {
    console.log('🔑 Abrindo dialog de cadastro/login...')
    setAuthDialogOpen(true)
  }

  const handleGoToStore = () => {
    console.log('🏪 Redirecionando para loja...')
    router.push('/loja/loading')
  }

  const dialogCopy = useMemo(() => ({
    title: 'Finalize seu cadastro',
    description: (
      <>
        Você já garantiu a sua assinatura.
        <br />
        Entre com o Google para acessar sua nova loja no Orça Norte.
      </>
    ),
    googleButtonLabel: 'Finalizar com Google',
    googleLoadingLabel: 'Conectando...'
  }), [])

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
              {session?.user ? 'Sua loja está pronta!' : 'Finalize seu cadastro para acessar sua loja'}
            </p>
            
            {/* Botão muda conforme o estado */}
            <AnimatePresence mode="wait">
              {!session?.user && (
                <motion.div
                  key="finalizar"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Button 
                    onClick={handleFinalizarCadastro}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Finalizar Cadastro
                  </Button>
                </motion.div>
              )}
              
              {session?.user && !readyForStore && (
                <motion.div
                  key="pronto"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button 
                    disabled
                    size="lg"
                    className="bg-green-100 text-green-700 border-2 border-green-400 cursor-wait"
                  >
                    {buttonText}
                  </Button>
                </motion.div>
              )}
              
              {readyForStore && session?.user && (
                <motion.div
                  key="loja"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button 
                    onClick={handleGoToStore}
                    size="lg"
                    className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white"
                  >
                    <Store className="mr-2 h-5 w-5" />
                    Ir para Minha Loja
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Auth Dialog */}
        <AuthDialog
          open={authDialogOpen}
          onOpenChange={(open) => {
            console.log('🔄 Dialog mudou para:', open)
            setAuthDialogOpen(open)
          }}
          mode="register"
          title={dialogCopy.title}
          description={dialogCopy.description}
          googleButtonLabel={dialogCopy.googleButtonLabel}
          googleLoadingLabel={dialogCopy.googleLoadingLabel}
        />
      </div>
    )
  }

  return null
}