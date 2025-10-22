"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { ProductTable } from "@/components/products/product-table"
import { useProducts } from "@/hooks/use-products"
import { Package, Star, TrendingUp, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

interface CatalogoPageProps {
  params: { slug: string }
}

export default function CatalogoPage({ params }: CatalogoPageProps) {
  const { slug } = params
  const { data: session } = useSession()
  const [storeId, setStoreId] = useState<string | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  
  // Buscar storeId do usuário
  useEffect(() => {
    async function fetchStore() {
      if (session?.user?.id) {
        const res = await fetch(`/api/user/store`)
        if (res.ok) {
          const data = await res.json()
          if (data.storeId) {
            setStoreId(data.storeId?.toString())
            
            // Verificar se acabou de pagar
            const paymentConfirmed = localStorage.getItem('payment_confirmed')
            if (paymentConfirmed === 'true') {
              localStorage.removeItem('payment_confirmed')
              setTimeout(() => setShowSuccessDialog(true), 1000)
            }
          } else {
            // Se não tem store ainda, usar ID temporário ou criar
            console.log('Store não encontrada, pode ser nova conta')
            // Definir storeId como '0' para não mostrar produtos de outras lojas
            setStoreId('0')
          }
        }
      }
    }
    fetchStore()
  }, [session?.user?.id])
  
  const { data, isLoading } = useProducts({ 
    storeId: storeId || undefined,
    includeInactive: true
  })

  const products = data?.data || []
  
  // Não mostrar nada até ter storeId
  if (!storeId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando sua loja...</p>
        </div>
      </div>
    )
  }
  
  // Estatísticas calculadas
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.ativo).length
  const featuredProducts = products.filter(p => p.destacado).length
  const lowStockProducts = products.filter(p => p.estoque < 10).length

  return (
    <div className="space-y-6">
      {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo</h1>
          <p className="text-muted-foreground">Gerencie produtos e serviços da sua loja</p>
        </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Produtos
            </CardTitle>
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeProducts} ativos no catálogo
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produtos Ativos
            </CardTitle>
            <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeProducts}</div>
            <p className="text-xs text-green-600 font-medium mt-1">
              {totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0}% do total disponível
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Destaque
            </CardTitle>
            <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{featuredProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Produtos promovidos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estoque Baixo
            </CardTitle>
            <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{lowStockProducts}</div>
            <p className="text-xs text-red-600 font-medium mt-1">
              {lowStockProducts > 0 ? "Requer atenção" : "Estoque saudável"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Catálogo (Produtos e Serviços) */}
      <ProductTable 
        storeId={storeId}
        isLoading={isLoading}
      />

      {/* Dialog de Sucesso de Pagamento */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex justify-center mb-6"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-3 font-marlin">
                Pagamento Confirmado! 🎉
              </h2>
              <p className="text-gray-600 mb-6 font-montserrat">
                Sua assinatura está ativa! Comece cadastrando seus produtos e serviços.
              </p>

              <Button
                onClick={() => setShowSuccessDialog(false)}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12"
              >
                Começar Agora
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
