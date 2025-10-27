"use client"

import { useEffect } from "react"
import { useStoreSlug } from "@/hooks/use-store-slug"
import { LojaHeader } from "@/components/loja/loja-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TypographyH3, TypographyMuted } from "@/components/ui/typography"
import { BarChart3, TrendingUp, Users, ShoppingCart, MessageCircle, RefreshCw } from "lucide-react"
import { OrdersTable } from "@/components/orders/orders-table"
import { useOrders } from "@/hooks/use-orders"
import { useMarkOrdersAsSeen } from "@/hooks/use-pending-quotes"
import { Button } from "@/components/ui/button"
import { useQueryClient } from "@tanstack/react-query"

interface DashboardPageProps {
  params: { slug: string }
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const { slug } = params
  const { data: storeSlugData } = useStoreSlug()
  const { data: orders = [], isLoading: isLoadingOrders } = useOrders()
  const markAsSeen = useMarkOrdersAsSeen()
  const queryClient = useQueryClient()

  // Marcar orçamentos como vistos quando o dashboard carregar
  useEffect(() => {
    markAsSeen()
  }, [markAsSeen])

  // Função para forçar refetch manual
  const handleRefresh = () => {
    console.log('🔄 Forçando refetch manual dos pedidos')
    queryClient.invalidateQueries({ queryKey: ["orders"] })
  }

  // Calcular métricas dos pedidos/cotações
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pendente').length
  const respondedOrders = orders.filter(o => o.status === 'respondida').length
  const completedOrders = orders.filter(o => o.status === 'concluida').length
  const totalValue = orders.reduce((sum, o) => {
    // Converter o valor para número (pode vir como string do banco)
    const orderValue = typeof o.total === 'string' ? parseFloat(o.total) : o.total
    return sum + (isNaN(orderValue) ? 0 : orderValue)
  }, 0)

  return (
    <>
      <LojaHeader storeName={storeSlugData?.storeName || "Dashboard"} title="Dashboard" />
      
      <div className="p-6 space-y-6">
        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {pendingOrders} pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando resposta
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Respondidos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{respondedOrders}</div>
              <p className="text-xs text-muted-foreground">
                Em negociação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalValue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {completedOrders} concluídos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Pedidos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Pedidos Recebidos
                </CardTitle>
                <TypographyMuted>
                  Pedidos enviados pelos clientes em tempo real
                </TypographyMuted>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <OrdersTable isLoading={isLoadingOrders} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}