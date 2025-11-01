"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction, CardFooter } from "@/components/ui/card"
import { Users, Store, ShoppingCart, TrendingUp } from "lucide-react"
import { StoresDataTable } from "@/components/admin/stores-data-table-tanstack"
import { columns } from "@/components/admin/stores-columns"
import { DashboardSkeleton } from "@/components/admin/dashboard-skeleton"
import { ChartPlansGrowth } from "@/components/admin/chart-plans-growth"
import { useAdminRealtime } from "@/hooks/use-admin-realtime"
import { useAdminStore } from "@/stores/admin-store"
import { StoreDetailsDialog } from "@/components/admin/store-details-dialog"
import { StoreAdvertisementDialog } from "@/components/admin/store-advertisement-dialog"
import { LojaHeader } from "@/components/loja/loja-header"
import { useStoreSlug } from "@/hooks/use-store-slug"
import { useSession } from "@/lib/auth-client"
import { PaymentLinksCard } from "@/components/admin/payment-links-card"
import { CategoriesManager } from "@/components/admin/categories-manager"
import { UnitsManager } from "@/components/admin/units-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSessionCookie } from "@/hooks/use-session-cookie"

interface LojaAdminPageProps {
  params: { slug: string }
}

export default function LojaAdminPage({ params }: LojaAdminPageProps) {
  const { slug } = params
  // Usar hook de cookie para leitura ultra-rápida
  const { session: cookieSession, isLoading: isCookieLoading } = useSessionCookie()
  const { data: session, isPending: isSessionPending } = useSession()
  const { stats, stores, isLoading } = useAdminRealtime()
  const updateStore = useAdminStore((state) => state.updateStore)
  const { data: storeSlugData } = useStoreSlug()
  
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false)
  const [selectedStore, setSelectedStore] = React.useState<any>(null)
  const [advertisementDialogOpen, setAdvertisementDialogOpen] = React.useState(false)
  const [selectedStoreForAdvertisement, setSelectedStoreForAdvertisement] = React.useState<any>(null)

  // Emails permitidos para acesso admin
  const allowedEmails = ['afonsoburginski@gmail.com', 'orcanorte28@gmail.com']
  
  // Priorizar email do cookie (ultra-rápido) ou fallback para session hook
  const userEmail = cookieSession?.email || session?.user?.email
  
  // Verificar se o usuário tem acesso
  const hasAccess = userEmail && allowedEmails.includes(userEmail)

  // Mostrar loading apenas brevemente para garantir leitura do cookie
  if (isCookieLoading || (isSessionPending && !cookieSession?.email)) {
    return (
      <>
        <LojaHeader storeName={storeSlugData?.storeName} title="Admin" />
        <div className="p-6">
          <DashboardSkeleton />
        </div>
      </>
    )
  }

  // Se não tem acesso, mostrar mensagem (após verificar que a sessão já carregou)
  if (!hasAccess) {
    return (
      <>
        <LojaHeader storeName={storeSlugData?.storeName} title="Admin" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
            <p className="text-gray-600">Você não tem permissão para acessar esta área.</p>
            <p className="text-sm text-gray-500 mt-2">Esta seção é restrita a administradores do sistema.</p>
          </div>
        </div>
      </>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleViewDetails = (store: any) => {
    setSelectedStore(store)
    setViewDialogOpen(true)
  }

  const handleApprove = async (store: any) => {
    try {
      updateStore(store.id, { status: 'approved' })
      await fetch(`/api/admin/stores/${store.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      })
    } catch (err) {
      console.error('Error approving store:', err)
    }
  }

  const handleSuspend = async (store: any) => {
    try {
      updateStore(store.id, { status: 'suspended' })
      await fetch(`/api/admin/stores/${store.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'suspended' })
      })
    } catch (err) {
      console.error('Error suspending store:', err)
    }
  }

  const handleBlock = async (store: any) => {
    try {
      updateStore(store.id, { status: 'blocked' })
      await fetch(`/api/admin/stores/${store.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'blocked' })
      })
    } catch (err) {
      console.error('Error blocking store:', err)
    }
  }

  const handleManageAdvertisement = (store: any) => {
    setSelectedStoreForAdvertisement(store)
    setAdvertisementDialogOpen(true)
  }

  return (
    <>
      <LojaHeader storeName={storeSlugData?.storeName} title="Admin" />
      
      <div className="p-6 space-y-6">
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
            <Card data-slot="card">
              <CardHeader className="grid grid-cols-[1fr_auto] grid-rows-[auto_auto]">
                <CardDescription className="text-gray-600">Total de Usuários</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-gray-900">
                  {stats?.totalUsers || 0}
                </CardTitle>
                <CardAction className="col-start-2 row-start-1 row-end-2 self-center">
                  <Users className="size-6 text-gray-500" />
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">Sistema ativo <TrendingUp className="size-4" /></div>
                <div className="text-muted-foreground">Usuários cadastrados na plataforma</div>
              </CardFooter>
            </Card>

            <Card data-slot="card">
              <CardHeader className="grid grid-cols-[1fr_auto] grid-rows-[auto_auto]">
                <CardDescription className="text-gray-600">Total de Lojas</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-gray-900">
                  {stats?.totalStores || 0}
                </CardTitle>
                <CardAction className="col-start-2 row-start-1 row-end-2 self-center">
                  <Store className="size-6 text-gray-500" />
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">Lojas cadastradas <TrendingUp className="size-4" /></div>
                <div className="text-muted-foreground">Empresas no marketplace</div>
              </CardFooter>
            </Card>

            <Card data-slot="card">
              <CardHeader className="grid grid-cols-[1fr_auto] grid-rows-[auto_auto]">
                <CardDescription className="text-gray-600">Pedidos Total</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-gray-900">
                  {stats?.totalOrders || 0}
                </CardTitle>
                <CardAction className="col-start-2 row-start-1 row-end-2 self-center">
                  <ShoppingCart className="size-6 text-gray-500" />
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">Pedidos realizados <TrendingUp className="size-4" /></div>
                <div className="text-muted-foreground">Total de cotações e orçamentos</div>
              </CardFooter>
            </Card>

            <Card data-slot="card">
              <CardHeader className="grid grid-cols-[1fr_auto] grid-rows-[auto_auto]">
                <CardDescription className="text-gray-600">Receita Total</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-gray-900">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </CardTitle>
                <CardAction className="col-start-2 row-start-1 row-end-2 self-center">
                  <TrendingUp className="size-6 text-gray-500" />
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">Receita acumulada <TrendingUp className="size-4" /></div>
                <div className="text-muted-foreground">Total de assinaturas e pagamentos</div>
              </CardFooter>
            </Card>
          </div>

          <ChartPlansGrowth data={[]} />

          <Card>
            <Tabs defaultValue="lojas" className="w-full">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Todas as Lojas</CardTitle>
                  <CardDescription>Gerencie lojas e categorias</CardDescription>
                </div>
                <TabsList>
                  <TabsTrigger value="lojas">Lojas</TabsTrigger>
                  <TabsTrigger value="categorias">Categorias</TabsTrigger>
                  <TabsTrigger value="unidades">Unidade de medida</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="lojas">
                  <StoresDataTable 
                    columns={columns} 
                    data={stores}
                    onViewDetails={handleViewDetails}
                    onApprove={handleApprove}
                    onSuspend={handleSuspend}
                    onBlock={handleBlock}
                    onManageAdvertisement={handleManageAdvertisement}
                  />
                </TabsContent>
                <TabsContent value="categorias">
                  <CategoriesManager />
                </TabsContent>
                <TabsContent value="unidades">
                  <UnitsManager />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          <PaymentLinksCard />
        </>
      )}

      {viewDialogOpen && (
        <StoreDetailsDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          store={selectedStore}
        />
      )}

      {selectedStoreForAdvertisement && (
        <StoreAdvertisementDialog
          open={advertisementDialogOpen}
          onOpenChange={setAdvertisementDialogOpen}
          storeId={selectedStoreForAdvertisement.id}
          storeName={selectedStoreForAdvertisement.nome}
        />
      )}
      </div>
    </>
  )
}

