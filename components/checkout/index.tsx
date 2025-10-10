"use client";

import { CheckoutDesktop } from "./desktop/checkout";
import { CheckoutMobile } from "./mobile/checkout";

interface CheckoutAdaptiveProps {
  selectedPlan: 'basico' | 'plus' | 'premium';
  setSelectedPlan: (plan: 'basico' | 'plus' | 'premium') => void;
  isLoading: boolean;
  handleSubscribe: () => void;
}

export function CheckoutAdaptive({ selectedPlan, setSelectedPlan, isLoading, handleSubscribe }: CheckoutAdaptiveProps) {
  return (
    <>
      <div className="block md:hidden">
        <CheckoutMobile 
          selectedPlan={selectedPlan}
          setSelectedPlan={setSelectedPlan}
          isLoading={isLoading}
          handleSubscribe={handleSubscribe}
        />
      </div>
      <div className="hidden md:block">
        <CheckoutDesktop 
          selectedPlan={selectedPlan}
          setSelectedPlan={setSelectedPlan}
          isLoading={isLoading}
          handleSubscribe={handleSubscribe}
        />
      </div>
    </>
  );
}

