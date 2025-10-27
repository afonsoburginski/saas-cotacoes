"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { 
  Store, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Package,
  Wrench,
  Star,
  Building2
} from "lucide-react"
import Image from "next/image"

interface StoreDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  store: any
}

export function StoreDetailsDialog({ open, onOpenChange, store }: StoreDetailsDialogProps) {
  if (!store) return null

  const getStatusBadge = (status: string) => {
    if (status === 'approved') {
      return <Badge className="bg-green-100 text-green-700 border-green-200">Aprovado</Badge>
    }
    if (status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pendente</Badge>
    }
    return <Badge className="bg-red-100 text-red-700 border-red-200">Suspenso</Badge>
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => onOpenChange(false)}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
              {store?.logo ? (
                <Image
                  src={store.logo}
                  alt={store?.nome || 'Loja'}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              ) : (
                <Store className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{store?.nome || 'Loja'}</h2>
              {store?.descricao && (
                <p className="text-sm text-gray-600 mt-1">{store.descricao}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {store?.status && getStatusBadge(store.status)}
            <button onClick={() => onOpenChange(false)} className="p-2 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Coluna Esquerda */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  Contato
                </h3>
                <div className="space-y-2">
                  {store?.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="break-all">{store.email}</span>
                    </div>
                  )}
                  {store?.telefone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{store.telefone}</span>
                    </div>
                  )}
                  {store?.cnpj && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span>CNPJ: {store.cnpj}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  Localização
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  {store?.endereco && <p>{store.endereco}</p>}
                  {store?.cidade && store?.estado && <p>{store.cidade}, {store.estado}</p>}
                  {store?.cep && <p className="text-gray-400">CEP: {store.cep}</p>}
                </div>
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  Estatísticas
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="w-4 h-4 text-blue-500" />
                      <span>Produtos</span>
                    </div>
                    <span className="font-semibold text-gray-900">{store?.totalProducts || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Wrench className="w-4 h-4 text-purple-500" />
                      <span>Serviços</span>
                    </div>
                    <span className="font-semibold text-gray-900">{store?.totalServices || 0}</span>
                  </div>
                  {store?.rating && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>Avaliação</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-gray-900">{store.rating}</span>
                        {store?.totalReviews && <span className="text-xs text-gray-400">({store.totalReviews})</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Informações
                </h3>
                <div className="space-y-2 text-sm">
                  {store?.horarioFuncionamento && (
                    <div className="text-gray-600">
                      <span className="font-medium">Horário:</span> {store.horarioFuncionamento}
                    </div>
                  )}
                  <div className="text-gray-600">
                    <span className="font-medium">Plano:</span>{' '}
                    <Badge variant="outline">{store?.plano}</Badge>
                  </div>
                  {store?.createdAt && (
                    <div className="text-gray-600">
                      <span className="font-medium">Criado em:</span>{' '}
                      {new Date(store.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

