"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartData {
  month: string
  revenue: number
}

interface DashboardChartProps {
  data: ChartData[]
  title?: string
  description?: string
  color?: string
}

const COLORS = {
  revenue: "#8B5CF6",
  stores: "#10B981",
  default: "#3B82F6",
}

export function DashboardChart({ data, title = "Gráfico", description, color = "default" }: DashboardChartProps) {
  const chartColor = COLORS[color as keyof typeof COLORS] || COLORS.default

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis 
              dataKey="month" 
              className="text-xs"
              tick={{ fill: '#6B7280' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: '#6B7280' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="revenue" fill={chartColor} radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

