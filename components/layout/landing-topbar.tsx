"use client"

import { Button } from "@/components/ui/button"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useStoreSlug } from "@/hooks/use-store-slug"
import { useStoreDataStore } from "@/stores/store-data-store"
import Image from "next/image"
import Link from "next/link"

export function LandingTopbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const { data: session } = useSession()
  
  // 🚀 Usar dados do Zustand como fallback instantâneo
  const { storeData } = useStoreDataStore()
  const { data: storeSlug, isLoading: isLoadingSlug } = useStoreSlug()
  const effectiveStoreData = storeSlug || storeData
  
  const router = useRouter()
  
  const user = session?.user
  const userRole = (user as any)?.role
  const isFornecedor = userRole === 'fornecedor' || userRole === 'loja'
  const displayInitials = ((user?.name || "U").trim().split(/\s+/).map((n) => n.charAt(0)).slice(0, 2).join("") || "U").toUpperCase()
  const slug = effectiveStoreData?.slug

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className="sticky top-1 sm:top-2 z-50">
      <div className="max-w-[84rem] mx-auto px-6 transition-all duration-700 ease-out">
        <div
          className={`flex h-12 sm:h-14 items-center justify-between px-4 transition-all duration-700 ease-out rounded-2xl sm:rounded-3xl
            ${
              isScrolled
                ? "backdrop-blur-2xl bg-white/80 border border-gray-200/50 shadow-xl"
                : "bg-transparent border border-transparent shadow-none"
            }
          `}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 relative overflow-hidden">
              <Image
                src="https://vasfrygscudozjihcgfm.supabase.co/storage/v1/object/public/images/logo.png"
                alt="Orça Norte"
                fill
                priority
                sizes="32px"
                className="object-contain"
              />
            </div>
            <span className="font-bold text-base sm:text-xl text-[#22C55E] font-marlin">
              Orça Norte
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              asChild
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 px-3 sm:px-4 text-sm sm:text-base h-9 sm:h-10 cursor-pointer"
            >
              <Link href="/explorar" prefetch={true}>Explorar Produtos</Link>
            </Button>

            {!user || !isFornecedor ? (
              <Button
                onClick={() => setAuthDialogOpen(true)}
                className="bg-[#22C55E] text-white hover:bg-[#22C55E]/90 transition-all duration-200 px-4 sm:px-6 text-sm sm:text-base h-9 sm:h-10 cursor-pointer"
              >
                Entrar
              </Button>
            ) : null}

            {isFornecedor && (
              slug ? (
                <Button
                  asChild
                  className="bg-[#22C55E] text-white hover:bg-[#22C55E]/90 transition-all duration-200 h-9 sm:h-10 gap-2 px-4 sm:px-6 cursor-pointer"
                >
                  <Link href={`/loja/${slug}`} prefetch={true}>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-white text-[#22C55E] font-semibold text-xs">
                        {displayInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm sm:text-base">Entrar na Loja</span>
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={async () => {
                    if (isLoadingSlug) return
                    // Slug ainda não carregou: tentar buscar diretamente
                    try {
                      const res = await fetch('/api/user/store')
                      if (res.ok) {
                        const data = await res.json()
                        if (data?.slug) {
                          router.push(`/loja/${data.slug}`)
                          return
                        }
                      }
                    } catch {}
                    router.push('/loja/loading')
                  }}
                  disabled={isLoadingSlug}
                  className="bg-[#22C55E] text-white hover:bg-[#22C55E]/90 transition-all duration-200 h-9 sm:h-10 gap-2 px-4 sm:px-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-white text-[#22C55E] font-semibold text-xs">
                      {displayInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm sm:text-base">
                    {isLoadingSlug ? 'Carregando...' : 'Entrar na Loja'}
                  </span>
                </Button>
              )
            )}
          </div>
        </div>
      </div>
      
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        mode="login"
      />
    </header>
  )
}
