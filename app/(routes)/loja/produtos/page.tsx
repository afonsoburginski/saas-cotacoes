"use client"

import { useState } from "react"
import { ProductTable } from "@/components/products/product-table"
import { mockProducts } from "@/lib/mock-data"
import type { Product } from "@/lib/types"
import { Package, Star, TrendingUp, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProdutosPage() {
  const [products, setProducts] = useState(mockProducts.filter((p) => p.storeId === "1")) // Mock store ID

  // Estatísticas calculadas
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.ativo).length
  const featuredProducts = products.filter(p => p.destacado).length
  const lowStockProducts = products.filter(p => p.estoque < 10).length

  const handleProductsUpdate = (updatedProducts: Product[]) => {
    setProducts(updatedProducts)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">Gerencie o catálogo de produtos da sua loja</p>
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

      {/* Tabela de Produtos */}
      <ProductTable 
        products={products} 
        onUpdate={handleProductsUpdate}
      />
    </div>
  )
}
