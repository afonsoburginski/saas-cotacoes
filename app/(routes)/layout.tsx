"use client"

import type React from "react"
import { AppShell } from "@/components/layout/app-shell"
import { usePathname } from "next/navigation"

export default function RoutesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Rotas de loja usam seu próprio layout (não precisa AppShell)
  if (pathname.startsWith('/loja/')) {
    return <>{children}</>
  }
  
  // Outras rotas usam AppShell (topbar + bottom tabs)
  return <AppShell>{children}</AppShell>
}
