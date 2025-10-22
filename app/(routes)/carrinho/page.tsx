"use client"

import { useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useCartStore, type CartItem } from "@/stores/cart-store"
import { useToast } from "@/hooks/use-toast"
import { useListsStore } from "@/stores/lists-store"
import { useRouter } from "next/navigation"
import { useStores } from "@/hooks/use-stores"
import jsPDF from "jspdf"
import { PageBackground } from "@/components/layout/page-background"
import { CarrinhoAdaptive } from "@/components/carrinho"
import { LoginRequiredDialog } from "@/components/explorar/login-required-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  const { data: session } = useSession()
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCartStore()
  const createList = useListsStore((state) => state.createList)
  const router = useRouter()
  const { toast } = useToast()
  const [showQuoteDialog, setShowQuoteDialog] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showPhoneDialog, setShowPhoneDialog] = useState(false)
  const [customerPhone, setCustomerPhone] = useState("")
  const { data: storesData } = useStores()
  const stores = storesData?.data || []
  
  console.log("🛒 [Zustand] Carrinho carregado com", cartItems.length, "itens:", cartItems)

  const generatePDF = () => {
    if (cartItems.length === 0) return

    const groupedItems = cartItems.reduce((groups, item) => {
      const storeId = item.storeId
      if (!groups[storeId]) {
        groups[storeId] = { storeNome: item.storeNome, items: [] }
      }
      groups[storeId].items.push(item)
      return groups
    }, {} as Record<string, { storeNome: string; items: CartItem[] }>)

    const date = new Date().toLocaleDateString('pt-BR')
    
    // Criar PDF
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.text('SOLICITACAO DE ORCAMENTO', 20, 30)
    
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
        doc.text(`• ${item.productNome}`, 25, yPosition)
        yPosition += 7
        doc.text(`  Quantidade: ${item.qty}`, 30, yPosition)
        yPosition += 12
      })
      
      yPosition += 10
    })
    
    // Footer note
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.text('Precos e valores serao informados apos analise do orcamento pelas lojas.', 20, yPosition)
    
    // Baixar PDF
    doc.save(`Solicitacao-Orcamento_${date.replace(/\//g, '-')}.pdf`)
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

  const handleSendQuote = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "⚠️ Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de enviar um orçamento.",
        variant: "destructive"
      })
      return
    }
    
    // 🔐 Validar login antes de gerar orçamento
    if (!session?.user) {
      console.log('⚠️ Usuário não logado - pedindo login')
      setShowLoginDialog(true)
      return
    }

    // 📱 Verificar se o usuário tem telefone cadastrado
    // Como o tipo do session não inclui phone, vamos buscar do banco
    try {
      const userRes = await fetch('/api/user/profile')
      if (userRes.ok) {
        const userData = await userRes.json()
        const userPhone = userData.data?.phone
        if (!userPhone || userPhone.trim() === '') {
          console.log('📱 Usuário sem telefone - pedindo para informar')
          setShowPhoneDialog(true)
          return
        }
      }
    } catch (error) {
      console.log('📱 Erro ao verificar telefone - pedindo para informar')
      setShowPhoneDialog(true)
      return
    }

    setShowQuoteDialog(true)
  }

  const handlePhoneSubmit = async () => {
    if (!customerPhone.trim()) {
      toast({
        title: "⚠️ Telefone obrigatório",
        description: "Por favor, informe seu número de telefone para continuar.",
        variant: "destructive"
      })
      return
    }

    try {
      // Atualizar o telefone do usuário no banco de dados
      const res = await fetch('/api/user/update-phone', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: customerPhone })
      })

      if (!res.ok) {
        throw new Error('Erro ao atualizar telefone')
      }

      // Atualizar a sessão local (não é necessário, pois será refetchada)
      // A sessão será atualizada automaticamente no próximo login

      setShowPhoneDialog(false)
      setCustomerPhone("")
      
      toast({
        title: "✅ Telefone atualizado!",
        description: "Seu número foi cadastrado com sucesso.",
      })

      // Continuar com o envio do orçamento
      setShowQuoteDialog(true)

    } catch (error) {
      console.error('❌ Erro ao atualizar telefone:', error)
      toast({
        title: "❌ Erro ao salvar telefone",
        description: "Não foi possível salvar seu número. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  const confirmSendQuote = async () => {
    try {
      // Agrupar itens por loja
      const groupedByStore = cartItems.reduce((groups, item) => {
        const storeId = item.storeId
        if (!groups[storeId]) {
          groups[storeId] = { 
            storeId, 
            storeNome: item.storeNome, 
            items: [], 
            total: 0 
          }
        }
        groups[storeId].items.push(item)
        groups[storeId].total += item.precoUnit * item.qty
        return groups
      }, {} as Record<string, { storeId: string; storeNome: string; items: any[]; total: number }>)

      // Criar pedido/cotação para cada loja
      const orderPromises = Object.values(groupedByStore).map(async (group) => {
        const orderData = {
          storeId: group.storeId,
          customerName: session?.user?.name || 'Cliente',
          customerEmail: session?.user?.email || '',
          items: group.items.map(item => ({
            productId: item.productId || null,
            serviceId: item.serviceId || null,
            tipo: item.tipo, // CAMPO CRÍTICO QUE ESTAVA FALTANDO!
            qty: item.qty,
            precoUnit: item.precoUnit,
            productNome: item.productNome, // Nome do produto/serviço
            observacoes: item.observacoes || null,
          })),
          total: group.total,
          notes: `Orçamento enviado via Orça Norte - ${new Date().toLocaleDateString('pt-BR')}`
        }

        console.log('📤 Enviando pedido para loja:', group.storeNome, orderData)
      console.log(`🏪 Loja: ${group.storeNome} | Itens: ${group.items.length} | Total: R$ ${group.total}`)

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        })

        if (!res.ok) {
          const errorText = await res.text()
          console.error('❌ Erro na resposta:', res.status, errorText)
          throw new Error(`Erro ao enviar orçamento para ${group.storeNome}: ${res.status}`)
        }

        const result = await res.json()
        console.log('✅ Pedido criado com sucesso:', result)
        return result
      })

      await Promise.all(orderPromises)

      // Criar lista local também
      const listName = `Orçamento - ${new Date().toLocaleDateString('pt-BR')}`
      createList(listName, cartItems, `Orçamento enviado com ${cartItems.length} produtos`)
      
      setShowQuoteDialog(false)
      
      toast({
        title: "✅ Orçamento enviado!",
        description: `Seu orçamento foi enviado para ${Object.keys(groupedByStore).length} loja(s). Elas entrarão em contato em breve.`,
      })

      // Limpar carrinho após 1 segundo
      setTimeout(() => {
        clearCart()
        router.push('/listas')
      }, 1500)

    } catch (error) {
      console.error('❌ Erro ao enviar orçamento:', error)
      toast({
        title: "❌ Erro ao enviar orçamento",
        description: error instanceof Error ? error.message : "Não foi possível enviar o orçamento. Tente novamente.",
        variant: "destructive"
      })
    }
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
        stores={stores}
      />

      <AlertDialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <AlertDialogContent className="font-montserrat">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-marlin text-xl">Gerar Orçamento</AlertDialogTitle>
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
      
      {/* Dialog de Login Necessário */}
      <LoginRequiredDialog 
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        action="lista"
      />

      {/* Dialog para solicitar telefone */}
      <AlertDialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
        <AlertDialogContent className="font-montserrat">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-marlin text-xl">📱 Número de Telefone</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Para que as lojas possam entrar em contato com você sobre o orçamento, precisamos do seu número de telefone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Número de Telefone *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="mt-2"
              maxLength={15}
            />
            <p className="text-xs text-gray-500 mt-1">
              Inclua o DDD. Exemplo: (11) 99999-9999
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="font-montserrat">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePhoneSubmit}
              className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-montserrat"
            >
              Salvar e Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
