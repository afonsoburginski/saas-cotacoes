"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useSession } from "@/lib/auth-client"

export default function LoadingStorePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [status, setStatus] = useState('Aguardando confirmação do pagamento...')

  useEffect(() => {
    const checkStore = async () => {
      // Verificar se usuário está logado
      if (!session?.user) {
        setStatus('Redirecionando para login...')
        setTimeout(() => {
          router.push('/')
        }, 2000)
        return
      }

      // Tentar buscar a loja várias vezes
      let attempts = 0
      const maxAttempts = 10
      
      const fetchStore = async () => {
        try {
          const res = await fetch('/api/user/store')
          const data = await res.json()
          
          if (res.ok && data.slug) {
            setStatus('Loja encontrada! Redirecionando...')
            router.push(`/loja/${data.slug}/catalogo`)
            return
          }
          
          attempts++
          if (attempts < maxAttempts) {
            setStatus(`Aguardando loja... (${attempts}/${maxAttempts})`)
            setTimeout(fetchStore, 3000)
          } else {
            setStatus('Loja não encontrada. Você precisa completar o pagamento primeiro.')
            setTimeout(() => {
              router.push('/')
            }, 3000)
          }
        } catch (err) {
          console.error('Erro ao buscar loja:', err)
          attempts++
          if (attempts < maxAttempts) {
            setTimeout(fetchStore, 3000)
          }
        }
      }
      
      fetchStore()
    }

    checkStore()
  }, [session, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <Loader2 className="h-16 w-16 animate-spin mx-auto mb-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Preparando sua loja...
        </h2>
        <p className="text-gray-600 mb-2">
          {status}
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Isso pode levar alguns segundos enquanto processamos seu pagamento.
        </p>
      </div>
    </div>
  )
}
