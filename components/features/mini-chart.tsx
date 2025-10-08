"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MiniChartProps {
  title: string
  data: { label: string; value: number }[]
  type?: "line" | "bar"
}

export function MiniChart({ title, data, type = "line" }: MiniChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {type === "bar" ? (
            data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs w-16 truncate">{item.label}</span>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${(item.value / maxValue) * 100}%` }} />
                </div>
                <span className="text-xs font-medium w-8 text-right">{item.value}</span>
              </div>
            ))
          ) : (
            <div className="h-20 flex items-end gap-1">
              {data.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary rounded-t"
                    style={{ height: `${(item.value / maxValue) * 100}%` }}
                  />
                  <span className="text-xs mt-1 truncate">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
