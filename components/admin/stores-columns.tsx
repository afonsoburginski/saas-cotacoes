"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, Clock, AlertCircle, Star, Package, TrendingUp, Wrench, Edit, Eye, MoreHorizontal } from "lucide-react"
import { DataTableColumnHeader } from "./data-table-column-header"
import { useAdminStore } from "@/stores/admin-store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"

export type Store = {
  id: number
  userId?: string
  slug: string
  nome: string
  email?: string
  telefone?: string
  cnpj?: string
  endereco?: string
  cep?: string
  rua?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  descricao?: string
  logo?: string | null
  coverImage?: string | null
  horarioFuncionamento?: string
  status: string
  plano: string
  priorityScore?: number
  shippingPolicy?: any
  address?: any
  features?: string[]
  totalProducts?: number
  totalServices?: number
  totalSales?: number | string
  rating?: number | string
  totalReviews?: number
  createdAt: string
  updatedAt: string
  businessType?: 'comercio' | 'servico'
}

const getStatusBadge = (status: string) => {
  if (status === 'approved') {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Aprovado
      </Badge>
    )
  }
  if (status === 'pending') {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
        <Clock className="w-3 h-3 mr-1" />
        Pendente
      </Badge>
    )
  }
  return (
    <Badge className="bg-red-100 text-red-700 border-red-200">
      <AlertCircle className="w-3 h-3 mr-1" />
      Suspenso
    </Badge>
  )
}

const getPlanBadge = (plano: string) => {
  const labels = {
    basico: 'Básico',
    plus: 'Plus',
    premium: 'Premium',
  }

  return (
    <Badge variant="outline">
      {labels[plano as keyof typeof labels] || plano}
    </Badge>
  )
}

export const columns: ColumnDef<Store>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  
  // Removida coluna de Tipo do Negócio; badge será exibida na coluna "Loja".
  {
    accessorKey: "nome",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loja" />
    ),
    cell: ({ row }) => {
      const store = row.original
      const label = store.businessType === 'servico' ? 'Prestador de Serviço' : 'Comércio (Loja Física)'
      return (
        <div>
          <div className="flex items-center gap-1">
            <p className="font-medium text-gray-900">{store.nome}</p>
            <Badge variant="secondary">{label}</Badge>
          </div>
          {store.descricao && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{store.descricao}</p>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contato" />
    ),
    cell: ({ row }) => {
      const store = row.original
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-sm truncate max-w-[150px]">{store.email}</span>
          </div>
          {store.telefone && (
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-sm">{store.telefone}</span>
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "cidade",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Localização" />
    ),
    cell: ({ row }) => {
      const store = row.original
      return (
        <div className="space-y-1">
          {store.cidade && store.estado && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="text-sm">{store.cidade}/{store.estado}</span>
            </div>
          )}
          {store.bairro && (
            <span className="text-xs text-gray-400">{store.bairro}</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "totalProducts",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Produtos & Serviços" />
    ),
    cell: ({ row }) => {
      const store = row.original
      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Package className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">{store.totalProducts || 0}</span>
          </div>
          {store.totalServices && store.totalServices > 0 && (
            <div className="flex items-center gap-1">
              <Wrench className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">{store.totalServices}</span>
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "rating",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Avaliação" />
    ),
    cell: ({ row }) => {
      const store = row.original
      return (
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{store.rating || "0.0"}</span>
          {store.totalReviews && (
            <span className="text-xs text-gray-400">({store.totalReviews})</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "totalSales",
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Vendas" />
      </div>
    ),
    cell: ({ row }) => {
      const store = row.original
      const amount = typeof store.totalSales === 'number' 
        ? store.totalSales
        : 0
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount)
      
      return (
        <div className="flex items-center justify-end gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-green-600" />
          <div className="text-right font-medium">{formatted}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "plano",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Plano" />
    ),
    cell: ({ row }) => {
      return getPlanBadge(row.original.plano)
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      return getStatusBadge(row.original.status)
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => {
      const store = row.original
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Tipo do Negócio</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={store.businessType || 'comercio'}
                    onValueChange={async (value) => {
                      const val = (value === 'servico' ? 'servico' : 'comercio') as 'comercio' | 'servico'
                      console.log('🟦 Dropdown onValueChange ->', val, 'storeId:', store.id)
                      const uid = (store as any).userId || (store as any).user_id
                      if (!uid) {
                        console.warn('⚠️ Sem userId para storeId', store.id)
                        return
                      }
                      const updateStore = useAdminStore.getState().updateStore
                      updateStore(store.id, { businessType: val })
                      ;(row as any).original.businessType = val
                      await fetch(`/api/admin/users/${uid}/business-type`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ businessType: val }),
                        cache: 'no-store',
                        keepalive: true,
                      })
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('admin:stores:updated'))
                      }
                      console.log('🟩 Dropdown PATCH success for', val)
                    }}
                  >
                    <DropdownMenuRadioItem value="comercio">Comércio (Loja Física)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="servico">Prestador de Serviço</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  
]
