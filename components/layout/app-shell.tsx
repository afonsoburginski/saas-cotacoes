"use client"

import type React from "react"
import { Topbar } from "./topbar"
import { BottomTabs } from "./bottom-tabs"
import { MultiStepLoader } from "@/components/ui/multi-step-loader"
import { useSmartComparison } from "@/hooks/use-smart-comparison"
import { cn } from "@/lib/utils"

interface AppShellProps {
  children: React.ReactNode
  className?: string
}

export function AppShell({ children, className }: AppShellProps) {
  const { isLoading, loadingStates } = useSmartComparison()

  return (
    <div className="flex min-h-screen w-full flex-col relative">
      {/* Mesh Gradient Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-chart-1/8 via-chart-1/4 to-transparent blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/4 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-chart-2/6 via-chart-2/3 to-transparent blur-3xl animate-blob animation-delay-4000" />
        <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-accent/8 via-accent/4 to-transparent blur-3xl animate-blob animation-delay-6000" />
      </div>

      <Topbar />
      <main className={cn("flex-1 overflow-auto pb-20 relative z-10", className)}>
        <div className="px-6 py-3 h-full max-w-[1600px] mx-auto">{children}</div>
      </main>
      <BottomTabs />

      <MultiStepLoader loadingStates={loadingStates} loading={isLoading} duration={800} loop={false} />
    </div>
  )
}
