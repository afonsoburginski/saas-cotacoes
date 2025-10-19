"use client"

import * as React from "react"
import { Plus, X, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface Specification {
  name: string
  value: string
}

interface SpecificationsInputProps {
  value: Specification[]
  onChange: (specs: Specification[]) => void
  className?: string
}

export function SpecificationsInput({ value, onChange, className }: SpecificationsInputProps) {
  const addSpecification = () => {
    onChange([...value, { name: "", value: "" }])
  }

  const updateSpecification = (index: number, field: keyof Specification, newValue: string) => {
    const updated = value.map((spec, i) => 
      i === index ? { ...spec, [field]: newValue } : spec
    )
    onChange(updated)
  }

  const removeSpecification = (index: number) => {
    const updated = value.filter((_, i) => i !== index)
    onChange(updated)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Especificações Técnicas</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSpecification}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {value.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Nenhuma especificação adicionada
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSpecification}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar primeira especificação
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((spec, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1">
                <Input
                  placeholder="Nome da especificação (ex: Peso, Dimensões)"
                  value={spec.name}
                  onChange={(e) => updateSpecification(index, "name", e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Valor (ex: 50kg, 20x30x10cm)"
                  value={spec.value}
                  onChange={(e) => updateSpecification(index, "value", e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeSpecification(index)}
                className="px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
