"use client"

import { useState } from "react"
import { useCartStore, type CartItem } from "@/stores/cart-store"
import { useToast } from "@/hooks/use-toast"
import { useListsStore } from "@/stores/lists-store"
import { useRouter } from "next/navigation"
import jsPDF from "jspdf"
import { PageBackground } from "@/components/layout/page-background"
import { CarrinhoAdaptive } from "@/components/carrinho"
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

 export default function CarrinhoPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCartStore()
  const createList = useListsStore((state) => state.createList)
  const router = useRouter()
  const { toast } = useToast()
  const [showQuoteDialog, setShowQuoteDialog] = useState(false)
  
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

  const handleSendQuote = () => {
    if (cartItems.length === 0) {
      toast({
        title: "⚠️ Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de enviar um orçamento.",
        variant: "destructive"
      })
      return
    }

    setShowQuoteDialog(true)
  }

  const confirmSendQuote = () => {
    const listName = `Orçamento - ${new Date().toLocaleDateString('pt-BR')}`
    createList(listName, cartItems, `Orçamento enviado com ${cartItems.length} produtos`)
    
    setShowQuoteDialog(false)
    
    toast({
      title: "✅ Orçamento enviado!",
      description: "Seu orçamento foi enviado. As lojas entrarão em contato em breve.",
    })

    // Limpar carrinho após 1 segundo
    setTimeout(() => {
      clearCart()
      router.push('/listas')
    }, 1500)
  }

  return (
    <>
      <PageBackground />
      <CarrinhoAdaptive
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onGeneratePDF={handleGenerateQuote}
        onGenerateList={handleSendQuote}
      />

      <AlertDialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <AlertDialogContent className="font-montserrat">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-marlin text-xl">Enviar Orçamento</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Seu orçamento será enviado para cotação. As lojas receberão sua solicitação e entrarão em contato em breve com as melhores ofertas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-montserrat">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmSendQuote}
              className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-montserrat"
            >
              Confirmar Envio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
