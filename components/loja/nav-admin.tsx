import React, { useCallback } from "react"
import { type LucideIcon } from "lucide-react"
import Link from "next/link"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

interface NavAdminProps {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    badge?: number
    onClick?: () => void
  }[]
}

export const NavAdmin = React.memo(function NavAdmin({ items }: NavAdminProps) {
  // 🚀 Memoizar handlers para cada item
  const handleClick = useCallback((onClick?: () => void) => {
    return (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        onClick()
      }
    }
  }, [])

  if (items.length === 0) return null

  return (
    <>
      <Separator />
      <SidebarGroup>
        <SidebarGroupLabel>Administração</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={item.isActive} tooltip={item.title}>
                  <Link 
                    href={item.url}
                    onClick={handleClick(item.onClick)}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
})

