"use client"

import { Button } from "@/components/ui/button"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { useEffect, useState } from "react"
import Image from "next/image"

export function LandingTopbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className="sticky top-2 z-50 transition-all">
      <div className="mx-auto max-w-[1600px] px-4">
        <div
          className={`flex h-14 items-center justify-between px-4 transition-all duration-500 ease-in-out
            ${
              isScrolled
                ? "backdrop-blur-2xl bg-white/40 border border-gray-200/30 shadow-xl max-w-5xl mx-auto rounded-3xl"
                : "bg-transparent max-w-full rounded-2xl"
            }
          `}
        >
        <div className="flex items-center gap-3">
        <div className="w-8 h-8 relative overflow-hidden">
          <Image
            src="/logo.png"
            alt="Orça Norte"
            fill
            className="object-contain"
          />
        </div>
          <span className={`font-bold text-xl transition-colors duration-500 ${
            isScrolled ? "text-gray-900" : "text-gray-900"
          }`}>
            Orça Norte
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={() => {
              setAuthMode('login')
              setAuthDialogOpen(true)
            }}
            className={`transition-all duration-500 ${
              isScrolled
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Login
          </Button>
          <Button
            onClick={() => {
              setAuthMode('register')
              setAuthDialogOpen(true)
            }}
            className="bg-[#22C55E] text-white hover:bg-[#22C55E]/90 transition-all duration-200"
          >
            Registro
          </Button>
        </div>
        </div>
      </div>
      
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        mode={authMode}
      />
    </header>
  )
}
