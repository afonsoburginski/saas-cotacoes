"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAdminUnits, useCreateUnit, useDeleteUnit, useUpdateUnit, type AdminUnit } from "@/hooks/use-admin-units"
import { Loader2, Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button as IconButton } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"

export function UnitsManager() {
  const { data, isLoading } = useAdminUnits()
  const createUnit = useCreateUnit()
  const updateUnit = useUpdateUnit()
  const deleteUnit = useDeleteUnit()
  const { toast } = useToast()

  const [nome, setNome] = React.useState("")
  const [abrev, setAbrev] = React.useState("")
  const [tipo, setTipo] = React.useState<'unit' | 'length' | 'area' | 'volume' | 'weight' | 'time' | 'package'>('unit')

  const rows = data?.data ?? []

  const handleCreate = () => {
    if (!nome.trim() || !abrev.trim()) return
    createUnit.mutate({ nome: nome.trim(), abreviacao: abrev.trim(), tipo, ativo: true }, {
      onSuccess: () => toast({ title: 'Unidade criada' })
    })
    setNome("")
    setAbrev("")
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px_200px_auto] gap-3 items-end">
        <div>
          <Label>Nome</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Unidade (un)" />
        </div>
        <div>
          <Label>Abreviação</Label>
          <Input value={abrev} onChange={(e) => setAbrev(e.target.value)} placeholder="Ex.: un" />
        </div>
        <div>
          <Label>Tipo</Label>
          <div className="flex items-center gap-2">
            <Select value={tipo} onValueChange={(v) => setTipo(v as any)}>
              <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unit">Unitário</SelectItem>
                <SelectItem value="length">Comprimento</SelectItem>
                <SelectItem value="area">Área</SelectItem>
                <SelectItem value="volume">Volume</SelectItem>
                <SelectItem value="weight">Peso</SelectItem>
                <SelectItem value="time">Tempo</SelectItem>
                <SelectItem value="package">Pacote/Embalagem</SelectItem>
              </SelectContent>
            </Select>
            <Tooltip>
              <TooltipTrigger asChild>
                <IconButton variant="outline" size="icon" className="h-9 w-9">
                  <HelpCircle className="h-4 w-4" />
                </IconButton>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="text-xs space-y-2">
                  <div><strong>Como funciona:</strong> Cadastre unidades que serão usadas nos formulários de produtos. O tipo ajuda a habilitar campos (peso, medidas, volume, etc.).</div>
                  <div><strong>Exemplos:</strong>
                    <ul className="list-disc pl-4 mt-1">
                      <li><em>Unitário</em>: "Unidade (un)" → abreviação "un"</li>
                      <li><em>Comprimento</em>: "Metro (m)" → "m" (solicita comprimento)</li>
                      <li><em>Área</em>: "Metro Quadrado (m²)" → "m²" (solicita comprimento e largura)</li>
                      <li><em>Volume</em>: "Metro Cúbico (m³)" → "m³" (solicita comp., larg., altura)</li>
                      <li><em>Peso</em>: "Quilograma (kg)" → "kg" (solicita peso)</li>
                      <li><em>Tempo</em>: "Hora (h)" → "h"</li>
                      <li><em>Pacote</em>: "Caixa (cx)" → "cx"</li>
                    </ul>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={createUnit.isPending || !nome.trim() || !abrev.trim()} className="gap-2">
          {createUnit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Adicionar
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Abrev.</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5}><div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Carregando…</div></TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={5}><div className="text-center text-muted-foreground py-6">Nenhuma unidade</div></TableCell></TableRow>
            ) : (
              rows.map((u: AdminUnit) => (
                <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <Input defaultValue={u.nome} onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== u.nome) updateUnit.mutate({ id: u.id, data: { nome: v } }, { onSuccess: () => toast({ title: 'Atualizado' }) }) }} />
                  </TableCell>
                  <TableCell>
                    <Input defaultValue={u.abreviacao} onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== u.abreviacao) updateUnit.mutate({ id: u.id, data: { abreviacao: v } }, { onSuccess: () => toast({ title: 'Atualizado' }) }) }} />
                  </TableCell>
                  <TableCell>
                    <Select defaultValue={u.tipo} onValueChange={(v) => updateUnit.mutate({ id: u.id, data: { tipo: v as any } }, { onSuccess: () => toast({ title: 'Atualizado' }) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unit">Unitário</SelectItem>
                        <SelectItem value="length">Comprimento</SelectItem>
                        <SelectItem value="area">Área</SelectItem>
                        <SelectItem value="volume">Volume</SelectItem>
                        <SelectItem value="weight">Peso</SelectItem>
                        <SelectItem value="time">Tempo</SelectItem>
                        <SelectItem value="package">Pacote/Embalagem</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Switch defaultChecked={u.ativo} onCheckedChange={(v) => updateUnit.mutate({ id: u.id, data: { ativo: v } }, { onSuccess: () => toast({ title: v ? 'Ativada' : 'Desativada' }) })} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="destructive" size="sm" onClick={() => deleteUnit.mutate(u.id, { onSuccess: () => toast({ title: 'Unidade excluída' }) })} className="gap-2"><Trash2 className="h-4 w-4" /> Excluir</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}


