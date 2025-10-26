import React, { useCallback } from "react"
import { type LucideIcon } from "lucide-react"
import Link from "next/link"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

interface NavMainProps {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    badge?: number
    onClick?: () => void
  }[]
}

export const NavMain = React.memo(function NavMain({ items }: NavMainProps) {
  // 🚀 Memoizar handlers para cada item
  const handleClick = useCallback((onClick?: () => void) => {
    return (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        onClick()
      }
    }
  }, [])

  return (
    <SidebarGroup>
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
                    <Badge 
                      variant="default" 
                      className="ml-auto h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center animate-pulse bg-blue-500 hover:bg-blue-600"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
})
