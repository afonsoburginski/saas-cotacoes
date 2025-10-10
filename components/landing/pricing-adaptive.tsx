"use client"

import { Pricing as PricingDesktop } from "./desktop/pricing"
import { PricingMobile } from "./mobile/pricing"

export function Pricing() {
  return (
    <>
      <div className="block md:hidden">
        <PricingMobile />
      </div>
      <div className="hidden md:block">
        <PricingDesktop />
      </div>
    </>
  )
}

