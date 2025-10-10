"use client"

import { Testimonials as TestimonialsDesktop } from "./desktop/testimonials"
import { TestimonialsMobile } from "./mobile/testimonials"

export function Testimonials() {
  return (
    <>
      <div className="block md:hidden">
        <TestimonialsMobile />
      </div>
      <div className="hidden md:block">
        <TestimonialsDesktop />
      </div>
    </>
  )
}

