"use client"

import { OnboardingDesktop } from "./desktop/onboarding"
import { OnboardingMobile } from "./mobile/onboarding"
import type { OnboardingType } from "./desktop/onboarding"

interface Props {
  userName: string
  selectedType: OnboardingType
  setSelectedType: (t: Exclude<OnboardingType, null>) => void
  isLoading: boolean
  onContinue: () => void
}

export function OnboardingAdaptive(props: Props) {
  return (
    <>
      <div className="block md:hidden">
        <OnboardingMobile {...props} />
      </div>
      <div className="hidden md:block">
        <OnboardingDesktop {...props} />
      </div>
    </>
  )
}


