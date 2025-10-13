"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useListsStore } from "@/stores/lists-store"
import { FileText, MoreHorizontal, Eye, Trash2, Download, Calendar, DollarSign, Package, Truck } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { PageBackground } from "@/components/layout/page-background"
import jsPDF from "jspdf"
import { mockStores } from "@/lib/mock-data"
import { calculateShippingCost, formatShippingInfo } from "@/lib/utils"

export default function ListasPage() {
  const { lists, deleteList, duplicateList } = useListsStore()
  const { toast } = useToast()
  const [selectedList, setSelectedList] = useState<string | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const handleExportPDF = (list: any) => {
    const pdf = new jsPDF()
    
    // Calcular frete
    const groupedByStore = list.items.reduce((acc: any, item: any) => {
      if (!acc[item.storeId]) {
        acc[item.storeId] = { items: [], subtotal: 0, storeNome: item.storeNome }
      }
      acc[item.storeId].items.push(item)
      acc[item.storeId].subtotal += item.precoUnit * item.qty
      return acc
    }, {})

    let totalFrete = 0
    Object.entries(groupedByStore).forEach(([storeId, data]: [string, any]) => {
      const store = mockStores.find(s => s.id === storeId)
      if (store) {
        const frete = calculateShippingCost(store.shippingPolicy, data.subtotal)
        totalFrete += frete
      }
    })
    
    // Header
    pdf.setFontSize(20)
    pdf.text("Lista de Compras", 20, 20)
    
    pdf.setFontSize(14)
    pdf.text(list.nome, 20, 35)
    
    pdf.setFontSize(10)
    pdf.text(`Data: ${formatDate(list.createdAt)}`, 20, 45)
    pdf.text(`Total de itens: ${list.items.length}`, 20, 52)
    
    // Items
    let yPos = 65
    pdf.setFontSize(12)
    pdf.text("Itens:", 20, yPos)
    
    yPos += 10
    pdf.setFontSize(9)
    
    list.items.forEach((item: any, index: number) => {
      if (yPos > 270) {
        pdf.addPage()
        yPos = 20
      }
      
      const itemText = `${index + 1}. ${item.productNome} (${item.storeNome}) - ${item.qty}x ${formatPrice(item.precoUnit)}`
      pdf.text(itemText, 20, yPos)
      pdf.text(formatPrice(item.precoUnit * item.qty), 180, yPos)
      yPos += 7
    })
    
    // Totais
    yPos += 10
    pdf.setFontSize(10)
    pdf.text(`Subtotal Produtos: ${formatPrice(list.totalEstimado)}`, 20, yPos)
    yPos += 7
    pdf.text(`Frete: ${totalFrete === 0 ? 'Gratis' : formatPrice(totalFrete)}`, 20, yPos)
    yPos += 10
    pdf.setFontSize(12)
    pdf.text(`Total Geral: ${formatPrice(list.totalEstimado + totalFrete)}`, 20, yPos)
    
    pdf.save(`lista-${list.nome.toLowerCase().replace(/\s+/g, '-')}.pdf`)
    
    toast({
      title: "PDF exportado!",
      description: `A lista "${list.nome}" foi baixada com sucesso.`,
    })
  }

  const handleDelete = (listId: string, listName: string) => {
    deleteList(listId)
    toast({
      title: "Lista excluída!",
      description: `A lista "${listName}" foi removida.`,
    })
  }

  if (lists.length === 0) {
    return (
      <>
        <PageBackground />
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          <div className="flex items-center justify-center min-h-screen pb-32 md:pb-8">
            <div className="text-center px-6">
              <div className="rounded-full bg-gray-100 p-8 mb-6 inline-block">
                <FileText className="h-16 w-16 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3 font-marlin">Nenhuma lista encontrada</h2>
              <p className="text-gray-600 mb-8 font-montserrat">Crie sua primeira lista a partir do carrinho</p>
              <Button asChild size="lg" className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-montserrat">
                <Link href="/explorar">
                  <Package className="h-5 w-5 mr-2" />
                  Explorar Produtos
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageBackground />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="w-full md:container md:mx-auto md:max-w-[1400px] px-0 md:px-6 py-6 pb-32 md:pb-8">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200 px-4 md:px-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-marlin">
                Minhas Listas
              </h1>
              <p className="text-sm text-gray-600 mt-1 font-montserrat">
                {lists.length} {lists.length === 1 ? 'lista' : 'listas'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
        {lists.map((list) => (
          <Card key={list.id} className="border-gray-200 bg-white rounded-xl md:rounded-2xl shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900 font-marlin">
                  <FileText className="h-5 w-5 text-[#0052FF]" />
                  {list.nome}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="font-montserrat">
                    <DropdownMenuItem onClick={() => setSelectedList(list.id)} className="text-gray-700">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportPDF(list)} className="text-gray-700">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(list.id, list.nome)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                // Calcular frete para esta lista
                const groupedByStore = list.items.reduce((acc: any, item: any) => {
                  if (!acc[item.storeId]) {
                    acc[item.storeId] = { items: [], subtotal: 0, storeNome: item.storeNome }
                  }
                  acc[item.storeId].items.push(item)
                  acc[item.storeId].subtotal += item.precoUnit * item.qty
                  return acc
                }, {})

                let totalFrete = 0
                Object.entries(groupedByStore).forEach(([storeId, data]: [string, any]) => {
                  const store = mockStores.find(s => s.id === storeId)
                  if (store) {
                    const frete = calculateShippingCost(store.shippingPolicy, data.subtotal)
                    totalFrete += frete
                  }
                })

                const totalComFrete = list.totalEstimado + totalFrete

                return (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700 font-montserrat">{formatDate(list.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700 font-montserrat">{list.items.length} itens</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-montserrat" style={{ color: totalFrete === 0 ? '#22C55E' : '#0052FF' }}>
                          {totalFrete === 0 ? 'Frete Grátis' : formatPrice(totalFrete)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-bold text-[#0052FF] font-montserrat">{formatPrice(totalComFrete)}</span>
                      </div>
                    </div>
                  </>
                )
              })()}

              {list.observacoes && (
                <div className="mb-4">
                  <Badge variant="outline" className="text-xs border-gray-200 text-gray-700 font-montserrat">
                    {list.observacoes}
                  </Badge>
                </div>
              )}

              {selectedList === list.id && (() => {
                // Calcular frete novamente para visualização
                const groupedByStore = list.items.reduce((acc: any, item: any) => {
                  if (!acc[item.storeId]) {
                    acc[item.storeId] = { items: [], subtotal: 0, storeNome: item.storeNome }
                  }
                  acc[item.storeId].items.push(item)
                  acc[item.storeId].subtotal += item.precoUnit * item.qty
                  return acc
                }, {})

                let totalFrete = 0
                Object.entries(groupedByStore).forEach(([storeId, data]: [string, any]) => {
                  const store = mockStores.find(s => s.id === storeId)
                  if (store) {
                    const frete = calculateShippingCost(store.shippingPolicy, data.subtotal)
                    totalFrete += frete
                  }
                })

                const totalComFrete = list.totalEstimado + totalFrete

                return (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="font-bold text-gray-900 mb-3 font-marlin">Itens da Lista</h4>
                    <div className="space-y-2">
                      {list.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm py-1">
                          <div className="flex-1">
                            <span className="font-semibold text-gray-900 font-montserrat">{item.productNome}</span>
                            <span className="text-gray-600 ml-2 font-montserrat">
                              ({item.storeNome}) x{item.qty}
                            </span>
                          </div>
                          <div className="font-bold text-gray-900 font-montserrat">{formatPrice(item.precoUnit * item.qty)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-3 space-y-2">
                      <div className="flex justify-between text-sm font-montserrat">
                        <span className="text-gray-600">Subtotal Produtos</span>
                        <span className="font-semibold text-gray-900">{formatPrice(list.totalEstimado)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-montserrat">
                        <span className="text-gray-600">Frete</span>
                        <span className="font-semibold" style={{ color: totalFrete === 0 ? '#22C55E' : '#0052FF' }}>
                          {totalFrete === 0 ? 'Grátis' : formatPrice(totalFrete)}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 font-montserrat pt-2 border-t border-gray-200">
                        <span>Total Geral</span>
                        <span className="text-[#0052FF]">{formatPrice(totalComFrete)}</span>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        ))}
          </div>
        </div>
      </div>
    </>
  )
}
