"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/features/stats-card"
import { MiniChart } from "@/components/features/mini-chart"
import { DataTable } from "@/components/features/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Users, Store, ShoppingCart, Download } from "lucide-react"
import { useState } from "react"

// Mock data for admin reports
const reportData = {
  overview: {
    totalRevenue: 450000,
    totalOrders: 1250,
    totalUsers: 890,
    totalStores: 45,
    trends: {
      revenue: { value: 18, isPositive: true },
      orders: { value: 12, isPositive: true },
      users: { value: 8, isPositive: true },
      stores: { value: 15, isPositive: true },
    },
  },
  monthlyRevenue: [
    { month: "Jan", value: 65000 },
    { month: "Fev", value: 72000 },
    { month: "Mar", value: 68000 },
    { month: "Abr", value: 85000 },
    { month: "Mai", value: 92000 },
    { month: "Jun", value: 78000 },
    { month: "Jul", value: 105000 },
    { month: "Ago", value: 118000 },
    { month: "Set", value: 125000 },
    { month: "Out", value: 135000 },
    { month: "Nov", value: 142000 },
    { month: "Dez", value: 158000 },
  ],
  topStores: [
    { id: "1", nome: "Construmax Materiais", revenue: 125000, orders: 245, growth: 18 },
    { id: "2", nome: "Casa & Obra", revenue: 98000, orders: 189, growth: 12 },
    { id: "3", nome: "Mega Construção", revenue: 87000, orders: 156, growth: 8 },
    { id: "4", nome: "Depósito Central", revenue: 76000, orders: 134, growth: -3 },
    { id: "5", nome: "Materiais Express", revenue: 65000, orders: 112, growth: 22 },
  ],
  topCategories: [
    { categoria: "Cimento", revenue: 185000, percentage: 35 },
    { categoria: "Tijolos", revenue: 125000, percentage: 24 },
    { categoria: "Areia", revenue: 95000, percentage: 18 },
    { categoria: "Brita", revenue: 78000, percentage: 15 },
    { categoria: "Ferro", revenue: 42000, percentage: 8 },
  ],
}

const storeColumns = [
  { key: "nome", label: "Loja" },
  { key: "revenue", label: "Receita" },
  { key: "orders", label: "Pedidos" },
  { key: "growth", label: "Crescimento" },
]

const categoryColumns = [
  { key: "categoria", label: "Categoria" },
  { key: "revenue", label: "Receita" },
  { key: "percentage", label: "% do Total" },
]

export default function AdminReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("12m")

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const renderStoreRow = (store: any) => ({
    nome: store.nome,
    revenue: formatCurrency(store.revenue),
    orders: store.orders,
    growth: (
      <Badge
        className={
          store.growth >= 0
            ? "bg-neutral-100 text-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-400"
            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
        }
      >
        {store.growth >= 0 ? "+" : ""}
        {store.growth}%
      </Badge>
    ),
  })

  const renderCategoryRow = (category: any) => ({
    categoria: category.categoria,
    revenue: formatCurrency(category.revenue),
    percentage: `${category.percentage}%`,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios Administrativos</h1>
          <p className="text-muted-foreground">Análises detalhadas e métricas de performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Mês</SelectItem>
              <SelectItem value="3m">3 Meses</SelectItem>
              <SelectItem value="6m">6 Meses</SelectItem>
              <SelectItem value="12m">12 Meses</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Receita Total"
          value={formatCurrency(reportData.overview.totalRevenue)}
          description="Receita acumulada no período"
          icon={TrendingUp}
          trend={reportData.overview.trends.revenue}
        />
        <StatsCard
          title="Total de Pedidos"
          value={reportData.overview.totalOrders.toLocaleString()}
          description="Pedidos processados"
          icon={ShoppingCart}
          trend={reportData.overview.trends.orders}
        />
        <StatsCard
          title="Usuários Ativos"
          value={reportData.overview.totalUsers.toLocaleString()}
          description="Usuários cadastrados"
          icon={Users}
          trend={reportData.overview.trends.users}
        />
        <StatsCard
          title="Lojas Ativas"
          value={reportData.overview.totalStores}
          description="Lojas aprovadas"
          icon={Store}
          trend={reportData.overview.trends.stores}
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Receita Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MiniChart data={reportData.monthlyRevenue} dataKey="value" height={300} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Stores */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Lojas por Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={reportData.topStores.map(renderStoreRow)}
              columns={storeColumns}
              searchKey="nome"
              showPagination={false}
            />
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Categorias Mais Vendidas</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={reportData.topCategories.map(renderCategoryRow)}
              columns={categoryColumns}
              searchKey="categoria"
              showPagination={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
