"use client"

import { CTASection as CTASectionDesktop } from "./desktop/cta-section"
import { CTASectionMobile } from "./mobile/cta-section"

export function CTASection() {
  return (
    <>
      <div className="block md:hidden">
        <CTASectionMobile />
      </div>
      <div className="hidden md:block">
        <CTASectionDesktop />
      </div>
    </>
  )
}

