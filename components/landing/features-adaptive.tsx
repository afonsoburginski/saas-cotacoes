"use client"

import { Features as FeaturesDesktop } from "./desktop/features"
import { FeaturesMobile } from "./mobile/features"

export function Features() {
  return (
    <>
      <div className="block md:hidden">
        <FeaturesMobile />
      </div>
      <div className="hidden md:block">
        <FeaturesDesktop />
      </div>
    </>
  )
}

