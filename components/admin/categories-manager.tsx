"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, type AdminCategory } from "@/hooks/use-admin-categories"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Loader2, Trash2, Plus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function CategoriesManager() {
  const { data, isLoading } = useAdminCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const { toast } = useToast()

  const [novoNome, setNovoNome] = React.useState("")
  const [novoTipo, setNovoTipo] = React.useState<'produto' | 'servico'>('produto')

  const rows = data?.data ?? []
  const [pendingDelete, setPendingDelete] = React.useState<AdminCategory | null>(null)

  const handleCreate = () => {
    if (!novoNome.trim()) return
    createCategory.mutate(
      { nome: novoNome.trim(), tipo: novoTipo, ativo: true },
      { onSuccess: () => toast({ title: "Categoria criada", description: `"${novoNome}" adicionada.` }) }
    )
    setNovoNome("")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label>Nome da categoria</Label>
          <div className="relative">
            <Input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Ex.: Elétricos" className="pr-24" />
            <Button
              onClick={handleCreate}
              disabled={createCategory.isPending || !novoNome.trim()}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3 gap-2"
            >
              {createCategory.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Adicionar
            </Button>
          </div>
        </div>
        <div className="w-full sm:w-48">
          <Label>Tipo</Label>
          <Select value={novoTipo} onValueChange={(v) => setNovoTipo(v as any)}>
            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="produto">Produto</SelectItem>
              <SelectItem value="servico">Serviço</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table className="animate-in fade-in slide-in-from-top-1 duration-200">
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
                  </div>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="text-center text-muted-foreground py-6">Nenhuma categoria</div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((c: AdminCategory) => (
                <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <Input
                      defaultValue={c.nome}
                      onBlur={(e) => {
                        const nome = e.target.value.trim()
                        if (nome && nome !== c.nome) updateCategory.mutate({ id: c.id, data: { nome } }, { onSuccess: () => toast({ title: "Atualizado", description: "Nome da categoria salvo." }) })
                      }}
                    />
                  </TableCell>
                  <TableCell className="capitalize">
                    <Select defaultValue={c.tipo} onValueChange={(tipo) => updateCategory.mutate({ id: c.id, data: { tipo: tipo as any } }, { onSuccess: () => toast({ title: "Atualizado", description: "Tipo alterado." }) })}>
                      <SelectTrigger className="h-7 w-auto rounded-full bg-secondary text-xs px-2 py-0.5 border-0 inline-flex w-min">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="produto">Produto</SelectItem>
                        <SelectItem value="servico">Serviço</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Switch defaultChecked={c.ativo} onCheckedChange={(ativo) => updateCategory.mutate({ id: c.id, data: { ativo } }, { onSuccess: () => toast({ title: ativo ? "Ativada" : "Desativada" }) })} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="destructive" size="sm" onClick={() => setPendingDelete(c)} className="gap-2">
                      <Trash2 className="h-4 w-4" /> Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Isso irá excluir "{pendingDelete?.nome}" e desvincular essa categoria de todos os {pendingDelete?.tipo === 'produto' ? 'produtos' : 'serviços'} relacionados.
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (!pendingDelete) return
                const id = pendingDelete.id
                deleteCategory.mutate(id, {
                  onSuccess: () => {
                    toast({ title: 'Categoria excluída', description: 'Todos os vínculos foram removidos.' })
                    setPendingDelete(null)
                  },
                })
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


