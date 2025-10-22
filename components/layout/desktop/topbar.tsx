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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Settings, LogOut, UserCircle, ShoppingCart } from "lucide-react"
import { useEffect, useState } from "react"
import { useSession, signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/stores/cart-store"
import Image from "next/image"

export function TopbarDesktop() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const getCartItemsCount = useCartStore((state) => state.getCartItemsCount)
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const cartCount = isClient ? getCartItemsCount() : 0
  const user = session?.user
  const displayInitials = ((user?.name || "U").trim().split(/\s+/).map((n) => n.charAt(0)).slice(0, 2).join("") || "U").toUpperCase()
  
  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

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
                  <AvatarFallback className="bg-[#0052FF] text-white font-semibold">
                    {displayInitials}
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
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="p-3 cursor-pointer hover:bg-gray-50">
                <UserCircle className="mr-3 h-4 w-4 text-gray-500" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                className="p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => router.push('/carrinho')}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <ShoppingCart className="mr-3 h-4 w-4 text-gray-500" />
                    <span>Meu Carrinho</span>
                  </div>
                  {cartCount > 0 && (
                    <Badge className="ml-2 bg-green-600 text-white">{cartCount}</Badge>
                  )}
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem className="p-3 cursor-pointer hover:bg-gray-50">
                <Settings className="mr-3 h-4 w-4 text-gray-500" />
                <span>Configurações</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem 
                className="p-3 cursor-pointer hover:bg-red-50 text-red-600"
                onClick={handleLogout}
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

