"use client"

import { Hero as HeroDesktop } from "./desktop/hero"
import { HeroMobile } from "./mobile/hero"

// Renderiza ambas as versões e usa CSS (breakpoints) para evitar qualquer flash/mismatch na hidratação.
export function Hero() {
  return (
    <>
      <div className="block md:hidden">
        <HeroMobile />
      </div>
      <div className="hidden md:block">
        <HeroDesktop />
      </div>
    </>
  )
}

