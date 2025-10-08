"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useListsStore } from "@/stores/lists-store"
import { FileText, MoreHorizontal, Eye, Copy, Share2, Trash2, Download, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { PageBackground } from "@/components/layout/page-background"

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

  const handleShare = (listId: string, listName: string) => {
    // Simulate sharing functionality
    navigator.clipboard.writeText(`${window.location.origin}/listas/${listId}`)
    toast({
      title: "Link copiado!",
      description: `Link da lista "${listName}" copiado para a área de transferência.`,
    })
  }

  const handleExport = (listName: string) => {
    // Simulate PDF export
    toast({
      title: "Exportando PDF...",
      description: `A lista "${listName}" está sendo preparada para download.`,
    })
  }

  const handleDuplicate = (listId: string, listName: string) => {
    duplicateList(listId)
    toast({
      title: "Lista duplicada!",
      description: `Uma cópia de "${listName}" foi criada.`,
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
        <div className="space-y-6">

        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Nenhuma lista de compras encontrada</p>
          <Button asChild>
            <Link href="/explorar">Explorar Produtos</Link>
          </Button>
        </div>
      </div>
      </>
    )
  }

  return (
    <>
      <PageBackground />
      <div className="space-y-6">

      <div className="grid gap-4">
        {lists.map((list) => (
          <Card key={list.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {list.nome}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSelectedList(list.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(list.id, list.nome)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare(list.id, list.nome)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport(list.nome)}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(list.id, list.nome)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(list.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{list.items.length} itens</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{formatPrice(list.totalEstimado)}</span>
                </div>
              </div>

              {list.observacoes && (
                <div className="mb-4">
                  <Badge variant="outline" className="text-xs">
                    {list.observacoes}
                  </Badge>
                </div>
              )}

              {selectedList === list.id && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-3">Itens da Lista</h4>
                  <div className="space-y-2">
                    {list.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm py-1">
                        <div className="flex-1">
                          <span className="font-medium">{item.productNome}</span>
                          <span className="text-muted-foreground ml-2">
                            ({item.storeNome}) x{item.qty}
                          </span>
                        </div>
                        <div className="font-medium">{formatPrice(item.precoUnit * item.qty)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatPrice(list.totalEstimado)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </>
  )
}
