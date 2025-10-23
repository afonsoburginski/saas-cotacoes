"use client"

import { useStoreSlug } from "@/hooks/use-store-slug"

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
  const { data: storeSlug } = useStoreSlug()
  const slug = storeSlug?.slug
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
    // {
    //   label: "Comparar",
    //   icon: GitCompare,
    //   href: "/comparar",
    // },
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
      label: "Catálogo",
      icon: Package,
      href: slug ? `/loja/${slug}` : "/loja/loading",
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-bottom md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {displayRoutes.map((route) => {
          const isActive = pathname === route.href
          const isCartRoute = route.href === "/carrinho"
          const cartCount = isClient ? getCartItemsCount() : 0

          return (
            <Link
              key={route.href}
              href={route.href}
              className="flex flex-col items-center justify-center min-w-[60px] py-2 px-3 transition-all duration-200"
            >
              <div className="relative mb-1">
                <route.icon
                  className={cn(
                    "h-6 w-6 transition-colors duration-200",
                    isActive ? "text-blue-600" : "text-gray-600",
                    isCartRoute && recentlyAdded ? "animate-bounce" : "",
                  )}
                />
                {isCartRoute && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span 
                className={cn(
                  "text-[10px] font-medium transition-colors duration-200",
                  isActive ? "text-blue-600" : "text-gray-600"
                )}
              >
                {route.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-blue-600 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
