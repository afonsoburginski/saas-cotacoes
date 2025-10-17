"use client"

import { TopbarMobile } from "./mobile/topbar"
import { TopbarDesktop } from "./desktop/topbar"

export function TopbarAdaptive() {
  return (
    <>
      {/* Mobile version */}
      <div className="block md:hidden">
        <TopbarMobile />
      </div>
      
      {/* Desktop version */}
      <div className="hidden md:block">
        <TopbarDesktop />
      </div>
    </>
  )
}

