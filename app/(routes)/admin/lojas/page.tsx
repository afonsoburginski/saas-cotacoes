"use client"

import { useState } from "react"
import { DataTable } from "@/components/features/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Store, Eye, Check, X, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for stores management
const storesData = [
  {
    id: "1",
    nome: "Construmax Materiais",
    email: "contato@construmax.com",
    telefone: "(11) 99999-9999",
    endereco: "Rua das Construções, 123",
    status: "approved",
    priorityScore: 85,
    createdAt: "2024-01-15",
    totalProducts: 245,
    totalSales: 125000,
  },
  {
    id: "2",
    nome: "Casa & Obra",
    email: "vendas@casaobra.com",
    telefone: "(11) 88888-8888",
    endereco: "Av. dos Materiais, 456",
    status: "pending",
    priorityScore: 0,
    createdAt: "2024-01-14",
    totalProducts: 0,
    totalSales: 0,
  },
  {
    id: "3",
    nome: "Mega Construção",
    email: "info@megaconstrucao.com",
    telefone: "(11) 77777-7777",
    endereco: "Rua do Cimento, 789",
    status: "rejected",
    priorityScore: 0,
    createdAt: "2024-01-13",
    totalProducts: 0,
    totalSales: 0,
  },
]

const columns = [
  { key: "nome", label: "Nome da Loja" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
  { key: "priorityScore", label: "Score de Prioridade" },
  { key: "totalProducts", label: "Produtos" },
  { key: "totalSales", label: "Vendas" },
  { key: "actions", label: "Ações" },
]

export default function AdminStoresPage() {
  const [stores, setStores] = useState(storesData)
  const [selectedStore, setSelectedStore] = useState<any>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { toast } = useToast()

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleApproveStore = (storeId: string) => {
    setStores((prev) =>
      prev.map((store) => (store.id === storeId ? { ...store, status: "approved", priorityScore: 75 } : store)),
    )
    toast({
      title: "Loja aprovada",
      description: "A loja foi aprovada com sucesso.",
    })
  }

  const handleRejectStore = (storeId: string) => {
    setStores((prev) => prev.map((store) => (store.id === storeId ? { ...store, status: "rejected" } : store)))
    toast({
      title: "Loja rejeitada",
      description: "A loja foi rejeitada.",
      variant: "destructive",
    })
  }

  const handleUpdatePriority = (storeId: string, newScore: number) => {
    setStores((prev) => prev.map((store) => (store.id === storeId ? { ...store, priorityScore: newScore } : store)))
    toast({
      title: "Score atualizado",
      description: "O score de prioridade foi atualizado.",
    })
  }

  const renderStoreRow = (store: any) => ({
    nome: store.nome,
    email: store.email,
    status: getStatusBadge(store.status),
    priorityScore: (
      <div className="flex items-center gap-2">
        <span>{store.priorityScore}</span>
        {store.status === "approved" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedStore(store)
              setIsEditModalOpen(true)
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
        )}
      </div>
    ),
    totalProducts: store.totalProducts,
    totalSales: formatCurrency(store.totalSales),
    actions: (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedStore(store)
            setIsViewModalOpen(true)
          }}
        >
          <Eye className="h-3 w-3 mr-1" />
          Ver
        </Button>
        {store.status === "pending" && (
          <>
            <Button
              size="sm"
              className="bg-neutral-600 hover:bg-neutral-700"
              onClick={() => handleApproveStore(store.id)}
            >
              <Check className="h-3 w-3 mr-1" />
              Aprovar
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleRejectStore(store.id)}>
              <X className="h-3 w-3 mr-1" />
              Rejeitar
            </Button>
          </>
        )}
      </div>
    ),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Lojas</h1>
          <p className="text-muted-foreground">Aprovar, rejeitar e gerenciar lojas cadastradas</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Lojas Cadastradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={stores.map(renderStoreRow)} columns={columns} searchKey="nome" />
        </CardContent>
      </Card>

      {/* View Store Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Loja</DialogTitle>
            <DialogDescription>Informações completas da loja selecionada</DialogDescription>
          </DialogHeader>
          {selectedStore && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome da Loja</Label>
                <p className="text-sm font-medium">{selectedStore.nome}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-sm">{selectedStore.email}</p>
              </div>
              <div>
                <Label>Telefone</Label>
                <p className="text-sm">{selectedStore.telefone}</p>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">{getStatusBadge(selectedStore.status)}</div>
              </div>
              <div className="col-span-2">
                <Label>Endereço</Label>
                <p className="text-sm">{selectedStore.endereco}</p>
              </div>
              <div>
                <Label>Score de Prioridade</Label>
                <p className="text-sm font-medium">{selectedStore.priorityScore}</p>
              </div>
              <div>
                <Label>Data de Cadastro</Label>
                <p className="text-sm">{new Date(selectedStore.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
              <div>
                <Label>Total de Produtos</Label>
                <p className="text-sm font-medium">{selectedStore.totalProducts}</p>
              </div>
              <div>
                <Label>Total de Vendas</Label>
                <p className="text-sm font-medium">{formatCurrency(selectedStore.totalSales)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Priority Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Score de Prioridade</DialogTitle>
            <DialogDescription>Ajuste o score de prioridade da loja (0-100)</DialogDescription>
          </DialogHeader>
          {selectedStore && (
            <div className="space-y-4">
              <div>
                <Label>Loja: {selectedStore.nome}</Label>
              </div>
              <div>
                <Label htmlFor="priority">Score de Prioridade</Label>
                <Input
                  id="priority"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={selectedStore.priorityScore}
                  onChange={(e) => {
                    setSelectedStore({
                      ...selectedStore,
                      priorityScore: Number.parseInt(e.target.value) || 0,
                    })
                  }}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (selectedStore) {
                  handleUpdatePriority(selectedStore.id, selectedStore.priorityScore)
                  setIsEditModalOpen(false)
                }
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
