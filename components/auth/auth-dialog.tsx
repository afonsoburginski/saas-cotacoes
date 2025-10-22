"use client"

import { GoogleLoginButton } from "./google-login-button"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import Image from "next/image"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: 'login' | 'register'
  selectedPlan?: string | null // Plano pré-selecionado na landing
}

export function AuthDialog({ open, onOpenChange, mode = 'login', selectedPlan }: AuthDialogProps) {
  const router = useRouter()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true)
    
    try {
      // Detectar de onde veio o login
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'
      
      let callbackURL: string
      
      if (selectedPlan) {
        // Pricing section - vai direto pro Stripe
        callbackURL = `/api/auth-callback?plan=${selectedPlan}`
      } else if (currentPath.startsWith('/explorar') || currentPath.startsWith('/fornecedor') || currentPath.startsWith('/categoria')) {
        // Páginas públicas - usuário consumidor
        callbackURL = "/api/auth-callback-consumer"
      } else {
        // Landing - usuário empresa
        callbackURL = "/api/auth-callback-checkout"
      }
      
      console.log('🔐 Login iniciado. Path:', currentPath, 'Plano:', selectedPlan || 'nenhum', 'Callback:', callbackURL)
      
      await authClient.signIn.social({
        provider: "google",
        callbackURL,
      })
      
      onOpenChange(false)
    } catch (error) {
      console.error('Erro na autenticação:', error)
      setIsGoogleLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1a1f2e] border-0 text-white">
        <DialogHeader className="text-center space-y-6 flex flex-col items-center">
          {/* Logo do Orça Norte */}
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 relative">
              <Image
                src="/logo.png"
                alt="Orça Norte"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div className="space-y-3 text-center">
            <DialogTitle className="text-2xl font-bold text-white text-center">
              Entrar no Orça Norte
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-sm leading-relaxed text-center max-w-sm mx-auto">
              Para clientes, lojas e prestadores de serviço.<br />
              Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full flex justify-center"
          >
            <Button
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              className="w-full h-12 bg-[#f8f9fa] hover:bg-gray-100 text-gray-700 border-0 rounded-lg font-medium flex items-center justify-center"
              size="lg"
            >
              {isGoogleLoading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Conectando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continuar com Google</span>
                </div>
              )}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
