"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    console.log('🔐 Callback detectado, redirecionando de volta...')
    
    if (sessionId) {
      router.replace(`/checkout/stripe-success?session_id=${sessionId}`)
    } else {
      router.replace('/checkout/stripe-success?session_id=authenticated')
    }
  }, [searchParams, router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Finalizando login...</p>
      </div>
    </div>
  )
}

