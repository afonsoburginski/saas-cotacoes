"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Calendar, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "@/lib/auth-client"
import { CircularProgress } from "@/components/ui/circular-progress"
import { LojaHeader } from "@/components/loja/loja-header"
import { AssinaturaSkeleton } from "@/components/loja/assinatura-skeleton"
import { useStoreSlug } from "@/hooks/use-store-slug"

export default function AssinaturaPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { data: session } = useSession()
  const { data: storeSlugData } = useStoreSlug()

  const [loading, setLoading] = useState(true)
  const [planName, setPlanName] = useState<string | null>(null)
  const [nextBilling, setNextBilling] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<{ id: string; date: string; amount: number; status: string }[]>([])
  const [status, setStatus] = useState<string | null>(null)
  const [hasActive, setHasActive] = useState<boolean>(false)
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null)
  const [priceAmount, setPriceAmount] = useState<number | null>(null)
  const [currency, setCurrency] = useState<string | null>(null)
  const [productName, setProductName] = useState<string | null>(null)
  const [currentPeriodStart, setCurrentPeriodStart] = useState<number | null>(null)
  const [startDate, setStartDate] = useState<number | null>(null)
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null)
  const [collectionMethod, setCollectionMethod] = useState<string | null>(null)
  const [cancelAt, setCancelAt] = useState<number | null>(null)
  const [isPortalLoading, setIsPortalLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/user/store')
        if (res.ok) {
          const data = await res.json()
          setPlanName(data?.store?.plano || null)
          // Se tiver endpoint de billing, poderia buscar aqui. Mantemos mock mínimo para UI.
          setInvoices([])
        }

        const sub = await fetch('/api/user/subscription-status')
        if (sub.ok) {
          const s = await sub.json()
          setHasActive(!!s.hasActiveSubscription)
          setStatus(s.status || null)
          setStripeCustomerId(s.stripeCustomerId || null)
          setPriceAmount(s.priceAmount ?? null)
          setCurrency(s.currency ?? null)
          setProductName(s.productName ?? null)
          setCurrentPeriodStart(s.currentPeriodStart ?? null)
          setStartDate(s.startDate ?? null)
          setSubscriptionId(s.subscriptionId ?? null)
          setCollectionMethod(s.collectionMethod ?? null)
          setCancelAt(s.cancelAt ?? null)
          if (s.currentPeriodEnd) {
            const d = new Date((s.currentPeriodEnd as number) * 1000)
            setNextBilling(d.toISOString())

            // Calcular progresso do ciclo
            if (s.currentPeriodStart) {
              const start = new Date(s.currentPeriodStart * 1000)
              const end = new Date(s.currentPeriodEnd * 1000)
              const now = new Date()

              const totalDuration = end.getTime() - start.getTime()
              const elapsedDuration = now.getTime() - start.getTime()

              const calculatedProgress = Math.min(Math.max((elapsedDuration / totalDuration) * 100, 0), 100)
              setProgress(calculatedProgress)

              const remainingMillis = end.getTime() - now.getTime()
              const calculatedDaysRemaining = Math.ceil(remainingMillis / (1000 * 60 * 60 * 24))
              setDaysRemaining(calculatedDaysRemaining)
            }
          } else {
            setNextBilling(null)
            setProgress(0)
            setDaysRemaining(null)
          }
          if (s.plan && !planName) setPlanName(s.plan)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [session?.user?.id])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const handleManageSubscription = async () => {
    setIsPortalLoading(true)
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível abrir o portal de gerenciamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsPortalLoading(false)
    }
  }

  const handleViewInvoices = () => {
    toast({
      title: "Função em breve",
      description: "O histórico de faturas estará disponível em breve.",
    })
  }

  if (loading) {
    return (
      <>
        <LojaHeader storeName={storeSlugData?.storeName} title="Assinatura" />
        <AssinaturaSkeleton />
      </>
    )
  }

  return (
    <>
      <LojaHeader storeName={storeSlugData?.storeName} title="Assinatura" />
      <div className="flex justify-center p-4">
        <Card className="max-w-2xl w-full @container/card shadow-lg border-gray-200/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Sua Assinatura</CardTitle>
              <CardDescription>Visão geral do seu plano e ciclo de faturamento.</CardDescription>
            </div>
            <Button onClick={handleManageSubscription} disabled={isPortalLoading} size="sm">
              {isPortalLoading ? 'Abrindo...' : 'Gerenciar'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6 items-center p-6 bg-gray-50/80 rounded-lg border">
              {/* Left section: Plan Details */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{planName || productName || 'N/A'}</h3>
                    <p className="text-muted-foreground">
                      {priceAmount != null && currency ? 
                        `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: (currency as string).toUpperCase() }).format((priceAmount as number) / 100)} / mês` 
                        : '—'}
                    </p>
                  </div>
                  <Badge variant={hasActive ? "default" : "destructive"} className={hasActive ? 'bg-green-100 text-green-800 border-green-200' : ''}>
                    {status || (hasActive ? 'Ativo' : 'Inativo')}
                  </Badge>
                </div>
              </div>
              
              {/* Right section: Cycle visualization */}
              {hasActive && daysRemaining != null && (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="relative w-24 h-24">
                    <CircularProgress value={progress} strokeWidth={10} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-blue-600">{daysRemaining}</span>
                      <span className="text-xs text-muted-foreground -mt-1">dias</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground font-medium">Início da Assinatura</div>
                  <div className="font-semibold text-foreground">{startDate ? new Date(startDate * 1000).toLocaleDateString('pt-BR') : '—'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground font-medium">Ciclo Atual</div>
                  <div className="font-semibold text-foreground">
                    {currentPeriodStart && nextBilling ? 
                      `${new Date(currentPeriodStart * 1000).toLocaleDateString('pt-BR')} a ${formatDate(nextBilling)}` 
                      : '—'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground font-medium">Faturamento</div>
                  <div className="font-semibold text-foreground">
                    <Badge variant="outline">Mensal</Badge>
                  </div>
                </div>
                {cancelAt && (
                  <div className="space-y-1">
                    <div className="text-muted-foreground font-medium">Cancelamento Agendado</div>
                    <div className="font-semibold text-red-600">{new Date(cancelAt * 1000).toLocaleDateString('pt-BR')}</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
