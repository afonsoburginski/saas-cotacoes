"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { Spotlight } from "@/components/ui/spotlight-new"
import { BackgroundGradient } from "@/components/ui/background-gradient"
import { AnimatedFeatures } from "@/components/ui/animated-features"
import { Testimonials } from "@/components/ui/testimonials"
import { Pricing } from "@/components/ui/pricing"
import { FAQ } from "@/components/ui/faq"
import { CTASection } from "@/components/ui/cta-section"
import { LandingFooter } from "@/components/ui/landing-footer"
import { PageBackground } from "@/components/layout/page-background"
import { LandingTopbar } from "@/components/layout/landing-topbar"
import { Search, Sparkles, ShoppingCart, Star } from "lucide-react"

export default function HomePage() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  
  return (
    <div className="bg-white min-h-screen">
      <PageBackground />
      <LandingTopbar />

      {/* HERO (Framer background style) */}
      <section className="px-4 md:px-6 py-8 bg-white">
        <div
          className="relative flex flex-col min-h-[80vh] items-center justify-center w-full overflow-hidden py-16 md:py-20 mx-auto max-w-[95%]"
          style={{
            background: "rgb(249, 250, 251)",
            borderRadius: "24px",
          }}
        >
        {/* Solid blue overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundColor: "rgb(0 82 255 / var(--tw-bg-opacity, 1))",
            borderRadius: "inherit"
          }}
        />

        {/* Spotlight animation overlay */}
        <Spotlight 
          className="z-1"
          gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(210, 100%, 85%, .08) 0, hsla(210, 100%, 55%, .02) 50%, hsla(210, 100%, 45%, 0) 80%)"
          gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .06) 0, hsla(210, 100%, 55%, .02) 80%, transparent 100%)"
          gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .04) 0, hsla(210, 100%, 45%, .02) 80%, transparent 100%)"
          translateY={-350}
          width={560}
          height={1380}
          smallWidth={240}
          duration={7}
          xOffset={100}
        />

        {/* Vertical Lines Grid */}
        <div className="absolute inset-0 flex justify-between pointer-events-none z-0">
          {Array.from({ length: 24 }).map((_, i) => {
            const distanceFromCenter = Math.abs(i - 11.5) / 11.5; // 0 no centro, 1 nas bordas
            const opacity = Math.max(0, distanceFromCenter * 0.4); // Mais fraco no centro
            return (
              <div
                key={i}
                className="w-px h-full"
                style={{
                  background: `linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, ${opacity}) 50%, transparent 100%)`
                }}
              />
            );
          })}
        </div>

        {/* Noise Texture Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            opacity: 0.15,
            backgroundImage:
              "url(https://framerusercontent.com/images/6mcf62RlDfRfU61Yg5vb2pefpi4.png)",
            backgroundRepeat: "repeat",
            backgroundPosition: "left top",
            backgroundSize: "128px auto",
            borderRadius: "inherit",
          }}
        />

        {/* Text content */}
        <div className="w-full max-w-6xl mx-auto text-center text-neutral-900 pt-24 md:pt-24 relative z-10">
          {/* Top pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm backdrop-blur">
            <span className="bg-clip-text text-transparent bg-[linear-gradient(135deg,rgb(0,82,255)_0%,rgb(59,130,246)_25%,rgb(34,197,94)_50%,rgb(16,185,129)_75%,rgb(0,82,255)_100%)] font-semibold">300+</span>
            <span className="text-neutral-800">Empresas que já confiam em nós</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mt-6 text-white">
            Faça seu orçamento
            <br className="hidden md:block" /> Simples e Eficiente
          </h1>

          {/* Subtext */}
          <p className="text-base md:text-lg text-neutral-200 mt-4">
            Execute o seu plano de construir ou reformar com o nosso orçamento simplificado.
          </p>

          {/* CTA */}
          <div className="mt-8">
            <Button 
              onClick={() => setAuthDialogOpen(true)}
              className="rounded-full bg-[#22C55E] text-white px-6 py-3 text-base hover:bg-[#22C55E]/90"
            >
              Testar Agora
            </Button>
          </div>

          {/* Rating row */}
          <div className="mt-6 flex items-center justify-center gap-3 text-neutral-200">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
            <span className="text-sm text-neutral-200 ">4.9 rating</span>
            <span className="text-sm text-neutral-200">Mais de 10k de usuários</span>
          </div>
        </div>

        {/* Showcase image container */}
        <div className="w-full max-w-[1000px] mx-auto px-4 relative z-10 mt-16">
          <BackgroundGradient className="rounded-[22px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
            <div className="relative w-full" style={{ aspectRatio: "4632/2921" }}>
              <Image
                src="https://framerusercontent.com/images/BesZqi2DRImbj4FXrPED12W5zA.png"
                alt="Dashboard Image"
                fill
                sizes="(max-width: 1024px) 100vw, 1000px"
                className="object-cover"
                priority
              />
            </div>
          </BackgroundGradient>
        </div>
        </div>
      </section>

      {/* FEATURES */}
      <AnimatedFeatures />

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* PRICING */}
      <Pricing />

      {/* FAQ */}
      <FAQ />

      {/* CTA SECTION */}
      <CTASection />

      {/* FOOTER */}
      <LandingFooter />
      
      {/* Auth Dialog */}
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        mode="register"
      />
    </div>
  )
}
