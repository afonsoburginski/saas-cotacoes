"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckoutAdaptive } from "@/components/checkout"
import { useToast } from "@/hooks/use-toast"
import { useStoreSlug } from "@/hooks/use-store-slug"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, isPending } = useSession()
  const { toast } = useToast()
  const { data: storeSlug } = useStoreSlug()
  
  // Pegar plano da URL se vier da landing page
  const planFromUrl = searchParams?.get('plan') as 'basico' | 'plus' | 'premium' | null
  const [selectedPlan, setSelectedPlan] = useState<'basico' | 'plus' | 'premium'>('plus')
  const [isLoading, setIsLoading] = useState(false)
  const [showExistingSubDialog, setShowExistingSubDialog] = useState(false)
  
  // Atualizar plano se vier da URL
  useEffect(() => {
    if (planFromUrl && ['basico', 'plus', 'premium'].includes(planFromUrl)) {
      setSelectedPlan(planFromUrl)
    }
  }, [planFromUrl])

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/')
    }
  }, [session, isPending, router])
  
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }
  
  if (!session?.user) {
    return null
  }

  const handleSubscribe = async () => {
    setIsLoading(true)
    
    try {
      // Normalizar nome do plano (remover acentos)
      const normalizedPlan = selectedPlan
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
      
      console.log('🛒 Criando checkout. Plano:', selectedPlan, '→', normalizedPlan)
      
      // Criar Stripe Checkout Session
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: normalizedPlan })
      })
      
      // Detectar se já tem assinatura ativa (409 Conflict)
      if (res.status === 409) {
        setShowExistingSubDialog(true)
        setIsLoading(false)
        return
      }
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create checkout session')
      }
      
      const { url } = await res.json()
      
      // Redirecionar para o Stripe Checkout
      if (url) {
        window.location.href = url
      }
    } catch (error: any) {
      console.error('Erro no checkout:', error)
      toast({
        title: "Erro no checkout",
        description: error.message || "Não foi possível processar o pagamento.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <>
      <CheckoutAdaptive 
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
        isLoading={isLoading}
        handleSubscribe={handleSubscribe}
      />

      {/* Dialog para quando já tem assinatura ativa */}
      <AlertDialog open={showExistingSubDialog} onOpenChange={setShowExistingSubDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você já tem um plano ativo! 🎉</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Sua conta já possui uma assinatura ativa no Orça Norte.
              </p>
              <p>
                Para alterar seu plano atual, acesse a página de{" "}
                <span className="font-semibold text-[#0052FF]">Gerenciamento de Assinatura</span>.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#0052FF] hover:bg-[#0052FF]/90"
              onClick={() => {
                const slug = storeSlug?.slug
                if (slug) {
                  router.push(`/loja/${slug}/assinatura`)
                } else {
                  router.push('/loja/loading')
                }
              }}
            >
              Ir para Assinatura
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
