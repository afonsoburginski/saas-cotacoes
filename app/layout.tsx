import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { RoleProvider } from "@/hooks/use-role"
import { SmartComparisonProvider } from "@/hooks/use-smart-comparison"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/lib/providers"
import { QueryProvider } from "@/providers/query-provider"
import { SessionProvider } from "@/components/auth/session-provider"
import { Suspense } from "react"

import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Inter, Montserrat } from "next/font/google"
import localFont from "next/font/local"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})

const marlinSoft = localFont({
  src: [
    {
      path: "./fonts/FontMesa - MarlinSoftBasic-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/FontMesa - MarlinSoftBasic-RegularItalic.otf",
      weight: "400",
      style: "italic",
    }
  ],
  variable: "--font-marlin",
})

export const metadata: Metadata = {
  title: "Orça Norte - Cotações de Materiais de Construção",
  description: "Plataforma B2B para cotação de materiais de construção e serviços",
  generator: "v0.app",
}

export const viewport = {
  themeColor: "#0052FF",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="light">
      <head>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`min-h-screen bg-background font-sans antialiased ${GeistSans.variable} ${GeistMono.variable} ${inter.variable} ${montserrat.variable} ${marlinSoft.variable}`}
      >
        <SessionProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
              forcedTheme="light"
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
          </QueryProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
