"use client"

import { FAQ as FAQDesktop } from "./desktop/faq"
import { FAQMobile } from "./mobile/faq"

export function FAQ() {
  return (
    <>
      <div className="block md:hidden">
        <FAQMobile />
      </div>
      <div className="hidden md:block">
        <FAQDesktop />
      </div>
    </>
  )
}

