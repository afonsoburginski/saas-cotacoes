"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useCartStore, type CartItem } from "@/stores/cart-store"
import { useToast } from "@/hooks/use-toast"
import { useListsStore } from "@/stores/lists-store"
import { useRouter } from "next/navigation"
import { useStores } from "@/hooks/use-stores"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
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
  const pdfRef = useRef<HTMLDivElement | null>(null)
  const [renderPdfDOM, setRenderPdfDOM] = useState(false)
  
  console.log("🛒 [Zustand] Carrinho carregado com", cartItems.length, "itens:", cartItems)

  const groupedForPdf = useMemo(() => {
    return cartItems.reduce((groups, item) => {
      const storeId = item.storeId
      if (!groups[storeId]) {
        groups[storeId] = { storeNome: item.storeNome, items: [] as CartItem[] }
      }
      groups[storeId].items.push(item)
      return groups
    }, {} as Record<string, { storeNome: string; items: CartItem[] }>)
  }, [cartItems])

  const totalItems = useMemo(() => cartItems.reduce((acc, it) => acc + it.qty, 0), [cartItems])

  const generatePDF = async () => {
    if (cartItems.length === 0) return
    // Render DOM escondido com o template idêntico ao modelo
    setRenderPdfDOM(true)
    // aguarda layout
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    const el = pdfRef.current
    if (!el) return

    // Captura com html2canvas para manter o layout 1:1 (A4)
    const canvas = await html2canvas(el, { 
      scale: 2, 
      useCORS: true, 
      backgroundColor: '#ffffff',
      onclone: (doc) => {
        // Garante fundo branco e remove backgrounds com oklch do clone
        try {
          doc.body.style.background = '#ffffff'
          // Isola estilos externos no root do PDF
          const root = doc.getElementById('pdf-root') as HTMLElement | null
          if (root) {
            ;(root.style as any).setProperty('all', 'initial')
            root.style.backgroundColor = '#ffffff'
            root.style.color = '#111827'
            root.style.fontFamily = 'Inter, Arial, sans-serif'
          }
          const all = Array.from((root || doc).querySelectorAll('*')) as HTMLElement[]
          for (const node of all) {
            const cs = doc.defaultView?.getComputedStyle(node)
            const bg = cs?.background || ''
            const bgc = cs?.backgroundColor || ''
            const bgi = cs?.backgroundImage || ''
            if (bg.includes('oklch') || bgc.includes('oklch') || bgi.includes('oklch')) {
              node.style.background = 'transparent'
              node.style.backgroundColor = 'transparent'
              node.style.backgroundImage = 'none'
            }
            // Também neutraliza gradientes
            if ((bgi || '').includes('gradient(')) {
              node.style.backgroundImage = 'none'
            }
            const col = cs?.color || ''
            if (col.includes('oklch')) {
              node.style.color = '#111827'
            }
          }
        } catch {}
      }
    })
    // Usa JPEG para evitar erros de assinatura PNG e reduzir tamanho
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = 210
    const pageHeight = 297
    const cWidth = Math.max(1, canvas.width)
    const cHeight = Math.max(1, canvas.height)
    // escala para caber na página usando largura
    let imgWidth = pageWidth
    let imgHeight = (cHeight * imgWidth) / cWidth
    // se exceder altura, ajusta pela altura
    if (!isFinite(imgHeight) || imgHeight <= 0 || imgHeight > pageHeight) {
      imgHeight = pageHeight
      imgWidth = (cWidth * imgHeight) / cHeight
    }
    pdf.addImage(imgData, 'JPEG', 0, 0, Number(imgWidth), Number(imgHeight))
    pdf.save(`Orcamento_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`)
    setRenderPdfDOM(false)
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
      {/* DOM oculto para render do PDF no modelo do V0 */}
      {renderPdfDOM && (
        <div style={{ position: 'fixed', left: -99999, top: 0, width: '794px', height: '1123px', overflow: 'hidden', visibility: 'hidden' }}>
          <div
            id="pdf-root"
            ref={pdfRef}
            style={{ width: '794px', height: '1123px', backgroundColor: 'white', color: '#111827', fontFamily: 'Inter, Arial, sans-serif', ['all' as any]: 'initial' }}
          >
            {/* Modelo baseado em components/pdf/index.tsx, com dados dinâmicos */}
            <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '64px 48px 0 48px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <p style={{ color: '#2563eb', fontWeight: 600, fontSize: 16 }}>Data: {new Date().toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginRight: '64px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold', lineHeight: 1 }}>
                        <span style={{ color: '#16a34a' }}>Orça</span>
                        <span style={{ color: '#2563eb' }}>norte</span>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', top: 0, right: '48px', width: 40, height: 100, backgroundColor: '#1e3a8a' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
                <div style={{ width: '55%', height: 24, backgroundColor: '#1e3a8a' }} />
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', paddingLeft: 16, paddingRight: 48 }}>
                  <h1 style={{ color: '#2563eb', fontSize: 22, fontWeight: 'normal', fontFamily: 'sans-serif', letterSpacing: '0.05em' }}>
                    ORÇAMENTO #01234
                  </h1>
                </div>
              </div>

              <div style={{ padding: '0 48px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>A/C:</h3>
                  <p style={{ fontWeight: 'bold', color: 'black', fontSize: 16, marginBottom: 2 }}>{session?.user?.name || 'Cliente'}</p>
                  <p style={{ color: 'black', fontSize: 16, marginBottom: 2 }}>{session?.user?.email || ''}</p>
                </div>

                {/* Lista de itens por loja */}
                <div style={{ flex: 1 }} />

                {/* Total + separador + pagamentos/termos + rodapé idêntico ao modelo */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 64 }}>
                  <div style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '10px 40px', fontWeight: 'bold', fontSize: 20, letterSpacing: '0.05em' }}>
                    TOTAL: R$ 0,00
                  </div>
                </div>

                <div style={{ width: 128, height: 3, backgroundColor: '#1e3a8a', marginBottom: 16 }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, marginBottom: 32 }}>
                  <div>
                    <h3 style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>FORMA DE PAGAMENTO</h3>
                    <p style={{ fontSize: 14, color: 'black', lineHeight: 1.625 }}>Pix com 10% de desconto</p>
                    <p style={{ fontSize: 14, color: 'black', lineHeight: 1.625 }}>ou 2x no cartão de crédito</p>
                  </div>
                  <div>
                    <h3 style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>TERMOS E CONDIÇÕES</h3>
                    <p style={{ fontSize: 14, color: 'black', lineHeight: 1.625 }}>Este orçamento é válido por 30 dias.</p>
                  </div>
                </div>

                <div style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '12px 48px', marginBottom: 88 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>📱</span>
                        <span>(66) 9 9661-4628</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>✉️</span>
                        <span>orcanorte28@gmail.com</span>
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>🌐</span>
                        <span>www.orcanorte.com.br</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>📷</span>
                        <span>@orcanorte</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
