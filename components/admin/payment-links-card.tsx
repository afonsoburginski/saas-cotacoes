"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, CheckCircle2, Star, Zap, Sparkles } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

const paymentLinks = [
  {
    name: "Premium",
    description: "Plano completo com todas as funcionalidades avançadas",
    price: "R$ 249,99/mês",
    link: "https://buy.stripe.com/00wfZi75yblgaUc4Phfw402",
    icon: Star,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    features: ["Recursos ilimitados", "Suporte prioritário", "Integrações avançadas"]
  },
  {
    name: "Plus",
    description: "Ideal para empresas em crescimento",
    price: "R$ 189,00/mês",
    link: "https://buy.stripe.com/5kQ9AU61uahcd2kftVfw401",
    icon: Zap,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    features: ["Recursos avançados", "Suporte profissional", "Análises detalhadas"]
  },
  {
    name: "Básico",
    description: "Perfeito para começar",
    price: "R$ 99,00/mês",
    link: "https://buy.stripe.com/5kQfZiey0fBw7I0dlNfw400",
    icon: Sparkles,
    color: "text-green-600",
    bgColor: "bg-green-50",
    features: ["Recursos essenciais", "Suporte por email", "Gestão básica"]
  }
]

export function PaymentLinksCard() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const { toast } = useToast()

  const copyToClipboard = (link: string, index: number) => {
    navigator.clipboard.writeText(link)
    setCopiedIndex(index)
    toast({
      title: "Link copiado!",
      description: "Link de pagamento copiado para a área de transferência",
    })
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Links de Assinatura Stripe</CardTitle>
        <CardDescription>
          Compartilhe os links de assinatura. Todos os planos incluem 15 dias de avaliação gratuita!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentLinks.map((plan, index) => {
          const Icon = plan.icon
          return (
            <div
              key={plan.name}
              className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`p-2 rounded-lg ${plan.bgColor}`}>
                  <Icon className={`h-5 w-5 ${plan.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      Ativo
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{plan.description}</p>
                  <p className="text-sm font-medium text-gray-700">
                    Avaliação de 15 dias (em seguida, {plan.price})
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(plan.link, index)}
                className="ml-4"
              >
                {copiedIndex === index ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          )
        })}
        
        <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>💡 Lembrete:</strong> Todos os links de assinatura incluem automaticamente um período de avaliação de 15 dias grátis.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

