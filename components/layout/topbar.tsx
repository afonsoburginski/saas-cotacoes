"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Settings, LogOut, UserCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth-store"
import Image from "next/image"

export function Topbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, logout } = useAuthStore()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className="sticky top-2 z-50 transition-all">
      <div className="mx-auto max-w-[1600px] px-4">
        <div
          className={`flex h-14 items-center justify-between px-4 transition-all duration-500 ease-in-out
            ${
              isScrolled
                ? "backdrop-blur-2xl bg-white/40 border border-gray-200/30 shadow-xl max-w-5xl mx-auto rounded-3xl"
                : "bg-transparent max-w-full rounded-2xl"
            }
          `}
        >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 relative overflow-hidden">
            <Image
              src="/logo.png"
              alt="Orça Norte"
              fill
              className="object-contain"
            />
          </div>
          <span className={`font-bold text-xl transition-colors duration-500 ${
            isScrolled ? "text-gray-900" : "text-gray-900"
          }`}>
            Orça Norte
          </span>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full hover:bg-gray-100 transition-all duration-200"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-[#0052FF] text-white font-semibold">
                    {user?.name?.charAt(0) || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-white border border-gray-200 shadow-lg rounded-lg"
              align="end"
              sideOffset={8}
            >
              <DropdownMenuLabel className="p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-gray-900">{user?.name || 'Usuário'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="p-3 cursor-pointer hover:bg-gray-50">
                <UserCircle className="mr-3 h-4 w-4 text-gray-500" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="p-3 cursor-pointer hover:bg-gray-50">
                <Settings className="mr-3 h-4 w-4 text-gray-500" />
                <span>Configurações</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem 
                className="p-3 cursor-pointer hover:bg-red-50 text-red-600"
                onClick={logout}
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span>Sair da Conta</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        </div>
      </div>
    </header>
  )
}
