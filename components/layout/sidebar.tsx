"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRole } from "@/hooks/use-role"
import { useState } from "react"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { role } = useRole()
  const [collapsed, setCollapsed] = useState(true)

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
      label: "Relatórios da Loja",
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

  return (
    <div
      className={cn("pb-4 glass-strong shadow-lg transition-all duration-300", collapsed ? "w-16" : "w-64", className)}
    >
      <div className="space-y-2 py-2">
        <div className="px-2 py-1">
          <div className="flex items-center justify-between mb-2">
            {!collapsed && <h2 className="text-base font-bold gradient-text tracking-tight">Cotações</h2>}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="h-7 w-7 p-0 glass-subtle hover:glass-strong transition-all duration-200"
            >
              {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </Button>
          </div>
          <div className="space-y-1">
            {commonRoutes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start font-medium transition-all duration-200 hover:scale-[1.01] h-8 text-sm",
                  collapsed ? "px-1 justify-center" : "px-2",
                  pathname === route.href && "glass-strong shadow-sm",
                )}
                asChild
              >
                <Link href={route.href}>
                  <route.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                  {!collapsed && route.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {(role === "loja" || role === "admin") && (
          <>
            <div className="px-2">
              <Separator className="bg-border/40" />
            </div>
            <div className="px-2 py-1">
              {!collapsed && (
                <h3 className="mb-1 px-1 text-xs font-semibold tracking-tight text-muted-foreground uppercase">Loja</h3>
              )}
              <div className="space-y-1">
                {lojaRoutes.map((route) => (
                  <Button
                    key={route.href}
                    variant={pathname === route.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start font-medium transition-all duration-200 hover:scale-[1.01] h-8 text-sm",
                      collapsed ? "px-1 justify-center" : "px-2",
                      pathname === route.href && "glass-strong shadow-sm",
                    )}
                    asChild
                  >
                    <Link href={route.href}>
                      <route.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                      {!collapsed && route.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {role === "admin" && (
          <>
            <div className="px-2">
              <Separator className="bg-border/40" />
            </div>
            <div className="px-2 py-1">
              {!collapsed && (
                <h3 className="mb-1 px-1 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
                  Admin
                </h3>
              )}
              <div className="space-y-1">
                {adminRoutes.map((route) => (
                  <Button
                    key={route.href}
                    variant={pathname === route.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start font-medium transition-all duration-200 hover:scale-[1.01] h-8 text-sm",
                      collapsed ? "px-1 justify-center" : "px-2",
                      pathname === route.href && "glass-strong shadow-sm",
                    )}
                    asChild
                  >
                    <Link href={route.href}>
                      <route.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                      {!collapsed && route.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
