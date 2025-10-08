"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { KpiCard } from "@/components/features/kpi-card"
import { MiniChart } from "@/components/features/mini-chart"
import { DataTable } from "@/components/features/data-table"
import { Eye, ShoppingCart, FileText, TrendingUp, Calendar } from "lucide-react"

export default function RelatoriosPage() {
  const [period, setPeriod] = useState("30")

  // Mock data for KPIs
  const kpis = [
    {
      title: "Visualizações",
      value: "2,847",
      description: "Total de visualizações dos produtos",
      icon: Eye,
      trend: { value: 12.5, isPositive: true },
    },
    {
      title: "Adições ao Carrinho",
      value: "342",
      description: "Produtos adicionados ao carrinho",
      icon: ShoppingCart,
      trend: { value: 8.2, isPositive: true },
    },
    {
      title: "Listas Geradas",
      value: "89",
      description: "Listas de compras com seus produtos",
      icon: FileText,
      trend: { value: -2.1, isPositive: false },
    },
    {
      title: "Taxa de Conversão",
      value: "12.0%",
      description: "Visualizações que viraram adições",
      icon: TrendingUp,
      trend: { value: 3.4, isPositive: true },
    },
  ]

  // Mock data for charts
  const visualizacoesData = [
    { label: "Seg", value: 120 },
    { label: "Ter", value: 150 },
    { label: "Qua", value: 180 },
    { label: "Qui", value: 220 },
    { label: "Sex", value: 190 },
    { label: "Sáb", value: 160 },
    { label: "Dom", value: 140 },
  ]

  const carrinhoData = [
    { label: "Seg", value: 15 },
    { label: "Ter", value: 22 },
    { label: "Qua", value: 28 },
    { label: "Qui", value: 35 },
    { label: "Sex", value: 31 },
    { label: "Sáb", value: 25 },
    { label: "Dom", value: 18 },
  ]

  // Mock data for top products
  const topProducts = [
    {
      produto: "Cimento Portland CP II-E 50kg",
      categoria: "Cimento",
      visualizacoes: 456,
      carrinho: 89,
      listas: 23,
    },
    {
      produto: "Tijolo Cerâmico 6 Furos 9x14x19cm",
      categoria: "Tijolos",
      visualizacoes: 342,
      carrinho: 67,
      listas: 18,
    },
    {
      produto: "Areia Média Lavada - m³",
      categoria: "Areia",
      visualizacoes: 298,
      carrinho: 45,
      listas: 12,
    },
    {
      produto: "Vergalhão CA-50 8mm - 12m",
      categoria: "Ferro",
      visualizacoes: 234,
      carrinho: 38,
      listas: 15,
    },
    {
      produto: "Brita 1 - m³",
      categoria: "Brita",
      visualizacoes: 187,
      carrinho: 29,
      listas: 8,
    },
  ]

  const topProductsColumns = [
    {
      key: "produto" as keyof (typeof topProducts)[0],
      label: "Produto",
      sortable: true,
    },
    {
      key: "categoria" as keyof (typeof topProducts)[0],
      label: "Categoria",
      sortable: true,
    },
    {
      key: "visualizacoes" as keyof (typeof topProducts)[0],
      label: "Visualizações",
      sortable: true,
    },
    {
      key: "carrinho" as keyof (typeof topProducts)[0],
      label: "Adições",
      sortable: true,
    },
    {
      key: "listas" as keyof (typeof topProducts)[0],
      label: "Listas",
      sortable: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios da Loja</h1>
          <p className="text-muted-foreground">Acompanhe o desempenho dos seus produtos</p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <KpiCard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MiniChart title="Visualizações por Dia" data={visualizacoesData} type="line" />
        <MiniChart title="Adições ao Carrinho por Dia" data={carrinhoData} type="line" />
      </div>

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos Mais Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={topProducts}
            columns={topProductsColumns}
            searchPlaceholder="Buscar produtos..."
            pageSize={5}
          />
        </CardContent>
      </Card>
    </div>
  )
}
