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
import { Settings, LogOut, UserCircle, ShoppingCart, FileText } from "lucide-react"
import { useEffect, useState } from "react"
import { useSession, signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/stores/cart-store"
import { AuthDialog } from "@/components/auth/auth-dialog"
import Image from "next/image"
import Link from "next/link"

export function TopbarDesktop() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const getCartItemsCount = useCartStore((state) => state.getCartItemsCount)
  const [isClient, setIsClient] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const cartCount = isClient ? getCartItemsCount() : 0
  const user = session?.user
  const displayInitials = ((user?.name || "U").trim().split(/\s+/).map((n) => n.charAt(0)).slice(0, 2).join("") || "U").toUpperCase()
  
  const handleLogout = async () => {
    const currentPath = window.location.pathname
    
    await signOut()
    
    // Se estiver em páginas públicas (consumidor), não redireciona
    const publicPaths = ['/explorar', '/carrinho', '/listas', '/categoria', '/fornecedor']
    const isPublicPage = publicPaths.some(path => currentPath.startsWith(path))
    
    if (!isPublicPage) {
      // Páginas de empresa/admin - redireciona pra home
      router.push('/')
    }
    // Senão, permanece na página atual
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
        <Link href="/explorar" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 relative overflow-hidden">
            <Image
              src="https://vasfrygscudozjihcgfm.supabase.co/storage/v1/object/public/images/logo.png"
              alt="Orça Norte"
              fill
              priority
              sizes="32px"
              className="object-contain"
            />
          </div>
          <span className={`font-bold text-xl transition-colors duration-500 ${
            isScrolled ? "text-gray-900" : "text-gray-900"
          }`}>
            Orça Norte
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {!user ? (
            <Button
              onClick={() => setAuthDialogOpen(true)}
              className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white px-6"
            >
              Entrar
            </Button>
          ) : (
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

              {/* Carrinho só para consumidores */}
              {(user as any)?.role === 'consumidor' || (user as any)?.role === 'usuario' ? (
                <>
                  <Link href="/carrinho">
                    <DropdownMenuItem 
                      className="p-3 cursor-pointer hover:bg-gray-50"
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
                  </Link>
                  <Link href="/listas">
                    <DropdownMenuItem 
                      className="p-3 cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <FileText className="mr-3 h-4 w-4 text-gray-500" />
                        <span>Minhas Listas</span>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                </>
              ) : null}

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
          )}
        </div>
        </div>
      </div>
      
      {/* Auth Dialog para usuários não logados (consumidor) */}
      {authDialogOpen && (
        <AuthDialog 
          open={authDialogOpen} 
          onOpenChange={setAuthDialogOpen}
          mode="login"
        />
      )}
    </header>
  )
}

