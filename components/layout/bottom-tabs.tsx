"use client"

import {
  Search,
  GitCompare,
  ShoppingCart,
  FileText,
  Package,
  BarChart3,
  CreditCard,
  Users,
  Star,
  MessageSquare,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRole } from "@/hooks/use-role"
import { useCartStore } from "@/stores/cart-store"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

export function BottomTabs() {
  const pathname = usePathname()
  const { role } = useRole()
  const recentlyAdded = useCartStore((state) => state.recentlyAdded)
  const getCartItemsCount = useCartStore((state) => state.getCartItemsCount)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const commonRoutes = [
    {
      label: "Explorar",
      icon: Search,
      href: "/explorar",
    },
    {
      label: "Comparar",
      icon: GitCompare,
      href: "/comparar",
    },
    {
      label: "Carrinho",
      icon: ShoppingCart,
      href: "/carrinho",
    },
    {
      label: "Listas",
      icon: FileText,
      href: "/listas",
    },
  ]

  const lojaRoutes = [
    {
      label: "Produtos",
      icon: Package,
      href: "/loja/produtos",
    },
    {
      label: "Relatórios",
      icon: BarChart3,
      href: "/loja/relatorios",
    },
    {
      label: "Assinatura",
      icon: CreditCard,
      href: "/loja/assinatura",
    },
  ]

  const adminRoutes = [
    {
      label: "Lojas",
      icon: Users,
      href: "/admin/lojas",
    },
    {
      label: "Prioridades",
      icon: Star,
      href: "/admin/prioridades",
    },
    {
      label: "Reviews",
      icon: MessageSquare,
      href: "/admin/reviews",
    },
    {
      label: "Planos",
      icon: Settings,
      href: "/admin/planos",
    },
  ]

  // Combine routes based on role
  let allRoutes = [...commonRoutes]

  if (role === "loja" || role === "admin") {
    allRoutes = [...allRoutes, ...lojaRoutes]
  }

  if (role === "admin") {
    allRoutes = [...allRoutes, ...adminRoutes]
  }

  // Limit to 5 tabs for better mobile experience
  const displayRoutes = allRoutes.slice(0, 5)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe">
      <div className="mx-auto max-w-md mb-4">
        <div className="bg-white/95 backdrop-blur-2xl rounded-full px-4 py-5 shadow-2xl border border-gray-200/50">
          <div className="flex items-center justify-between">
            {displayRoutes.map((route, index) => {
              const isActive = pathname === route.href

              const isCartRoute = route.href === "/carrinho"
              const cartCount = isClient ? getCartItemsCount() : 0

              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center justify-center transition-all duration-500 ease-out relative group",
                    isActive
                      ? "bg-[#0052FF] rounded-full px-6 py-3 min-w-[120px] transform scale-105 shadow-lg"
                      : "p-3 rounded-full min-w-[48px] hover:bg-gray-50 hover:scale-110",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <route.icon
                        className={cn(
                          "h-5 w-5 transition-all duration-500 ease-out",
                          isActive ? "text-white" : "text-gray-600 group-hover:text-gray-900",
                          isCartRoute && recentlyAdded ? "animate-bounce" : "",
                        )}
                      />
                      {isCartRoute && cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {cartCount > 9 ? "9+" : cartCount}
                        </span>
                      )}
                    </div>
                    {isActive && (
                      <span className="text-white font-semibold text-sm whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                        {route.label}
                      </span>
                    )}
                  </div>

                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/30 rounded-full animate-in fade-in duration-300" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
