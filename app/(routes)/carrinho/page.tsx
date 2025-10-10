"use client"

import { Button } from "@/components/ui/button"
import { CartGroupByStore } from "@/components/features/cart-group-by-store"
import { useCartStore, type CartItem } from "@/stores/cart-store"
import { Trash2, ShoppingBag, Download } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import { PageBackground } from "@/components/layout/page-background"

 export default function CarrinhoPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCartStore()
  const { toast } = useToast()
  
  console.log("🛒 [Zustand] Carrinho carregado com", cartItems.length, "itens:", cartItems)

  const generatePDF = () => {
    if (cartItems.length === 0) return

    const groupedItems = cartItems.reduce((groups, item) => {
      const storeId = item.storeId
      if (!groups[storeId]) {
        groups[storeId] = { storeNome: item.storeNome, items: [], subtotal: 0 }
      }
      groups[storeId].items.push(item)
      groups[storeId].subtotal += item.precoUnit * item.qty
      return groups
    }, {} as Record<string, { storeNome: string; items: CartItem[]; subtotal: number }>)

    const total = Object.values(groupedItems).reduce((sum, group) => sum + group.subtotal, 0)
    const date = new Date().toLocaleDateString('pt-BR')
    
    // Criar PDF
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.text('ORÇAMENTO DE MATERIAIS', 20, 30)
    
    doc.setFontSize(12)
    doc.text(`Data: ${date}`, 20, 45)
    doc.text(`Total de itens: ${cartItems.length}`, 20, 55)
    doc.text(`Lojas: ${Object.keys(groupedItems).length}`, 20, 65)
    
    let yPosition = 85
    
    Object.values(groupedItems).forEach(group => {
      // Store header
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(`${group.storeNome.toUpperCase()}`, 20, yPosition)
      yPosition += 10
      
      // Store items
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      group.items.forEach(item => {
        const itemTotal = item.precoUnit * item.qty
        doc.text(`• ${item.productNome}`, 25, yPosition)
        yPosition += 7
        doc.text(`  Qtd: ${item.qty} | Preço: R$ ${item.precoUnit.toFixed(2)} | Total: R$ ${itemTotal.toFixed(2)}`, 30, yPosition)
        yPosition += 12
      })
      
      // Subtotal
      doc.setFont('helvetica', 'bold')
      doc.text(`Subtotal: R$ ${group.subtotal.toFixed(2)}`, 25, yPosition)
      yPosition += 20
    })
    
    // Total geral
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`TOTAL GERAL: R$ ${total.toFixed(2)}`, 20, yPosition)
    
    // Baixar PDF
    doc.save(`Orcamento_${date.replace(/\//g, '-')}.pdf`)
  }

  const handleGenerateQuote = () => {
    console.log("🧾 Gerando orçamento com", cartItems.length, "itens")
    if (cartItems.length === 0) {
      toast({
        title: "⚠️ Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de gerar um orçamento.",
        variant: "destructive"
      })
      return
    }
    
    generatePDF()
    
    toast({
      title: "📄 PDF gerado!",
      description: `Orçamento PDF com ${cartItems.length} produtos foi baixado.`,
    })
  }

  return (
    <>
      <PageBackground />
      <div className="space-y-6 pt-4 px-4">
      {cartItems.length > 0 && (
        <div className="flex items-center justify-end">
          <div className="flex gap-2">
            <Button onClick={handleGenerateQuote} className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white">
              <Download className="h-4 w-4 mr-2" />
              Gerar PDF
            </Button>
            <Button variant="outline" onClick={clearCart}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Carrinho
            </Button>
          </div>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Seu carrinho está vazio</p>
          <Button asChild>
            <Link href="/explorar">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Explorar Produtos
            </Link>
          </Button>
        </div>
      ) : (
        <CartGroupByStore cartItems={cartItems} onUpdateQuantity={updateQuantity} onRemoveItem={removeFromCart} />
      )}
    </div>
    </>
  )
}
