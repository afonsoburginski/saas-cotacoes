"use client"

import { CompararMobile } from "./mobile/comparar"
import { CompararDesktop } from "./desktop/comparar"

export function CompararAdaptive() {
  return (
    <>
      <div className="block md:hidden">
        <CompararMobile />
      </div>
      <div className="hidden md:block">
        <CompararDesktop />
      </div>
    </>
  )
}


