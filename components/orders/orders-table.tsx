"use client"

import * as React from "react"
import { useRef, useState } from "react"
import { useOrders, Order, useUpdateOrderStatus, useDeleteOrder, useDeleteOrders } from "@/hooks/use-orders"
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
  Download,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { generatePdfFromElement } from "@/lib/pdf"
import { useStores } from "@/hooks/use-stores"

interface OrdersTableProps {
  isLoading: boolean
}

export function OrdersTable({ isLoading }: OrdersTableProps) {
  const { data: orders = [] } = useOrders()
  const { toast } = useToast()
  const updateStatusMutation = useUpdateOrderStatus()
  const deleteOrder = useDeleteOrder()
  const deleteOrders = useDeleteOrders()
  const { data: storesData } = useStores()
  const stores = storesData?.data || []
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<number[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const pdfRef = useRef<HTMLDivElement | null>(null)
  const [renderPdfDOM, setRenderPdfDOM] = useState(false)
  const [pendingOrderForPdf, setPendingOrderForPdf] = useState<any | null>(null)


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

  // Funções de seleção
  const handleSelectOrder = (orderId: number, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId])
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId))
    }
  }

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedOrders(filteredOrders.map(o => o.id))
    } else {
      setSelectedOrders([])
    }
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

  const handleDownloadPdf = async (order: any) => {
    try {
      const res = await fetch(`/api/orders/${order.id}/items`)
      const itemsJson = res.ok ? await res.json() : { data: [] }
      const items = itemsJson.data || []
      const store = stores.find((s: any) => String(s.id) === String(order.storeId)) as any
      setPendingOrderForPdf({ order, items, store })
      setRenderPdfDOM(true)
      await new Promise(r => setTimeout(r, 300))
      const el = pdfRef.current
      if (!el) return
      await generatePdfFromElement(el, {
        fileName: `Orcamento_${String(order.id).padStart(5,'0')}.pdf`,
        width: 794,
        height: 1123,
        scale: 2,
        backgroundColor: '#ffffff'
      })
    } catch (e) {
      toast({ title: 'Erro ao gerar PDF', description: 'Tente novamente.', variant: 'destructive' })
    } finally {
      setRenderPdfDOM(false)
      setPendingOrderForPdf(null)
    }
  }

  // 🚀 Bulk delete com UI otimista
  const handleBulkDelete = () => {
    if (selectedOrders.length === 0) {
      toast({
        title: "Nenhum pedido selecionado",
        description: "Selecione ao menos um pedido para excluir.",
        variant: "destructive",
      })
      return
    }
    
    deleteOrders.mutate(selectedOrders, {
      onSuccess: () => {
        setSelectedOrders([])
        setShowBulkDeleteDialog(false)
        toast({
          title: "Pedidos excluídos!",
          description: `${selectedOrders.length} pedido${selectedOrders.length > 1 ? 's' : ''} ${selectedOrders.length > 1 ? 'foram' : 'foi'} removido${selectedOrders.length > 1 ? 's' : ''}.`,
        })
      },
      onError: () => {
        toast({
          title: "Erro!",
          description: "Não foi possível excluir os pedidos.",
          variant: "destructive",
        })
      },
    })
  }

  // 🚀 Delete individual com UI otimista
  const handleSingleDelete = () => {
    if (!selectedOrder) return
    
    deleteOrder.mutate(selectedOrder.id, {
      onSuccess: () => {
        setShowDeleteDialog(false)
        setSelectedOrder(null)
        toast({
          title: "Pedido excluído!",
          description: `O pedido #${selectedOrder.id} foi removido.`,
        })
      },
      onError: () => {
        toast({
          title: "Erro!",
          description: "Não foi possível excluir o pedido.",
          variant: "destructive",
        })
      },
    })
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
          {selectedOrders.length > 0 && (
            <>
              <span className="text-sm font-medium text-blue-600">
                {selectedOrders.length} selecionado(s)
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowBulkDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </>
          )}
          {selectedOrders.length === 0 && (
            <span className="text-sm text-gray-600">
              {filteredOrders.length} pedido(s)
            </span>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onCheckedChange={handleSelectAll}
                    className="border border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
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
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                      onClick={(e) => e.stopPropagation()}
                      className="border border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
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
                        <DropdownMenuItem onSelect={() => {
                          // Pequeno delay para garantir que o menu fecha antes do dialog abrir
                          setTimeout(() => setSelectedOrder(order), 0)
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar Detalhes
                        </DropdownMenuItem>
                        {order.userPhone && (
                          <DropdownMenuItem onSelect={() => handleWhatsApp(order)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Responder via WhatsApp
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onSelect={() => handleDownloadPdf(order)}>
                          <Download className="h-4 w-4 mr-2" />
                          Baixar PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => handleStatusUpdate(order.id, 'respondida')}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Marcar como Respondida
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleStatusUpdate(order.id, 'aceita')}>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Marcar como Aceita
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleStatusUpdate(order.id, 'rejeitada')}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Marcar como Rejeitada
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleStatusUpdate(order.id, 'concluida')}>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Marcar como Concluída
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onSelect={() => {
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
                  
                  <ContextMenuContent className="w-48">
                    <ContextMenuItem onSelect={() => {
                      // Delay para garantir que o menu fecha antes do dialog abrir
                      setTimeout(() => setSelectedOrder(order), 0)
                    }}>
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar Detalhes
                    </ContextMenuItem>
                    {order.userPhone && (
                      <ContextMenuItem onSelect={() => handleWhatsApp(order)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Responder via WhatsApp
                      </ContextMenuItem>
                    )}
                    <ContextMenuSeparator />
                    <ContextMenuLabel>Alterar Status</ContextMenuLabel>
                    <ContextMenuItem onSelect={() => handleStatusUpdate(order.id, 'respondida')}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Marcar como Respondida
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={() => handleStatusUpdate(order.id, 'aceita')}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Marcar como Aceita
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={() => handleStatusUpdate(order.id, 'rejeitada')}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Marcar como Rejeitada
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={() => handleStatusUpdate(order.id, 'concluida')}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Marcar como Concluída
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={() => handleDownloadPdf(order)}>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar PDF
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem 
                      onSelect={() => {
                        setTimeout(() => {
                          setSelectedOrder(order)
                          setShowDeleteDialog(true)
                        }, 0)
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

      {/* Dialog de Exclusão - Individual */}
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
              onClick={handleSingleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteOrder.isPending}
            >
              {deleteOrder.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Exclusão - Múltiplos */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Pedidos</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedOrders.length} pedido{selectedOrders.length > 1 ? 's' : ''}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteOrders.isPending}
            >
              {deleteOrders.isPending ? "Excluindo..." : `Excluir ${selectedOrders.length} pedido${selectedOrders.length > 1 ? 's' : ''}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* DOM oculto para renderizar PDF do pedido */}
      {renderPdfDOM && pendingOrderForPdf && (
        <div style={{ position: 'fixed', left: '-99999px', top: '0' }}>
          <div
            id="pdf-root"
            ref={pdfRef}
            style={{ width: '794px', height: '1123px', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'Arial, sans-serif', position: 'relative' }}
          >
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '32px 48px 0 48px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <p style={{ color: '#2563eb', fontWeight: '600', fontSize: '16px', margin: 0 }}>Data: {new Date().toLocaleDateString('pt-BR')}</p>
                    <div style={{ marginTop: '8px' }}>
                      <h3 style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '14px', margin: '0 0 4px 0' }}>Cliente:</h3>
                      <p style={{ fontWeight: 'bold', color: 'black', fontSize: '14px', margin: '0 0 2px 0' }}>{pendingOrderForPdf.order?.userName || 'Cliente'}</p>
                      {pendingOrderForPdf.order?.userPhone && (
                        <p style={{ color: 'black', fontSize: '14px', margin: '0 0 2px 0' }}>{pendingOrderForPdf.order.userPhone}</p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginRight: '64px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <img src="/logo-pdf.png" alt="Orçanorte" style={{ height: '80px', width: 'auto', display: 'block' }} />
                    </div>
                    <div style={{ position: 'absolute', top: 0, right: '48px', width: '40px', height: '100px', backgroundColor: '#1e3a8a' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', height: '24px' }}>
                <div style={{ width: '55%', height: '24px', backgroundColor: '#1e3a8a' }} />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingLeft: '16px', paddingRight: '48px', height: '24px' }}>
                  <h1 style={{ color: '#2563eb', fontSize: '22px', fontWeight: 'normal', letterSpacing: '0.05em', margin: 0, lineHeight: 1, transform: 'translateY(-8px)' }}>
                    {`ORÇAMENTO #${String(pendingOrderForPdf.order?.id ?? '').padStart(5,'0')}`}
                  </h1>
                </div>
              </div>

              <div style={{ padding: '0 48px', flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '220px' }}>
                <div style={{ marginTop: '8px' }}>
                  {(() => {
                    const group = { storeNome: pendingOrderForPdf.store?.nome || '', items: pendingOrderForPdf.items || [] }
                    const store = pendingOrderForPdf.store
                    const tipoRaw = (store?.tipo || store?.businessType || '').toString().toLowerCase()
                    const isServico = tipoRaw.includes('serv') || tipoRaw === 'prestador' || group.items.some((it: any) => it.serviceId)
                    return (
                      <div style={{ marginBottom: '16px' }}>
                        <h3 style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '16px', marginBottom: '8px', marginTop: 0 }}>
                          {isServico ? 'Prestador:' : 'Comércio:'}
                        </h3>
                        <p style={{ fontWeight: 'bold', color: 'black', fontSize: '16px', marginBottom: '2px', marginTop: 0 }}>{group.storeNome}</p>
                        {store?.telefone && <p style={{ color: 'black', fontSize: '16px', marginBottom: '2px', marginTop: 0 }}>{store.telefone}</p>}
                        {store?.endereco && <p style={{ color: 'black', fontSize: '16px', marginBottom: '14px', marginTop: 0 }}>{store.endereco}</p>}

                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f3f4f6' }}>
                              <th style={{ paddingTop: 0, paddingBottom: '6px', paddingLeft: '8px', paddingRight: '8px', border: '1px solid #e5e7eb', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', lineHeight: '11px', verticalAlign: 'top', transform: 'translateY(-1px)' }}>Item</th>
                              <th style={{ paddingTop: 0, paddingBottom: '6px', paddingLeft: '8px', paddingRight: '8px', border: '1px solid #e5e7eb', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', lineHeight: '11px', verticalAlign: 'top', width: '80px', transform: 'translateY(-1px)' }}>Qtd</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.items.map((item: any, idx: number) => (
                              <tr key={idx}>
                                <td style={{ paddingTop: 0, paddingBottom: '6px', paddingLeft: '8px', paddingRight: '8px', border: '1px solid #e5e7eb', fontSize: '12px', lineHeight: '11px', verticalAlign: 'top', transform: 'translateY(-1px)' }}>{item.productNome}</td>
                                <td style={{ paddingTop: 0, paddingBottom: '6px', paddingLeft: '8px', paddingRight: '8px', border: '1px solid #e5e7eb', fontSize: '12px', lineHeight: '11px', verticalAlign: 'top', transform: 'translateY(-1px)' }}>{item.qty}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  })()}
                </div>

                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%' }}>
                  <div style={{ paddingLeft: '48px', paddingRight: '48px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                      <div style={{ backgroundColor: '#1e3a8a', color: 'white', paddingTop: 0, paddingBottom: '12px', paddingLeft: '40px', paddingRight: '40px', fontWeight: 'bold', fontSize: '20px', letterSpacing: '0.05em', lineHeight: '20px' }}>
                        ORÇAMENTO ENVIADO
                      </div>
                    </div>
                    <div style={{ width: '128px', height: '3px', backgroundColor: '#1e3a8a', marginBottom: '12px' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '16px', marginBottom: '6px', marginTop: 0 }}>FORMA DE PAGAMENTO</h3>
                        <p style={{ fontSize: '14px', color: 'black', margin: '0 0 4px 0' }}>Pix com 10% de desconto</p>
                        <p style={{ fontSize: '14px', color: 'black', margin: 0 }}>ou 2x no cartão de crédito</p>
                      </div>
                      <div>
                        <h3 style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '16px', marginBottom: '6px', marginTop: 0 }}>TERMOS E CONDIÇÕES</h3>
                        <p style={{ fontSize: '14px', color: 'black', margin: 0 }}>Este orçamento é válido por 30 dias.</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#1e3a8a', color: 'white', paddingTop: '6px', paddingBottom: '14px', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', lineHeight: '16px', paddingLeft: '48px', paddingRight: '48px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span>☎</span><span>(66) 9 9661-4628</span></span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span>✉</span><span>orcanorte28@gmail.com</span></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span>●</span><span>www.orcanorte.com.br</span></span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}><span>@</span><span>orcanorte</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
