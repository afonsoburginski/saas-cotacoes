"use client"

import { useState } from "react"
import { DataTable } from "@/components/features/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, Eye, Ban, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for users management
const usersData = [
  {
    id: "1",
    nome: "João Silva",
    email: "joao@email.com",
    role: "usuario",
    status: "active",
    createdAt: "2024-01-15",
    lastLogin: "2024-01-20",
    totalOrders: 15,
    totalSpent: 25000,
  },
  {
    id: "2",
    nome: "Maria Santos",
    email: "maria@construmax.com",
    role: "loja",
    status: "active",
    createdAt: "2024-01-10",
    lastLogin: "2024-01-19",
    totalOrders: 0,
    totalSpent: 0,
  },
  {
    id: "3",
    nome: "Pedro Admin",
    email: "pedro@admin.com",
    role: "admin",
    status: "active",
    createdAt: "2024-01-01",
    lastLogin: "2024-01-20",
    totalOrders: 0,
    totalSpent: 0,
  },
  {
    id: "4",
    nome: "Ana Costa",
    email: "ana@email.com",
    role: "usuario",
    status: "suspended",
    createdAt: "2024-01-12",
    lastLogin: "2024-01-18",
    totalOrders: 3,
    totalSpent: 5000,
  },
]

const columns = [
  { key: "nome", label: "Nome" },
  { key: "email", label: "Email" },
  { key: "role", label: "Tipo" },
  { key: "status", label: "Status" },
  { key: "lastLogin", label: "Último Login" },
  { key: "totalOrders", label: "Pedidos" },
  { key: "totalSpent", label: "Total Gasto" },
  { key: "actions", label: "Ações" },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState(usersData)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const { toast } = useToast()

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
      case "loja":
        return <Badge className="bg-blue-100 text-blue-800">Loja</Badge>
      case "usuario":
        return <Badge className="bg-gray-100 text-gray-800">Usuário</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-neutral-100 text-neutral-800">Ativo</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspenso</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>
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

  const handleSuspendUser = (userId: string) => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, status: "suspended" } : user)))
    toast({
      title: "Usuário suspenso",
      description: "O usuário foi suspenso com sucesso.",
      variant: "destructive",
    })
  }

  const handleActivateUser = (userId: string) => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, status: "active" } : user)))
    toast({
      title: "Usuário ativado",
      description: "O usuário foi ativado com sucesso.",
    })
  }

  const renderUserRow = (user: any) => ({
    nome: user.nome,
    email: user.email,
    role: getRoleBadge(user.role),
    status: getStatusBadge(user.status),
    lastLogin: new Date(user.lastLogin).toLocaleDateString("pt-BR"),
    totalOrders: user.totalOrders,
    totalSpent: formatCurrency(user.totalSpent),
    actions: (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedUser(user)
            setIsViewModalOpen(true)
          }}
        >
          <Eye className="h-3 w-3 mr-1" />
          Ver
        </Button>
        {user.status === "active" ? (
          <Button size="sm" variant="destructive" onClick={() => handleSuspendUser(user.id)}>
            <Ban className="h-3 w-3 mr-1" />
            Suspender
          </Button>
        ) : (
          <Button size="sm" className="bg-neutral-600 hover:bg-neutral-700" onClick={() => handleActivateUser(user.id)}>
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativar
          </Button>
        )}
      </div>
    ),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">Visualizar e gerenciar todos os usuários do sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={users.map(renderUserRow)} columns={columns} searchKey="nome" />
        </CardContent>
      </Card>

      {/* View User Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
            <DialogDescription>Informações completas do usuário selecionado</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <p className="text-sm font-medium">{selectedUser.nome}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-sm">{selectedUser.email}</p>
              </div>
              <div>
                <Label>Tipo de Usuário</Label>
                <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
              </div>
              <div>
                <Label>Data de Cadastro</Label>
                <p className="text-sm">{new Date(selectedUser.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
              <div>
                <Label>Último Login</Label>
                <p className="text-sm">{new Date(selectedUser.lastLogin).toLocaleDateString("pt-BR")}</p>
              </div>
              <div>
                <Label>Total de Pedidos</Label>
                <p className="text-sm font-medium">{selectedUser.totalOrders}</p>
              </div>
              <div>
                <Label>Total Gasto</Label>
                <p className="text-sm font-medium">{formatCurrency(selectedUser.totalSpent)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
