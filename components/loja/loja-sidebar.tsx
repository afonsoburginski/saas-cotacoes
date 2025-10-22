"use client"

import * as React from "react"
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
import { usePathname } from "next/navigation"

export function LojaSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: storeSlug } = useStoreSlug()
  const { open } = useSidebar()
  const pathname = usePathname()
  const { data: pendingCount = 0 } = usePendingOrdersCount()
  const markAsSeen = useMarkOrdersAsSeen()
  
  const navItems = [
    {
      title: "Dashboard",
      url: storeSlug ? `/loja/${storeSlug}` : "/loja/loading",
      icon: BarChart3,
      isActive: pathname === `/loja/${storeSlug}`,
      badge: pendingCount > 0 ? pendingCount : undefined,
      onClick: () => {
        if (pendingCount > 0) {
          markAsSeen()
        }
      }
    },
    {
      title: "Catálogo",
      url: storeSlug ? `/loja/${storeSlug}/catalogo` : "/loja/loading",
      icon: Package,
      isActive: pathname === `/loja/${storeSlug}/catalogo`,
    },
    {
      title: "Assinatura",
      url: storeSlug ? `/loja/${storeSlug}/assinatura` : "/loja/loading",
      icon: CreditCard,
      isActive: pathname === `/loja/${storeSlug}/assinatura`,
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/" className="flex items-center gap-2">
                <div className={`relative ${open ? 'w-8 h-8' : 'w-10 h-10'}`}>
                  <Image src="/logo.png" alt="Orça Norte" fill className="object-contain" />
                </div>
                {open && (
                  <span className="text-base font-bold text-gray-900">Orça Norte</span>
                )}
              </a>
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
}

