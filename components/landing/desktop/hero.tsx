"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { Spotlight } from "@/components/ui/spotlight-new"
import { ContainerScroll } from "@/components/ui/container-scroll-animation"
import { Star } from "lucide-react"

export function Hero() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  return (
    <>
      <section className="px-4 md:px-6 py-8 bg-gradient-to-b from-gray-50 to-white">
        <div
          className="relative flex flex-col min-h-[120vh] items-center justify-start w-full overflow-hidden py-12 md:py-16 mx-auto max-w-[95%]"
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
            const distanceFromCenter = Math.abs(i - 11.5) / 11.5;
            const opacity = Math.max(0, distanceFromCenter * 0.4);
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

        {/* Scroll Container with Animation */}
        <div className="w-full relative z-10 pt-12 md:pt-20">
          <ContainerScroll
            titleComponent={
              <div className="text-center">
                {/* Top pill */}
                <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm backdrop-blur font-montserrat mb-6">
                  <span className="bg-clip-text text-transparent bg-[linear-gradient(135deg,rgb(0,82,255)_0%,rgb(59,130,246)_25%,rgb(34,197,94)_50%,rgb(16,185,129)_75%,rgb(0,82,255)_100%)] font-semibold">500+</span>
                  <span className="text-neutral-800">Empresas e Prestadores ativos</span>
                </div>

                {/* Heading */}
                <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white font-marlin mb-4">
                  Orçamentos em tempo real
                  <br className="hidden md:block" /> rápido e fácil
                </h1>

                {/* Subtext */}
                <p className="text-base md:text-lg text-neutral-200 mb-6 font-montserrat max-w-2xl mx-auto">
                  Conectando clientes, empresas e prestadores de serviço na construção civil.
                </p>

                {/* CTA */}
                <Button 
                  onClick={() => setAuthDialogOpen(true)}
                  className="rounded-full bg-[#22C55E] text-white px-8 py-3 text-base hover:bg-[#22C55E]/90 font-semibold mb-6"
                >
                  Iniciar Agora
                </Button>

                {/* Rating row */}
                <div className="flex items-center justify-center gap-3 text-neutral-200 font-montserrat">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <span className="text-sm text-neutral-200">4.9 Avaliação</span>
                  <span className="text-sm text-neutral-200">Sem taxas por venda</span>
                </div>
              </div>
            }
          >
            <div className="relative w-full" style={{ aspectRatio: "4632/2921" }}>
              <Image
                src="https://framerusercontent.com/images/BesZqi2DRImbj4FXrPED12W5zA.png"
                alt="Dashboard Image"
                fill
                sizes="(max-width: 1024px) 100vw, 1000px"
                className="object-cover object-top"
                priority
              />
            </div>
          </ContainerScroll>
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

