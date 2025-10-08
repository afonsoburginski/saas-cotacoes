"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"
import type { CartItem } from "@/lib/types"

interface ListPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cartItems: CartItem[]
  onGenerateList: (nome: string, observacoes: string) => void
}

export function ListPreviewModal({ open, onOpenChange, cartItems, onGenerateList }: ListPreviewModalProps) {
  const [nome, setNome] = useState("")
  const [observacoes, setObservacoes] = useState("")

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  // Group items by store
  const groupedItems = cartItems.reduce(
    (groups, item) => {
      const storeId = item.storeId
      if (!groups[storeId]) {
        groups[storeId] = {
          storeNome: item.storeNome,
          items: [],
          subtotal: 0,
        }
      }
      groups[storeId].items.push(item)
      groups[storeId].subtotal += item.precoUnit * item.qty
      return groups
    },
    {} as Record<string, { storeNome: string; items: CartItem[]; subtotal: number }>,
  )

  const totalGeral = Object.values(groupedItems).reduce((total, group) => total + group.subtotal, 0)

  const handleGenerate = () => {
    if (!nome.trim()) return
    onGenerateList(nome, observacoes)
    setNome("")
    setObservacoes("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerar Lista de Compras
          </DialogTitle>
          <DialogDescription>Revise os itens e adicione informações para gerar sua lista de compras</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome da Lista *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Reforma Cozinha - Materiais"
              />
            </div>
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Entrega urgente"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold">Preview da Lista</h3>

            {Object.entries(groupedItems).map(([storeId, group]) => (
              <div key={storeId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="text-sm">
                    {group.storeNome}
                  </Badge>
                  <div className="font-semibold">{formatPrice(group.subtotal)}</div>
                </div>

                <div className="space-y-2">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <span className="font-medium">{item.productNome}</span>
                        <span className="text-muted-foreground ml-2">x{item.qty}</span>
                      </div>
                      <div>{formatPrice(item.precoUnit * item.qty)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Geral</span>
                <span>{formatPrice(totalGeral)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleGenerate} disabled={!nome.trim()}>
            <FileText className="h-4 w-4 mr-2" />
            Gerar Lista
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
