"use client"

import { LayoutDashboard, Building2, Users } from "lucide-react"
import { NavMain } from "@/components/loja/nav-main"
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
import { memo, useMemo } from "react"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export const AdminSidebar = memo(function AdminSidebar() {
  const { open } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()
  
  // 🚀 Memoizar navItems para evitar recriação
  const navItems = useMemo(() => [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/admin/dashboard",
    },
    {
      title: "Lojas",
      url: "/admin/lojas",
      icon: Building2,
      isActive: pathname === "/admin/lojas",
    },
    {
      title: "Usuários",
      url: "/admin/usuarios",
      icon: Users,
      isActive: pathname === "/admin/usuarios",
    },
  ], [pathname])
  
  const handleLogout = () => {
    localStorage.removeItem("adminLogged")
    localStorage.removeItem("adminEmail")
    router.push("/admin/login")
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/explorar" className="flex items-center gap-2">
                <div className={`relative ${open ? 'w-8 h-8' : 'w-10 h-10'}`}>
                  <Image 
                    src="https://vasfrygscudozjihcgfm.supabase.co/storage/v1/object/public/images/logo.png" 
                    alt="Orça Norte" 
                    fill 
                    priority 
                    sizes="40px" 
                    className="object-contain" 
                  />
                </div>
                {open && (
                  <span className="text-base font-bold text-gray-900">Admin</span>
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
})
