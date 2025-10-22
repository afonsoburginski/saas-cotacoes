"use client"

import * as React from "react"
import { Order } from "@/hooks/use-orders"
import { useOrderItems } from "@/hooks/use-orders"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  User,
  Package,
  DollarSign,
  Clock,
  Image as ImageIcon,
} from "lucide-react"
import Image from "next/image"

interface OrderDetailsDialogProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

export function OrderDetailsDialog({ order, isOpen, onClose }: OrderDetailsDialogProps) {
  const { data: orderItems = [] } = useOrderItems(order?.id || 0)

  if (!order) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Pendente</Badge>
      case 'respondida':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Respondida</Badge>
      case 'aceita':
        return <Badge variant="outline" className="text-green-600 border-green-200">Aceita</Badge>
      case 'rejeitada':
        return <Badge variant="outline" className="text-red-600 border-red-200">Rejeitada</Badge>
      case 'concluida':
        return <Badge variant="outline" className="text-green-600 border-green-200">Concluída</Badge>
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

  const formatServicePrice = (item: any) => {
    // Se tem preço mínimo e máximo, mostrar faixa
    if (item.servicePrecoMinimo && item.servicePrecoMaximo && item.servicePrecoMinimo !== item.servicePrecoMaximo) {
      return `${formatPrice(item.servicePrecoMinimo)} - ${formatPrice(item.servicePrecoMaximo)}/${item.serviceTipoPrecificacao || 'unidade'}`
    }

    // Se tem preço fixo
    if (item.servicePrice && item.servicePrice > 0) {
      const unidade = item.serviceTipoPrecificacao || 'unidade'
      return `${formatPrice(item.servicePrice)}/${unidade}`
    }

    // Se tem apenas preço mínimo
    if (item.servicePrecoMinimo && item.servicePrecoMinimo > 0) {
      const unidade = item.serviceTipoPrecificacao || 'unidade'
      return `A partir de ${formatPrice(item.servicePrecoMinimo)}/${unidade}`
    }

    // Caso contrário, sob consulta
    return "Sob consulta"
  }

  const formatProductPrice = (item: any) => {
    if (item.productTemVariacaoPreco || (item.productPrice || 0) <= 0) {
      return "Sob consulta"
    }
    return formatPrice(item.productPrice || 0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[80vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {order.userImage && order.userImage !== 'null' ? (
                <Image 
                  src={order.userImage} 
                  alt={order.userName || 'Cliente'} 
                  width={32} 
                  height={32} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                    if (nextElement) {
                      nextElement.style.display = 'flex'
                    }
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center ${order.userImage && order.userImage !== 'null' ? 'hidden' : 'flex'}`}>
                <User className="h-4 w-4 text-gray-600" />
              </div>
            </div>
            Pedido #{order.id} - {order.userName || 'Cliente'}
          </DialogTitle>
          <DialogDescription>
            {order.tipo === 'cotacao' ? 'Cotação' : 'Pedido'} enviado em {formatDate(order.createdAt)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações do Cliente */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Informações do Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nome</label>
                <p className="text-sm text-gray-900">{order.userName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{order.userEmail || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">{getStatusBadge(order.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Valor Total</label>
                <p className="text-sm font-semibold text-green-600">{formatPrice(order.total)}</p>
              </div>
            </div>
          </div>

          {/* Lista de Produtos/Serviços */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Itens Solicitados</h3>
            {orderItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum item encontrado para este pedido.</p>
                <p className="text-sm">Verifique se os itens foram criados corretamente.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      {/* Imagem do produto/serviço */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {item.productImage || item.serviceImage ? (
                          <Image 
                            src={item.productImage || item.serviceImage || ''} 
                            alt={item.productName || item.serviceName || 'Item'} 
                            width={64} 
                            height={64} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      
                      {/* Detalhes do item */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {item.productName || item.serviceName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {item.productCategory || item.serviceCategory}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {item.productId ? 'Produto' : 'Serviço'}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                Qtd: {item.qty}
                              </span>
                            </div>
                          </div>
                          
                          {/* Preço */}
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {item.productId 
                                ? formatProductPrice(item)
                                : formatServicePrice(item)
                              }
                            </p>
                            <p className="text-sm text-gray-500">
                              Total: {formatPrice(item.precoTotal)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Observações */}
                        {item.observacoes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                            {item.observacoes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Observações Gerais */}
          {order.observacoes && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Observações Gerais</h3>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-900">{order.observacoes}</p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
