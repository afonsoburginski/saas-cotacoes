"use client"

import { Button } from "@/components/ui/button"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { useEffect, useState } from "react"
import Image from "next/image"

export function LandingTopbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className="sticky top-1 sm:top-2 z-50">
      <div className="max-w-[84rem] mx-auto px-6 transition-all duration-700 ease-out">
        <div
          className={`flex h-12 sm:h-14 items-center justify-between px-4 transition-all duration-700 ease-out rounded-2xl sm:rounded-3xl
            ${
              isScrolled
                ? "backdrop-blur-2xl bg-white/80 border border-gray-200/50 shadow-xl"
                : "bg-transparent border border-transparent shadow-none"
            }
          `}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 relative overflow-hidden">
              <Image
                src="/logo.png"
                alt="Orça Norte"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-base sm:text-xl text-[#22C55E] font-marlin">
              Orça Norte
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => setAuthDialogOpen(true)}
              className="bg-[#22C55E] text-white hover:bg-[#22C55E]/90 transition-all duration-200 px-4 sm:px-6 text-sm sm:text-base h-9 sm:h-10"
            >
              Entrar
            </Button>
          </div>
        </div>
      </div>
      
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        mode="login"
      />
    </header>
  )
}
