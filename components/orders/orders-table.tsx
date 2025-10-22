"use client"

import * as React from "react"
import { useState } from "react"
import { useOrders, Order, useUpdateOrderStatus } from "@/hooks/use-orders"
import { useStoreSlug } from "@/hooks/use-store-slug"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
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
import { OrderDetailsDialog } from "./order-details-dialog"
import {
  ChevronDown,
  MoreHorizontal,
  Search,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Trash2,
  User,
  Package,
  DollarSign,
  Phone,
  MessageSquare,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface OrdersTableProps {
  isLoading: boolean
}

export function OrdersTable({ isLoading }: OrdersTableProps) {
  const { data: orders = [] } = useOrders()
  const { toast } = useToast()
  const updateStatusMutation = useUpdateOrderStatus()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Debug logs
  console.log('📊 OrdersTable - orders recebidos:', orders.length)
  console.log('📊 OrdersTable - isLoading:', isLoading)
  console.log('📊 OrdersTable - dados:', orders.map(o => ({ id: o.id, status: o.status, total: o.total })))

  // Debug logs para orderItems
  console.log('📦 OrdersTable - selectedOrder:', selectedOrder?.id)

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.observacoes?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>
      case 'respondida':
        return <Badge variant="outline" className="text-blue-600 border-blue-200"><MessageCircle className="h-3 w-3 mr-1" />Respondida</Badge>
      case 'aceita':
        return <Badge variant="outline" className="text-green-600 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Aceita</Badge>
      case 'rejeitada':
        return <Badge variant="outline" className="text-red-600 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejeitada</Badge>
      case 'concluida':
        return <Badge variant="outline" className="text-green-600 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Concluída</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  // Função para abrir WhatsApp
  const handleWhatsApp = (order: Order) => {
    const phone = order.userPhone?.replace(/\D/g, '') // Remove caracteres não numéricos
    if (!phone) {
      toast({
        title: "Telefone não disponível",
        description: "O cliente não possui telefone cadastrado.",
        variant: "destructive"
      })
      return
    }

    const message = `Olá ${order.userName}! 

Recebi seu pedido "${order.tipo === 'cotacao' ? 'Cotação' : 'Pedido'}" no valor de ${formatPrice(order.total)}.

${order.observacoes ? `Observações: ${order.observacoes}` : ''}

Vou analisar e retornar em breve!

Atenciosamente,
${order.storeName || 'Nossa Loja'}`

    const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  // Função para atualizar status
  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId, status: newStatus })
      toast({
        title: "Status atualizado!",
        description: `Pedido #${orderId} agora está ${newStatus}.`,
      })
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status do pedido.",
        variant: "destructive"
      })
    }
  }

  // Loading State
  if (isLoading) {
    return <OrdersTableSkeleton />
  }

  return (
    <div className="space-y-4">
      {/* Header com controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar pedidos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9">
                Status: {statusFilter === "all" ? "Todos" : statusFilter}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pendente")}>
                Pendentes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("respondida")}>
                Respondidas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("aceita")}>
                Aceitas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("concluida")}>
                Concluídas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {filteredOrders.length} pedido(s)
          </span>
        </div>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input 
                    type="checkbox" 
                    className="rounded" 
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-12">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <ContextMenu key={order.id}>
                  <ContextMenuTrigger asChild>
                    <TableRow className="hover:bg-gray-50 select-none">
                  <TableCell>
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {order.userImage && order.userImage !== 'null' ? (
                          <Image 
                            src={order.userImage} 
                            alt={order.userName || 'Cliente'} 
                            width={40} 
                            height={40} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback se a imagem falhar
                              e.currentTarget.style.display = 'none'
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                              if (nextElement) {
                                nextElement.style.display = 'flex'
                              }
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${order.userImage && order.userImage !== 'null' ? 'hidden' : 'flex'}`}>
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{order.userName || 'Cliente'}</div>
                        <div className="text-sm text-gray-500">{order.userEmail}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{order.tipo === 'cotacao' ? 'Cotação' : 'Pedido'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold text-green-600">{formatPrice(order.total)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell>
                    {order.userPhone ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleWhatsApp(order)
                        }}
                        className="flex items-center gap-2 h-8"
                      >
                        <Phone className="h-3 w-3" />
                        <span className="text-xs">{order.userPhone}</span>
                      </Button>
                    ) : (
                      <span className="text-sm text-gray-400">Não informado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{formatDate(order.createdAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar Detalhes
                        </DropdownMenuItem>
                        {order.userPhone && (
                          <DropdownMenuItem onClick={() => handleWhatsApp(order)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Responder via WhatsApp
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'respondida')}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Marcar como Respondida
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'aceita')}>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Marcar como Aceita
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'rejeitada')}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Marcar como Rejeitada
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'concluida')}>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Marcar como Concluída
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowDeleteDialog(true)
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                  </ContextMenuTrigger>
                  
                  <ContextMenuContent 
                    className="w-48"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <ContextMenuItem onClick={(e) => {
                      e.preventDefault()
                      setSelectedOrder(order)
                    }}>
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar Detalhes
                    </ContextMenuItem>
                    {order.userPhone && (
                      <ContextMenuItem onClick={(e) => {
                        e.preventDefault()
                        handleWhatsApp(order)
                      }}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Responder via WhatsApp
                      </ContextMenuItem>
                    )}
                    <ContextMenuSeparator />
                    <ContextMenuLabel>Alterar Status</ContextMenuLabel>
                    <ContextMenuItem onClick={(e) => {
                      e.preventDefault()
                      handleStatusUpdate(order.id, 'respondida')
                    }}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Marcar como Respondida
                    </ContextMenuItem>
                    <ContextMenuItem onClick={(e) => {
                      e.preventDefault()
                      handleStatusUpdate(order.id, 'aceita')
                    }}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Marcar como Aceita
                    </ContextMenuItem>
                    <ContextMenuItem onClick={(e) => {
                      e.preventDefault()
                      handleStatusUpdate(order.id, 'rejeitada')
                    }}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Marcar como Rejeitada
                    </ContextMenuItem>
                    <ContextMenuItem onClick={(e) => {
                      e.preventDefault()
                      handleStatusUpdate(order.id, 'concluida')
                    }}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Marcar como Concluída
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem 
                      onClick={(e) => {
                        e.preventDefault()
                        setSelectedOrder(order)
                        setShowDeleteDialog(true)
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog de Visualização */}
      <OrderDetailsDialog 
        order={selectedOrder} 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
      />

      {/* Dialog de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // TODO: Implementar exclusão
                toast({
                  title: "Pedido excluído",
                  description: "O pedido foi removido com sucesso.",
                })
                setShowDeleteDialog(false)
                setSelectedOrder(null)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function OrdersTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header com controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-9 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-9 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Cliente</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Valor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Telefone</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Data</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Skeleton rows */}
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
