"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { mockPlans } from "@/lib/mock-data"
import { CreditCard, Calendar, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AssinaturaPage() {
  const { toast } = useToast()

  // Mock current subscription data
  const currentPlan = mockPlans.find((p) => p.nome === "Pro")
  const nextBilling = "2024-04-15"
  const invoices = [
    { id: "inv-001", date: "2024-03-15", amount: 199.9, status: "paid" },
    { id: "inv-002", date: "2024-02-15", amount: 199.9, status: "paid" },
    { id: "inv-003", date: "2024-01-15", amount: 199.9, status: "paid" },
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const handleChangePlan = () => {
    toast({
      title: "Alteração de plano",
      description: "Você será redirecionado para escolher um novo plano.",
    })
  }

  const handleCancelSubscription = () => {
    toast({
      title: "Cancelamento solicitado",
      description: "Sua solicitação de cancelamento foi registrada.",
      variant: "destructive",
    })
  }

  const handleViewInvoices = () => {
    toast({
      title: "Histórico de faturas",
      description: "Abrindo histórico completo de faturas...",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assinatura</h1>
        <p className="text-muted-foreground">Gerencie sua assinatura e histórico de pagamentos</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Plano Atual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{currentPlan?.nome}</h3>
              <p className="text-muted-foreground">
                {formatPrice(currentPlan?.preco || 0)} / {currentPlan?.periodicidade}
              </p>
            </div>
            <Badge variant="default" className="bg-neutral-100 text-neutral-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ativo
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Próxima cobrança</p>
                <p className="text-sm text-muted-foreground">{formatDate(nextBilling)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-sm text-neutral-600">Em dia</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Recursos inclusos:</h4>
            <ul className="space-y-1">
              {currentPlan?.recursos.map((recurso, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-neutral-600" />
                  {recurso}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleChangePlan}>Alterar Plano</Button>
            <Button variant="outline" onClick={handleCancelSubscription}>
              Cancelar Assinatura
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Últimas Faturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Fatura #{invoice.id}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(invoice.date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPrice(invoice.amount)}</p>
                  <Badge variant="secondary" className="text-xs">
                    {invoice.status === "paid" ? "Pago" : "Pendente"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <Button variant="outline" onClick={handleViewInvoices} className="w-full bg-transparent">
            Ver Histórico Completo
          </Button>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Planos Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockPlans.map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-lg p-4 ${
                  plan.nome === currentPlan?.nome ? "border-primary bg-primary/5" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{plan.nome}</h3>
                  {plan.nome === currentPlan?.nome && <Badge variant="default">Atual</Badge>}
                </div>
                <p className="text-2xl font-bold mb-2">
                  {formatPrice(plan.preco)}
                  <span className="text-sm font-normal text-muted-foreground">/{plan.periodicidade}</span>
                </p>
                <ul className="space-y-1 mb-4">
                  {plan.recursos.map((recurso, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-neutral-600" />
                      {recurso}
                    </li>
                  ))}
                </ul>
                {plan.nome !== currentPlan?.nome && (
                  <Button variant="outline" className="w-full bg-transparent">
                    Escolher Plano
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
