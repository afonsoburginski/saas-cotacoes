"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { User, Building2, ArrowRight, Check } from "lucide-react"

export type OnboardingType = "consumidor" | "fornecedor" | null

interface OnboardingViewProps {
  userName: string
  selectedType: OnboardingType
  setSelectedType: (t: Exclude<OnboardingType, null>) => void
  isLoading: boolean
  onContinue: () => void
}

export function OnboardingDesktop({
  userName,
  selectedType,
  setSelectedType,
  isLoading,
  onContinue,
}: OnboardingViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6 font-marlin">
            <div className="w-12 h-12 relative">
              <Image src="/logo.png" alt="Orça Norte" fill className="object-contain" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Orça Norte</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2 font-marlin">Bem-vindo, {userName}!</h2>
          <p className="text-gray-600 text-lg font-montserrat">Como você pretende usar o Orça Norte?</p>
        </motion.div>

        {/* Opções */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
        >
          {/* Consumidor */}
          <Card
            className={`cursor-pointer transition-all duration-300 rounded-2xl border ${
              selectedType === "consumidor"
                ? "border-[#93C5FD] ring-2 ring-[#0052FF]/70 bg-blue-50/60 shadow-sm"
                : "border-gray-200 hover:border-gray-300 bg-white shadow-sm"
            }`}
            onClick={() => setSelectedType("consumidor")}
          >
            <CardHeader className="text-center pb-4">
              <div className="relative">
                <div
                  className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 transition-colors ${
                    selectedType === "consumidor" ? "bg-[#0052FF] text-white" : "bg-[#0052FF]/15 text-[#0052FF]"
                  }`}
                >
                  <User className="w-9 h-9" />
                </div>
                {selectedType === "consumidor" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 font-marlin">Consumidor</h3>
              <p className="text-gray-600 font-montserrat">Quero fazer cotações e comprar materiais</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600 font-montserrat">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Acesso gratuito completo</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-montserrat">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Cotações ilimitadas</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-montserrat">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Compare preços de fornecedores</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-montserrat">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Histórico de compras</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800 text-center font-montserrat">✨ Comece a usar agora mesmo!</p>
              </div>
            </CardContent>
          </Card>

          {/* Fornecedor */}
          <Card
            className={`cursor-pointer transition-all duration-300 rounded-2xl border ${
              selectedType === "fornecedor"
                ? "border-green-200 ring-2 ring-[#22C55E]/70 bg-green-50/60 shadow-sm"
                : "border-gray-200 hover:border-gray-300 bg-white shadow-sm"
            }`}
            onClick={() => setSelectedType("fornecedor")}
          >
            <CardHeader className="text-center pb-4">
              <div className="relative">
                <div
                  className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 transition-colors ${
                    selectedType === "fornecedor" ? "bg-[#22C55E] text-white" : "bg-[#22C55E]/15 text-[#22C55E]"
                  }`}
                >
                  <Building2 className="w-9 h-9" />
                </div>
                {selectedType === "fornecedor" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 font-marlin">Fornecedor</h3>
              <p className="text-gray-600 font-montserrat">Quero vender materiais e serviços</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600 font-montserrat">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Anuncie seus produtos/serviços</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-montserrat">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Receba cotações de clientes</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-montserrat">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Relatórios de vendas</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-montserrat">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Gestão de estoque</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm font-medium text-orange-800 text-center font-montserrat">💳 Planos a partir de R$ 99/mês</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Botão Continuar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }} className="text-center">
          <Button
            onClick={onContinue}
            disabled={!selectedType || isLoading}
            size="lg"
            className={`h-14 px-12 text-lg font-semibold transition-all rounded-full ${
              selectedType === "fornecedor" ? "bg-[#22C55E] hover:bg-[#22C55E]/90" : "bg-[#0052FF] hover:bg-[#0052FF]/90"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Configurando...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span>{selectedType === "fornecedor" ? "Escolher Plano" : "Começar Agora"}</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </Button>

          {selectedType && (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-sm text-gray-500">
              {selectedType === "consumidor"
                ? "Você terá acesso completo e gratuito ao sistema"
                : "Você será direcionado para escolher seu plano"}
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  )
}


