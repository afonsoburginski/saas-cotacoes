"use client"

import { LogOut, User as UserIcon } from "lucide-react"
import { useSession, signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useStoreSlug } from "@/hooks/use-store-slug"
import { useMemo, useCallback, memo } from "react"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export const NavUser = memo(function NavUser() {
  const { isMobile } = useSidebar()
  const { data: session } = useSession()
  const router = useRouter()
  const { data: storeSlug } = useStoreSlug()
  
  // 🚀 Memoizar valores derivados para evitar recálculos
  const user = useMemo(() => session?.user, [session?.user])
  
  const displayInitials = useMemo(() => {
    return ((user?.name || "U").trim().split(/\s+/).map((n) => n.charAt(0)).slice(0, 2).join("") || "U").toUpperCase()
  }, [user?.name])
  
  const slug = useMemo(() => storeSlug?.slug, [storeSlug?.slug])
  const storeLogo = useMemo(() => storeSlug?.logo, [storeSlug?.logo])
  const storeName = useMemo(() => storeSlug?.storeName, [storeSlug?.storeName])
  
  const displayName = useMemo(() => storeName || user?.name, [storeName, user?.name])
  const displayEmail = useMemo(() => user?.email, [user?.email])
  
  // 🚀 Memoizar callbacks para evitar recriação
  const handleLogout = useCallback(async () => {
    await signOut()
    router.push('/')
  }, [router])
  
  const handleProfileClick = useCallback(() => {
    router.push(slug ? `/loja/${slug}/perfil` : '/loja/loading')
  }, [router, slug])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {storeLogo ? (
                  <img src={storeLogo} alt={storeSlug?.storeName || "Loja"} className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <AvatarFallback className="rounded-lg bg-[#0052FF] text-white">
                    {displayInitials}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">{displayEmail}</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {storeLogo ? (
                    <img src={storeLogo} alt={storeSlug?.storeName || "Loja"} className="h-full w-full object-cover rounded-lg" />
                  ) : (
                    <AvatarFallback className="rounded-lg bg-[#0052FF] text-white">
                      {displayInitials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {displayEmail}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={handleProfileClick}>
              <UserIcon className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sair da Conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
})

