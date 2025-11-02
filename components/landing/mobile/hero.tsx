"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { Star } from "lucide-react"

export function HeroMobile() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  return (
    <>
      <section className="px-4 py-8 bg-gradient-to-b from-[#0052FF] to-[#0052FF]/95">
        <div className="w-full max-w-md mx-auto text-center pt-2 pb-6">
          {/* Top pill */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs mb-3 border border-white/30 font-montserrat">
            <span className="text-white font-bold">500+</span>
            <span className="text-white/90">Empresas Ativas</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-extrabold text-white leading-tight mb-2 px-2 font-marlin">
            Orçamentos em tempo real rápido e fácil
          </h1>

          {/* Subtext */}
          <p className="text-xs text-white/75 mb-5 px-4 leading-relaxed font-montserrat">
            Conectando clientes, empresas e prestadores de serviço na construção civil.
          </p>

          {/* CTA */}
          <Button 
            onClick={() => setAuthDialogOpen(true)}
            className="w-full rounded-full bg-[#22C55E] border-0 text-white px-6 py-3.5 text-sm hover:bg-[#22C55E]/90 font-semibold shadow-lg mb-3 active:scale-95 transition-transform cursor-pointer"
          >
            Iniciar Agora
          </Button>

          {/* Rating row */}
          <div className="flex items-center justify-center gap-3 text-white/70 text-xs font-montserrat">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span>4.9</span>
            <span>•</span>
            <span>Sem taxas</span>
          </div>
        </div>
      </section>

      {/* Auth Dialog */}
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        mode="login"
      />
    </>
  )
}

