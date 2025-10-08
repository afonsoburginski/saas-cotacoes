"use client"

import { StatsCard } from "@/components/features/stats-card"
import { DataTable } from "@/components/features/data-table"
import { MiniChart } from "@/components/features/mini-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Store, ShoppingCart, TrendingUp, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react"

// Mock data for admin dashboard
const adminStats = {
  totalUsers: 1247,
  totalStores: 89,
  totalOrders: 3456,
  revenue: 125000,
  trends: {
    users: { value: 12, isPositive: true },
    stores: { value: 8, isPositive: true },
    orders: { value: -3, isPositive: false },
    revenue: { value: 15, isPositive: true },
  },
}

const recentStores = [
  {
    id: "1",
    nome: "Construmax Materiais",
    status: "pending",
    createdAt: "2024-01-15",
    email: "contato@construmax.com",
  },
  { id: "2", nome: "Casa & Obra", status: "approved", createdAt: "2024-01-14", email: "vendas@casaobra.com" },
  { id: "3", nome: "Mega Construção", status: "rejected", createdAt: "2024-01-13", email: "info@megaconstrucao.com" },
  { id: "4", nome: "Depósito Central", status: "pending", createdAt: "2024-01-12", email: "admin@depositocentral.com" },
]

const systemAlerts = [
  { id: "1", type: "warning", message: "5 lojas aguardando aprovação", action: "Revisar" },
  { id: "2", type: "error", message: "Falha no backup automático", action: "Verificar" },
  { id: "3", type: "info", message: "Atualização do sistema disponível", action: "Instalar" },
]

const storeColumns = [
  { key: "nome", label: "Nome da Loja" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Data de Cadastro" },
  { key: "actions", label: "Ações" },
]

export default function AdminDashboardPage() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-neutral-100 text-neutral-800">Aprovada</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejeitada</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const renderStoreRow = (store: any) => ({
    nome: store.nome,
    email: store.email,
    status: getStatusBadge(store.status),
    createdAt: new Date(store.createdAt).toLocaleDateString("pt-BR"),
    actions: (
      <div className="flex gap-2">
        <Button size="sm" variant="outline">
          Ver
        </Button>
        {store.status === "pending" && (
          <>
            <Button size="sm" className="bg-neutral-600 hover:bg-neutral-700">
              Aprovar
            </Button>
            <Button size="sm" variant="destructive">
              Rejeitar
            </Button>
          </>
        )}
      </div>
    ),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">Visão geral do sistema e métricas principais</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Usuários"
          value={adminStats.totalUsers.toLocaleString()}
          description="Usuários ativos na plataforma"
          icon={Users}
          trend={adminStats.trends.users}
        />
        <StatsCard
          title="Lojas Cadastradas"
          value={adminStats.totalStores}
          description="Lojas ativas no sistema"
          icon={Store}
          trend={adminStats.trends.stores}
        />
        <StatsCard
          title="Pedidos Totais"
          value={adminStats.totalOrders.toLocaleString()}
          description="Pedidos processados"
          icon={ShoppingCart}
          trend={adminStats.trends.orders}
        />
        <StatsCard
          title="Receita Total"
          value={formatCurrency(adminStats.revenue)}
          description="Receita acumulada"
          icon={TrendingUp}
          trend={adminStats.trends.revenue}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {alert.type === "warning" && <Clock className="h-4 w-4 text-yellow-500" />}
                  {alert.type === "error" && <XCircle className="h-4 w-4 text-red-500" />}
                  {alert.type === "info" && <CheckCircle className="h-4 w-4 text-blue-500" />}
                  <span className="text-sm">{alert.message}</span>
                </div>
                <Button size="sm" variant="outline">
                  {alert.action}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Receita dos Últimos 6 Meses</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniChart
              data={[
                { month: "Jul", value: 85000 },
                { month: "Ago", value: 92000 },
                { month: "Set", value: 78000 },
                { month: "Out", value: 105000 },
                { month: "Nov", value: 118000 },
                { month: "Dez", value: 125000 },
              ]}
              dataKey="value"
              height={200}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Stores */}
      <Card>
        <CardHeader>
          <CardTitle>Lojas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={recentStores.map(renderStoreRow)} columns={storeColumns} searchKey="nome" />
        </CardContent>
      </Card>
    </div>
  )
}
