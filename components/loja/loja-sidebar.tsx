"use client"

import * as React from "react"
import { memo, useMemo } from "react"
import { Package, CreditCard, BarChart3 } from "lucide-react"
import { useStoreSlug } from "@/hooks/use-store-slug"
import { usePendingOrdersCount, useMarkOrdersAsSeen } from "@/hooks/use-pending-quotes"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

export const LojaSidebar = memo(function LojaSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: storeSlug } = useStoreSlug()
  const { open } = useSidebar()
  const pathname = usePathname()
  const { data: pendingCount = 0 } = usePendingOrdersCount()
  const markAsSeen = useMarkOrdersAsSeen()
  
  const slug = storeSlug?.slug
  
  // 🚀 Memoizar navItems para evitar recriação
  const navItems = useMemo(() => [
    {
      title: "Dashboard",
      url: slug ? `/loja/${slug}` : "/loja/loading",
      icon: BarChart3,
      isActive: pathname === `/loja/${slug}`,
      badge: pendingCount > 0 ? pendingCount : undefined,
      onClick: () => {
        if (pendingCount > 0) {
          markAsSeen()
        }
      }
    },
    {
      title: "Catálogo",
      url: slug ? `/loja/${slug}/catalogo` : "/loja/loading",
      icon: Package,
      isActive: pathname === `/loja/${slug}/catalogo`,
    },
    {
      title: "Assinatura",
      url: slug ? `/loja/${slug}/assinatura` : "/loja/loading",
      icon: CreditCard,
      isActive: pathname === `/loja/${slug}/assinatura`,
    },
  ], [slug, pathname, pendingCount, markAsSeen])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/explorar" className="flex items-center gap-2">
                <div className={`relative ${open ? 'w-8 h-8' : 'w-10 h-10'}`}>
                  <Image src="https://vasfrygscudozjihcgfm.supabase.co/storage/v1/object/public/images/logo.png" alt="Orça Norte" fill priority sizes="40px" className="object-contain" />
                </div>
                {open && (
                  <span className="text-base font-bold text-gray-900">Orça Norte</span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
})

