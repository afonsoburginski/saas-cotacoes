import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { RoleProvider } from "@/hooks/use-role"
import { SmartComparisonProvider } from "@/hooks/use-smart-comparison"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/lib/providers"
import { Suspense } from "react"

import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "SaaS Cotações - Materiais de Construção",
  description: "Plataforma B2B para cotação de materiais de construção",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`min-h-screen bg-background font-sans antialiased ${GeistSans.variable} ${GeistMono.variable} ${inter.variable}`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <RoleProvider>
              <SmartComparisonProvider>
                <Suspense>{children}</Suspense>
                <Toaster />
              </SmartComparisonProvider>
            </RoleProvider>
          </Providers>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
