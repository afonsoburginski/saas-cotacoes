"use client"

import * as React from "react"
import { memo, useMemo, useEffect } from "react"
import { Package, CreditCard, BarChart3, Settings } from "lucide-react"
import { useStoreSlug } from "@/hooks/use-store-slug"
import { useStoreDataStore } from "@/stores/store-data-store"
import { usePendingOrdersCount, useMarkOrdersAsSeen } from "@/hooks/use-pending-quotes"
import { usePrefetchNavigation } from "@/hooks/use-prefetch-navigation"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { NavAdmin } from "./nav-admin"
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
import { useSession } from "@/lib/auth-client"

export const LojaSidebar = memo(function LojaSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // 🚀 Usar dados do Zustand como fallback instantâneo
  const { storeData } = useStoreDataStore()
  const { data: storeSlug } = useStoreSlug()
  const effectiveStoreData = storeSlug || storeData
  
  const { open } = useSidebar()
  const pathname = usePathname()
  const { data: pendingCount = 0 } = usePendingOrdersCount()
  const markAsSeen = useMarkOrdersAsSeen()
  const { data: session } = useSession()
  const { prefetchOrders, prefetchProducts } = usePrefetchNavigation()
  
  const slug = effectiveStoreData?.slug
  const storeId = effectiveStoreData?.id?.toString()
  
  // 🚀 Prefetch de dados ao montar o sidebar (navegação instantânea)
  useEffect(() => {
    if (storeId) {
      // Prefetch em background para navegação instantânea
      prefetchOrders(storeId)
      prefetchProducts(storeId)
    }
  }, [storeId, prefetchOrders, prefetchProducts])
  
  // Emails permitidos para acesso admin
  const allowedEmails = ['afonsoburginski@gmail.com', 'orcanorte28@gmail.com']
  const userEmail = session?.user?.email
  const hasAdminAccess = userEmail && allowedEmails.includes(userEmail)
  
  // 🚀 Memoizar navItems para evitar recriação
  const mainNavItems = useMemo(() => [
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

  // Items de admin separados
  const adminNavItems = useMemo(() => {
    if (!hasAdminAccess) return []
    
    return [
      {
        title: "Admin",
        url: slug ? `/loja/${slug}/admin` : "/loja/loading",
        icon: Settings,
        isActive: pathname === `/loja/${slug}/admin`,
      }
    ]
  }, [slug, pathname, hasAdminAccess])

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
        <NavMain items={mainNavItems} />
        {adminNavItems.length > 0 && <NavAdmin items={adminNavItems} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
})

