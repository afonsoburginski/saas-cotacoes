"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useCartStore, type CartItem } from "@/stores/cart-store"
import { useToast } from "@/hooks/use-toast"
import { useListsStore } from "@/stores/lists-store"
import { useRouter } from "next/navigation"
import { useStores } from "@/hooks/use-stores"
  // PDF removido desta página (cart)
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
  // PDF removido desta página (geração acontece nas listas)
  const pdfRef = useRef<HTMLDivElement | null>(null)
  const [orderNumber] = useState<number | null>(null)
  
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

  // Removido: geração de PDF no carrinho (fluxo agora: criar orçamento -> ver na lista e baixar PDF lá)

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
        try {
          const createdId = result?.data?.id ?? result?.id
          if (createdId && typeof window !== 'undefined' && !localStorage.getItem('lastCreatedOrderId')) {
            localStorage.setItem('lastCreatedOrderId', String(createdId))
          }
        } catch {}
        return result
      })

      const orderResults = await Promise.all(orderPromises)

      try {
        const createdIds = orderResults
          .map((r: any) => (r?.data?.id ?? r?.id))
          .filter((v: any) => typeof v === 'number') as number[]
        if (createdIds.length && typeof window !== 'undefined') {
          const maxId = Math.max(...createdIds)
          window.localStorage.setItem('lastCreatedOrderId', String(maxId))
        }
      } catch {}

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
      
      {/* Loading de PDF removido nesta página */}
      
      {/* PDF removido no carrinho */}
      {false && (
        <div style={{ position: 'fixed', left: '-99999px', top: '0' }}>
          <div
            id="pdf-root"
            ref={pdfRef}
            style={{ 
              width: '794px', 
              height: '1123px', 
              backgroundColor: '#ffffff', 
              color: '#000000', 
              fontFamily: 'Arial, sans-serif',
              margin: '0',
              padding: '0',
              position: 'relative'
            }}
          >
            {/* Template baseado em components/pdf/page.tsx */}
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div style={{ padding: '32px 48px 0 48px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <p style={{ color: '#2563eb', fontWeight: '600', fontSize: '16px', margin: '0' }}>Data: {new Date().toLocaleDateString('pt-BR')}</p>
                    <div style={{ marginTop: '8px' }}>
                      <h3 style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '14px', margin: '0 0 4px 0' }}>Cliente:</h3>
                      <p style={{ fontWeight: 'bold', color: 'black', fontSize: '14px', margin: '0 0 2px 0' }}>{session?.user?.name || 'Cliente'}</p>
                      {(session?.user as any)?.phone && (
                        <p style={{ color: 'black', fontSize: '14px', margin: '0 0 2px 0' }}>{(session?.user as any)?.phone}</p>
                      )}
                      <p style={{ color: 'black', fontSize: '14px', margin: '0' }}>{(session?.user as any)?.address || 'Endereço não informado'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginRight: '64px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <img 
                        src="/logo-pdf.png" 
                        alt="Orçanorte" 
                        style={{ height: '80px', width: 'auto', display: 'block' }}
                      />
                    </div>
                    <div style={{ position: 'absolute', top: '0', right: '48px', width: '40px', height: '100px', backgroundColor: '#1e3a8a' }} />
                  </div>
                </div>
              </div>

              {/* Barra com ORÇAMENTO */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', height: '24px' }}>
                <div style={{ width: '55%', height: '24px', backgroundColor: '#1e3a8a' }} />
                <div style={{ flex: '1', display: 'flex', alignItems: 'center', paddingLeft: '16px', paddingRight: '48px', height: '24px' }}>
                  <h1 style={{ color: '#2563eb', fontSize: '22px', fontWeight: 'normal', letterSpacing: '0.05em', margin: '0', lineHeight: '1', transform: 'translateY(-8px)' }}>
                    ORÇAMENTO #{orderNumber ?? String(Date.now()).slice(-5)}
                  </h1>
                </div>
              </div>

              {/* Conteúdo principal */}
              <div style={{ padding: '0 48px', flex: '1', display: 'flex', flexDirection: 'column', paddingBottom: '220px' }}>

                {/* Seção de Fornecedores - TODAS as empresas separadamente */}
                <div style={{ marginTop: '8px' }}>
                  {Object.entries(groupedForPdf).map(([storeId, group], groupIdx) => {
                    const store = stores.find(s => s.id.toString() === storeId)
                    const tipoRaw = (store as any)?.tipo || (store as any)?.businessType || ''
                    const tipo = typeof tipoRaw === 'string' ? tipoRaw.toLowerCase() : ''
                    const isServico = group.items.some((it: any) => it.tipo === 'service' || !!it.serviceId) || tipo.includes('serv') || tipo === 'prestador'
                    return (
                      <div key={storeId} style={{ marginBottom: '16px' }}>
                        {/* Título e informações da Loja - MESMO FORMATO do Prestador */}
                        <h3 style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '16px', marginBottom: '8px', marginTop: groupIdx > 0 ? '16px' : '0' }}>
                          {isServico ? 'Prestador:' : 'Comércio:'}
                        </h3>
                        <p style={{ fontWeight: 'bold', color: 'black', fontSize: '16px', marginBottom: '2px', marginTop: '0' }}>
                          {group.storeNome}
                        </p>
                        {(store as any)?.telefone && (
                          <p style={{ color: 'black', fontSize: '16px', marginBottom: '2px', marginTop: '0' }}>
                            {(store as any).telefone}
                          </p>
                        )}
                        {(store as any)?.endereco && (
                          <p style={{ color: 'black', fontSize: '16px', marginBottom: '14px', marginTop: '0' }}>
                            {(store as any).endereco}
                          </p>
                        )}

                        {/* Tabela de produtos desta loja */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f3f4f6' }}>
                              <th style={{ paddingTop: '0px', paddingBottom: '6px', paddingLeft: '8px', paddingRight: '8px', border: '1px solid #e5e7eb', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', lineHeight: '11px', verticalAlign: 'top', transform: 'translateY(-1px)' }}>Item</th>
                              <th style={{ paddingTop: '0px', paddingBottom: '6px', paddingLeft: '8px', paddingRight: '8px', border: '1px solid #e5e7eb', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', lineHeight: '11px', verticalAlign: 'top', width: '80px', transform: 'translateY(-1px)' }}>Qtd</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.items.map((item, itemIdx) => (
                            <tr key={itemIdx}>
                                <td style={{ paddingTop: '0px', paddingBottom: '6px', paddingLeft: '8px', paddingRight: '8px', border: '1px solid #e5e7eb', fontSize: '12px', lineHeight: '11px', verticalAlign: 'top', transform: 'translateY(-1px)' }}>{item.productNome}</td>
                                <td style={{ paddingTop: '0px', paddingBottom: '6px', paddingLeft: '8px', paddingRight: '8px', border: '1px solid #e5e7eb', fontSize: '12px', lineHeight: '11px', verticalAlign: 'top', transform: 'translateY(-1px)' }}>{item.qty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    )
                  })}
                </div>

                {/* Área inferior fixa de largura total */}
                <div style={{ position: 'absolute', left: '0', right: '0', bottom: '0', width: '100%' }}>
                  {/* Bloco interno alinhado ao conteúdo */}
                  <div style={{ paddingLeft: '48px', paddingRight: '48px' }}>
                    {/* Status do Orçamento */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                      <div style={{ backgroundColor: '#1e3a8a', color: 'white', paddingTop: '0px', paddingBottom: '12px', paddingLeft: '40px', paddingRight: '40px', fontWeight: 'bold', fontSize: '20px', letterSpacing: '0.05em', lineHeight: '20px' }}>
                        ORÇAMENTO ENVIADO
                  </div>
                </div>

                {/* Linha separadora */}
                    <div style={{ width: '128px', height: '3px', backgroundColor: '#1e3a8a', marginBottom: '12px' }} />

                {/* Forma de pagamento e termos */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', marginBottom: '12px' }}>
                  <div>
                        <h3 style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '16px', marginBottom: '6px', marginTop: '0' }}>
                      FORMA DE PAGAMENTO
                    </h3>
                        <p style={{ fontSize: '14px', color: 'black', margin: '0 0 4px 0' }}>Pix com 10% de desconto</p>
                        <p style={{ fontSize: '14px', color: 'black', margin: '0' }}>ou 2x no cartão de crédito</p>
                  </div>
                  <div>
                        <h3 style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '16px', marginBottom: '6px', marginTop: '0' }}>
                      TERMOS E CONDIÇÕES
                    </h3>
                        <p style={{ fontSize: '14px', color: 'black', margin: '0' }}>
                      Este orçamento é válido por 30 dias.
                    </p>
                  </div>
                </div>
              </div>

                  {/* Footer de largura total */}
                  <div style={{ backgroundColor: '#1e3a8a', color: 'white', paddingTop: '6px', paddingBottom: '14px', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', lineHeight: '16px', paddingLeft: '48px', paddingRight: '48px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span>☎</span>
                      <span>(66) 9 9661-4628</span>
                    </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span>✉</span>
                      <span>orcanorte28@gmail.com</span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span>●</span>
                      <span>www.orcanorte.com.br</span>
                    </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          <span>@</span>
                          <span>orcanorte</span>
                    </span>
                      </div>
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
