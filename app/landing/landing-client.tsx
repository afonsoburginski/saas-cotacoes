"use client"

import { useEffect } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Hero } from "@/components/landing/hero-adaptive"
import { Features } from "@/components/landing/features-adaptive"
import { Testimonials } from "@/components/landing/testimonials-adaptive"
import { Pricing } from "@/components/landing/pricing-adaptive"
import { FAQ } from "@/components/landing/faq-adaptive"
import { CTASection } from "@/components/landing/cta-section-adaptive"
import { PageBackground } from "@/components/layout/page-background"
import { LandingTopbar } from "@/components/layout/landing-topbar"

export function LandingPageClient() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  
  // Não redirecionar automaticamente - deixar user na landing
  // Se quiser ir pra área dele, clica nos botões do header
  
  
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <PageBackground />
      <LandingTopbar />

      {/* HERO */}
      <Hero />

      {/* FEATURES */}
      <Features />

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* PRICING */}
      <Pricing />

      {/* FAQ */}
      <FAQ />

      {/* CTA SECTION + FOOTER */}
      <CTASection />
    </div>
  )
}

