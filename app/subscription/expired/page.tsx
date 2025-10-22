"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle, CreditCard, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function SubscriptionExpiredPage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="p-8 md:p-12">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 relative">
              <Image src="/logo.png" alt="Orça Norte" fill className="object-contain" />
            </div>
          </div>

          {/* Alert Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
          </motion.div>

          {/* Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3 font-marlin">
              Assinatura Inativa
            </h1>
            <p className="text-lg text-gray-600 mb-2 font-montserrat">
              Sua assinatura expirou ou foi cancelada.
            </p>
            <p className="text-sm text-gray-500 font-montserrat">
              Renove agora para continuar recebendo cotações e gerenciando seu catálogo.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/checkout')}
              className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <CreditCard className="mr-2 w-5 h-5" />
              Renovar Assinatura
            </Button>
            
            <Link href="/">
              <Button
                variant="outline"
                className="w-full h-12 text-lg font-semibold"
                size="lg"
              >
                <ArrowLeft className="mr-2 w-5 h-5" />
                Voltar para Home
              </Button>
            </Link>
          </div>

          {/* Support */}
          <p className="text-xs text-gray-400 text-center mt-6">
            Precisa de ajuda? Entre em contato com nosso suporte.
          </p>
        </Card>
      </motion.div>
    </div>
  )
}

