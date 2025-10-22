"use client"

import { useStoreSlug } from "@/hooks/use-store-slug"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
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

export function AppSidebar() {
  const pathname = usePathname()
  const { role } = useRole()
  const { data: storeSlug } = useStoreSlug()

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
      href: storeSlug ? `/loja/${storeSlug}` : "/loja/loading",
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
    <Sidebar collapsible="icon" className="glass-strong">
      <SidebarHeader className="p-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="glass-subtle hover:glass-strong" />
          <h2 className="text-sm font-bold gradient-text tracking-tight group-data-[collapsible=icon]:hidden">
            Cotações
          </h2>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-1">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {commonRoutes.map((route) => (
                <SidebarMenuItem key={route.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === route.href}
                    tooltip={route.label}
                    className="glass-subtle hover:glass-strong transition-all duration-200"
                  >
                    <Link href={route.href}>
                      <route.icon className="h-4 w-4" />
                      <span>{route.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(role === "loja" || role === "admin") && (
          <>
            <SidebarSeparator className="bg-border/40" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase">
                Loja
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {lojaRoutes.map((route) => (
                    <SidebarMenuItem key={route.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === route.href}
                        tooltip={route.label}
                        className="glass-subtle hover:glass-strong transition-all duration-200"
                      >
                        <Link href={route.href}>
                          <route.icon className="h-4 w-4" />
                          <span>{route.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {role === "admin" && (
          <>
            <SidebarSeparator className="bg-border/40" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase">
                Admin
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminRoutes.map((route) => (
                    <SidebarMenuItem key={route.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === route.href}
                        tooltip={route.label}
                        className="glass-subtle hover:glass-strong transition-all duration-200"
                      >
                        <Link href={route.href}>
                          <route.icon className="h-4 w-4" />
                          <span>{route.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
