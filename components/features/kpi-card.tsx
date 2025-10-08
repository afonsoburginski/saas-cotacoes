import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function KpiCard({ title, value, description, icon: Icon, trend }: KpiCardProps) {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-white/20 hover:border-white/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/90">{title}</CardTitle>
        <Icon className="h-4 w-4 text-white/70" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {description && <p className="text-xs text-white/70">{description}</p>}
        {trend && (
          <p className={`text-xs ${trend.isPositive ? "text-neutral-400" : "text-red-400"}`}>
            {trend.isPositive ? "+" : ""}
            {trend.value}% em relação ao período anterior
          </p>
        )}
      </CardContent>
    </Card>
  )
}
