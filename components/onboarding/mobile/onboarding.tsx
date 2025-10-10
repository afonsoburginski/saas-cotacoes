"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { User, Building2, ArrowRight, Check } from "lucide-react"
import type { OnboardingType } from "../desktop/onboarding"

interface OnboardingViewProps {
  userName: string
  selectedType: OnboardingType
  setSelectedType: (t: Exclude<OnboardingType, null>) => void
  isLoading: boolean
  onContinue: () => void
}

export function OnboardingMobile({
  userName,
  selectedType,
  setSelectedType,
  isLoading,
  onContinue,
}: OnboardingViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col p-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-4 font-marlin">
          <div className="w-9 h-9 relative">
            <Image src="/logo.png" alt="Orça Norte" fill className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Orça Norte</h1>
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1 font-marlin">Bem-vindo, {userName}!</h2>
        <p className="text-gray-600 text-sm font-montserrat">Como você pretende usar o Orça Norte?</p>
      </motion.div>

      {/* Opções (stacked, cards grandes) */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="space-y-5 mb-10">
        {/* Consumidor */}
        <Card
          className={`cursor-pointer transition-all duration-300 rounded-2xl border p-5 ${selectedType === 'consumidor' ? 'border-[#93C5FD] ring-1 ring-[#0052FF]/70 bg-blue-50/60' : 'border-gray-200 bg-white'} shadow-sm`}
          onClick={() => setSelectedType('consumidor')}
        >
          <CardHeader className="text-left pb-4">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${selectedType === 'consumidor' ? 'bg-[#0052FF] text-white' : 'bg-[#0052FF]/15 text-[#0052FF]'}`}>
                <User className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-marlin mb-0.5">Consumidor</h3>
                <p className="text-gray-600 text-sm font-montserrat">Quero fazer cotações e comprar materiais</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 mb-2.5 font-montserrat">Benefícios:</p>
              <ul className="space-y-2">
                {['Acesso gratuito','Cotações ilimitadas','Compare preços'].map((f)=> (
                  <li key={f} className="flex items-center gap-2">
                    <div className="bg-[#0052FF]/10 w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-[#0052FF]" />
                    </div>
                    <span className="text-xs text-gray-700 font-montserrat">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Fornecedor */}
        <Card
          className={`cursor-pointer transition-all duration-300 rounded-2xl border p-5 ${selectedType === 'fornecedor' ? 'border-green-200 ring-1 ring-[#22C55E]/70 bg-green-50/60' : 'border-gray-200 bg-white'} shadow-sm`}
          onClick={() => setSelectedType('fornecedor')}
        >
          <CardHeader className="text-left pb-4">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${selectedType === 'fornecedor' ? 'bg-[#22C55E] text-white' : 'bg-[#22C55E]/15 text-[#22C55E]'}`}>
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-marlin mb-0.5">Fornecedor</h3>
                <p className="text-gray-600 text-sm font-montserrat">Quero vender materiais e serviços</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 mb-2.5 font-montserrat">Benefícios:</p>
              <ul className="space-y-2">
                {['Anuncie produtos/serviços','Receba cotações','Relatórios e gestão'].map((f)=> (
                  <li key={f} className="flex items-center gap-2">
                    <div className="bg-[#22C55E]/10 w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-[#22C55E]" />
                    </div>
                    <span className="text-xs text-gray-700 font-montserrat">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-auto text-center">
        <Button
          onClick={onContinue}
          disabled={!selectedType || isLoading}
          className={`w-full h-12 text-base font-semibold ${selectedType === "fornecedor" ? "bg-[#22C55E] hover:bg-[#22C55E]/90" : "bg-[#0052FF] hover:bg-[#0052FF]/90"}`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Configurando...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <span>{selectedType === "fornecedor" ? "Escolher Plano" : "Começar Agora"}</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          )}
        </Button>
      </motion.div>
    </div>
  )
}


