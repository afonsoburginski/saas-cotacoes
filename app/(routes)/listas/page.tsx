"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useListsStore } from "@/stores/lists-store"
import { FileText, Trash2, Download, Calendar, Package } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { PageBackground } from "@/components/layout/page-background"
import { generatePdfFromElement } from "@/lib/pdf"
import { useSession } from "@/lib/auth-client"
import { mockStores } from "@/lib/mock-data"
import { useStores } from "@/hooks/use-stores"
import { calculateShippingCost, formatShippingInfo } from "@/lib/utils"

export default function ListasPage() {
  const { data: session } = useSession()
  const { lists, deleteList, duplicateList } = useListsStore()
  const { toast } = useToast()
  // Detalhes agora via Accordion; não precisamos mais de selectedList
  const [renderPdfDOM, setRenderPdfDOM] = useState(false)
  const pdfRef = useRef<HTMLDivElement | null>(null)
  const [pendingListForPdf, setPendingListForPdf] = useState<any | null>(null)
  const { data: storesData } = useStores()
  const stores = storesData?.data || []

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const handleExportPDF = async (list: any) => {
    // salvar lista alvo e ligar DOM oculto
    setPendingListForPdf(list)
    setRenderPdfDOM(true)
    await new Promise(r => setTimeout(r, 300))

    const el = pdfRef.current
    if (!el) return

    await generatePdfFromElement(el, {
      fileName: `Orcamento_${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.pdf`,
      width: 794,
      height: 1123,
      scale: 2,
      backgroundColor: '#ffffff'
    })
    setRenderPdfDOM(false)
    
    toast({ title: '✅ PDF gerado!', description: `Lista "${list.nome}" exportada.` })
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
                <div className="flex items-center gap-2">
                  <Button onClick={() => handleExportPDF(list)} size="sm" className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-montserrat">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(list.id, list.nome)}
                    className="text-red-600 hover:bg-red-50"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
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

                return (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700 font-montserrat">{formatDate(list.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700 font-montserrat">{list.items.length} itens</span>
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

              {/* Detalhes com Accordion */}
              {(() => {
                const groupedByStore = list.items.reduce((acc: any, item: any) => {
                  if (!acc[item.storeId]) acc[item.storeId] = { items: [], subtotal: 0, storeNome: item.storeNome }
                  acc[item.storeId].items.push(item)
                  acc[item.storeId].subtotal += item.precoUnit * item.qty
                  return acc
                }, {})
                let totalFrete = 0
                Object.entries(groupedByStore).forEach(([storeId, data]: [string, any]) => {
                  const store = mockStores.find(s => s.id === storeId)
                  if (store) totalFrete += calculateShippingCost(store.shippingPolicy, data.subtotal)
                })

                return (
                  <Accordion type="single" collapsible className="mt-2">
                    <AccordionItem value="detalhes">
                      <AccordionTrigger className="font-montserrat text-gray-700">Ver detalhes</AccordionTrigger>
                      <AccordionContent>
                        <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-bold text-gray-900 mb-3 font-marlin">Itens da Lista</h4>
                    <div className="space-y-2">
                      {list.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm py-1">
                          <div className="flex-1">
                            <span className="font-semibold text-gray-900 font-montserrat">{item.productNome}</span>
                                  <span className="text-gray-600 ml-2 font-montserrat">({item.storeNome}) x{item.qty}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                          <div className="border-t border-gray-200 pt-2 mt-3">
                            <div className="text-sm font-montserrat text-gray-700">Frete: {totalFrete === 0 ? 'Grátis' : 'Consultar'}</div>
                      </div>
                    </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )
              })()}
            </CardContent>
          </Card>
        ))}
          </div>
        </div>
        {/* DOM oculto para PDF com o mesmo layout do carrinho */}
        {renderPdfDOM && pendingListForPdf && (
          <div style={{ position: 'fixed', left: '-99999px', top: '0' }}>
            <div
              id="pdf-root"
              ref={pdfRef}
              style={{ width: '794px', height: '1123px', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'Arial, sans-serif', position: 'relative' }}
            >
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '32px 48px 0 48px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <p style={{ color: '#2563eb', fontWeight: '600', fontSize: '16px', margin: 0 }}>Data: {new Date().toLocaleDateString('pt-BR')}</p>
                      <div style={{ marginTop: '8px' }}>
                        <h3 style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '14px', margin: '0 0 4px 0' }}>Cliente:</h3>
                        <p style={{ fontWeight: 'bold', color: 'black', fontSize: '14px', margin: '0 0 2px 0' }}>{session?.user?.name || 'Cliente'}</p>
                        {(session?.user as any)?.phone && (
                          <p style={{ color: 'black', fontSize: '14px', margin: '0 0 2px 0' }}>{(session?.user as any)?.phone}</p>
                        )}
                        <p style={{ color: 'black', fontSize: '14px', margin: 0 }}>{(session?.user as any)?.address || 'Endereço não informado'}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginRight: '64px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <img src="/logo-pdf.png" alt="Orçanorte" style={{ height: '80px', width: 'auto', display: 'block' }} />
                      </div>
                      <div style={{ position: 'absolute', top: 0, right: '48px', width: '40px', height: '100px', backgroundColor: '#1e3a8a' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', height: '24px' }}>
                  <div style={{ width: '55%', height: '24px', backgroundColor: '#1e3a8a' }} />
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingLeft: '16px', paddingRight: '48px', height: '24px' }}>
                    <h1 style={{ color: '#2563eb', fontSize: '22px', fontWeight: 'normal', letterSpacing: '0.05em', margin: 0, lineHeight: 1, transform: 'translateY(-8px)' }}>
                      {(() => {
                        const raw = typeof window !== 'undefined' ? window.localStorage.getItem('lastCreatedOrderId') : null
                        const num = raw ? parseInt(raw, 10) : NaN
                        const formatted = Number.isFinite(num) ? String(num).padStart(5, '0') : String(Date.now()).slice(-5)
                        return `ORÇAMENTO #${formatted}`
                      })()}
                    </h1>
                  </div>
                </div>

                <div style={{ padding: '0 48px', flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '220px' }}>
                  <div style={{ marginTop: '8px' }}>
                    {Object.entries(pendingListForPdf.items.reduce((acc: any, item: any) => {
                      if (!acc[item.storeId]) acc[item.storeId] = { storeNome: item.storeNome, items: [] as any[] }
                      acc[item.storeId].items.push(item)
                      return acc
                    }, {} as Record<string, { storeNome: string; items: any[] }>)).map(([storeId, group]: any, idx: number) => {
                      const store = stores.find((s: any) => String(s.id) === String(storeId)) as any
                      const tipoRaw = (store?.tipo || store?.businessType || '').toString().toLowerCase()
                      const isServicoByStore = tipoRaw.includes('serv') || tipoRaw === 'prestador'
                      const isServicoByItems = group.items.some((it: any) => it.tipo === 'service' || !!it.serviceId)
                      const isServico = isServicoByStore || isServicoByItems
                      return (
                        <div key={storeId} style={{ marginBottom: '16px' }}>
                          <h3 style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '16px', marginBottom: '8px', marginTop: idx > 0 ? '16px' : '0' }}>
                            {isServico ? 'Prestador:' : 'Comércio:'}
                          </h3>
                          <p style={{ fontWeight: 'bold', color: 'black', fontSize: '16px', marginBottom: '2px', marginTop: 0 }}>{group.storeNome}</p>
                          {store?.telefone && <p style={{ color: 'black', fontSize: '16px', marginBottom: '2px', marginTop: 0 }}>{store.telefone}</p>}
                          {store?.endereco && <p style={{ color: 'black', fontSize: '16px', marginBottom: '14px', marginTop: 0 }}>{store.endereco}</p>}

                          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#f3f4f6' }}>
                                <th style={{ paddingTop: 0, paddingBottom: '6px', paddingLeft: '8px', paddingRight: '8px', border: '1px solid #e5e7eb', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', lineHeight: '11px', verticalAlign: 'top', transform: 'translateY(-1px)' }}>Item</th>
                                <th style={{ paddingTop: 0, paddingBottom: '6px', paddingLeft: '8px', paddingRight: '8px', border: '1px solid #e5e7eb', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', lineHeight: '11px', verticalAlign: 'top', width: '80px', transform: 'translateY(-1px)' }}>Qtd</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.items.map((item: any, itemIdx: number) => (
                                <tr key={itemIdx}>
                                  <td style={{ paddingTop: 0, paddingBottom: '6px', paddingLeft: '8px', paddingRight: '8px', border: '1px solid #e5e7eb', fontSize: '12px', lineHeight: '11px', verticalAlign: 'top', transform: 'translateY(-1px)' }}>{item.productNome}</td>
                                  <td style={{ paddingTop: 0, paddingBottom: '6px', paddingLeft: '8px', paddingRight: '8px', border: '1px solid #e5e7eb', fontSize: '12px', lineHeight: '11px', verticalAlign: 'top', transform: 'translateY(-1px)' }}>{item.qty}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    })}
                  </div>

                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%' }}>
                    <div style={{ paddingLeft: '48px', paddingRight: '48px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                        <div style={{ backgroundColor: '#1e3a8a', color: 'white', paddingTop: 0, paddingBottom: '12px', paddingLeft: '40px', paddingRight: '40px', fontWeight: 'bold', fontSize: '20px', letterSpacing: '0.05em', lineHeight: '20px' }}>
                          ORÇAMENTO ENVIADO
                        </div>
                      </div>
                      <div style={{ width: '128px', height: '3px', backgroundColor: '#1e3a8a', marginBottom: '12px' }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', marginBottom: '12px' }}>
                        <div>
                          <h3 style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '16px', marginBottom: '6px', marginTop: 0 }}>FORMA DE PAGAMENTO</h3>
                          <p style={{ fontSize: '14px', color: 'black', margin: '0 0 4px 0' }}>Pix com 10% de desconto</p>
                          <p style={{ fontSize: '14px', color: 'black', margin: 0 }}>ou 2x no cartão de crédito</p>
                        </div>
                        <div>
                          <h3 style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '16px', marginBottom: '6px', marginTop: 0 }}>TERMOS E CONDIÇÕES</h3>
                          <p style={{ fontSize: '14px', color: 'black', margin: 0 }}>Este orçamento é válido por 30 dias.</p>
                        </div>
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#1e3a8a', color: 'white', paddingTop: '6px', paddingBottom: '14px', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', lineHeight: '16px', paddingLeft: '48px', paddingRight: '48px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span>☎</span><span>(66) 9 9661-4628</span></span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span>✉</span><span>orcanorte28@gmail.com</span></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span>●</span><span>www.orcanorte.com.br</span></span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}><span>@</span><span>orcanorte</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
