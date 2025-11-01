"use client"

import { useState, useEffect, useMemo, memo, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Megaphone } from "lucide-react"
import { TypographySmall } from "@/components/ui/typography"
import Image from "next/image"
import Link from "next/link"
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { createBrowserClient } from "@supabase/ssr"
import { useAdvertisementsStore } from "@/stores/advertisements-store"
import { useProducts } from "@/hooks/use-products"
import { ProductCardAdaptive } from "./product-card-adaptive"
import { HorizontalScrollContainer } from "@/components/ui/horizontal-scroll-container"

interface AdvertisementImage {
  url: string
  storeId: number
  storeName: string
  advertisementId: number
  link: string | null
}

interface AdvertisementBannerProps {
  className?: string
  height?: string // Altura customizada (ex: "h-[240px]")
  showProducts?: boolean // Se deve mostrar produtos destacados (apenas para banners de coleção)
  // Altura padrão aumentada: h-[220px] sm:h-[240px] md:h-[260px]
}

const MAX_ADS_PER_BANNER = 5

// Flag global no módulo para garantir que apenas UMA requisição seja feita
// (mais rápido que esperar o estado do Zustand propagar)
let globalFetchInProgress = false

export const AdvertisementBanner = memo(function AdvertisementBanner({ 
  className = "",
  height,
  showProducts = false // Por padrão não mostra produtos (banner menor)
}: AdvertisementBannerProps) {
  // Gerar ID único para este banner
  const bannerIdRef = useRef(`banner-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`)
  const bannerId = bannerIdRef.current

  const { 
    allAdvertisements, 
    bannerAssignments,
    registerBanner, 
    unregisterBanner,
    setAllAdvertisements,
    isFetching,
    setIsFetching,
    fetchAttempted
  } = useAdvertisementsStore()

  // Anúncios deste banner específico (máximo 5) - reagir a mudanças na store
  const advertisements = bannerAssignments[bannerId] || []
  
  const [isLoading, setIsLoading] = useState(true)
  
  // Atualizar loading quando os anúncios chegarem ou quando o fetch terminar
  useEffect(() => {
    // Se já tem anúncios OU se já tentou fazer fetch (mesmo que vazio)
    if (allAdvertisements.length > 0 || advertisements.length > 0 || fetchAttempted) {
      setIsLoading(false)
    }
  }, [allAdvertisements.length, advertisements.length, fetchAttempted])
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'center',
      dragFree: false,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })],
  )
  const [selectedIndex, setSelectedIndex] = useState(0)
  const fetchRef = useRef<(() => Promise<void>) | null>(null)
  
  // Componente interno para buscar produtos por loja específica
  const AdvertisementSlideWithProducts = memo(function AdvertisementSlideWithProducts({ 
    ad, 
    index,
    isSelected,
    bannerHeight,
    showProducts
  }: { 
    ad: AdvertisementImage
    index: number
    isSelected: boolean
    bannerHeight?: string
    showProducts?: boolean
  }) {
    const storeIdStr = ad.storeId.toString()
    
    // Buscar produtos destacados APENAS quando o slide está selecionado E showProducts está habilitado
    const { data: featuredProductsData } = useProducts(
      isSelected && showProducts ? {
        storeId: storeIdStr,
        destacado: true,
      } : undefined
    )
    
    const featuredProducts = useMemo(() => {
      if (!showProducts || !isSelected || !featuredProductsData?.data) return []
      return featuredProductsData.data
    }, [featuredProductsData, isSelected, showProducts])
    
    const storeProfileLink = `/fornecedor/${ad.storeId}`
    
    return (
      <div className="flex-none w-full min-w-0 relative">
        {/* Image - clicável se tiver link ou sempre vai pro perfil */}
        {ad.link ? (
          <a 
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`relative block w-full ${bannerHeight || 'h-[160px] sm:h-[180px] md:h-[200px]'} overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-100 cursor-pointer active:opacity-90 transition-opacity`}
          >
            {ad.url && (
              <Image
                src={ad.url}
                alt={`Publicidade - ${ad.storeName}`}
                fill
                className="object-cover"
                unoptimized
              />
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          </a>
        ) : (
          <Link 
            href={storeProfileLink}
            className={`relative block w-full ${bannerHeight || 'h-[160px] sm:h-[180px] md:h-[200px]'} overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-100 cursor-pointer active:opacity-90 transition-opacity`}
          >
            {ad.url && (
              <Image
                src={ad.url}
                alt={`Publicidade - ${ad.storeName}`}
                fill
                className="object-cover"
                unoptimized
              />
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          </Link>
        )}
        
                {/* Cards de Produtos Destacados - row horizontal na parte inferior */}
                {isSelected && featuredProducts.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/60 to-transparent pt-16 pb-2">
                    <HorizontalScrollContainer>
                      <div className="flex gap-3 px-6 sm:px-8 md:px-10 pb-2">
                        {featuredProducts.map((product) => (
                          <div key={product.id} className="flex-none w-[140px] sm:w-[160px]">
                            <ProductCardAdaptive product={product} alwaysShowButtons={false} />
                          </div>
                        ))}
                      </div>
                    </HorizontalScrollContainer>
                  </div>
                )}
        
        {/* Store Info - sempre leva ao perfil (acima dos produtos se houver, senão na parte inferior) */}
        <div className={`absolute ${isSelected && featuredProducts.length > 0 ? 'top-4' : 'bottom-4'} left-6 right-6 sm:left-8 sm:right-8 md:left-10 md:right-10 z-30`}>
          <Link 
            href={storeProfileLink}
            className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full hover:bg-white active:scale-95 transition-all shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Megaphone className="h-3.5 w-3.5 shrink-0 text-blue-600" />
            <TypographySmall className="font-semibold text-gray-900 text-xs leading-tight line-clamp-1">
              {ad.storeName}
            </TypographySmall>
          </Link>
        </div>
      </div>
    )
  })
  
  AdvertisementSlideWithProducts.displayName = 'AdvertisementSlideWithProducts'

  // Registrar banner ao montar
  useEffect(() => {
    registerBanner(bannerId)
    return () => {
      unregisterBanner(bannerId)
    }
  }, [bannerId, registerBanner, unregisterBanner])

  // Buscar publicidades ativas da API (somente uma vez, a store distribui)
  useEffect(() => {
    // Se já tentou buscar (mesmo que retornou vazio), não tentar novamente
    if (fetchAttempted) {
      setIsLoading(false)
      return
    }

    // Se já tem dados, não precisa buscar novamente
    if (allAdvertisements.length > 0) {
      setIsLoading(false)
      return
    }

    // Se já está fazendo fetch em outro banner, apenas aguardar
    // Verificar tanto a flag global quanto o estado da store
    if (isFetching || globalFetchInProgress) {
      return
    }

    let isMounted = true
    let retryCount = 0
    const maxRetries = 2

    // IMPORTANTE: Marcar como fetching ANTES de iniciar a função async
    // Usar flag global para prevenir race conditions
    globalFetchInProgress = true
    setIsFetching(true)

    async function fetchAdvertisements() {
      let timeoutId: NodeJS.Timeout | null = null

      try {
        // NÃO usar AbortController - deixar a requisição completar mesmo se componente desmontar
        // Isso garante que a store seja atualizada para outros banners
        const fetchPromise = fetch('/api/advertisements/active', {
          cache: 'no-store',
          headers: {
            'Accept': 'application/json',
          }
        })

        // Timeout de 8s
        timeoutId = setTimeout(() => {}, 8000)

        const response = await fetchPromise

        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        if (response.ok) {
          const data = await response.json()
          // IMPORTANTE: Setar dados SEMPRE, mesmo se componente foi desmontado
          // Outros banners ainda montados vão usar os dados
          const ads = (data.data && Array.isArray(data.data)) ? data.data : []
          setAllAdvertisements(ads as AdvertisementImage[])
        } else if (response.status === 500 && retryCount < maxRetries) {
          // Retry em caso de erro 500
          setIsFetching(false) // Permitir retry
          globalFetchInProgress = false
          retryCount++
          setTimeout(() => {
            fetchAdvertisements()
          }, 1000 * retryCount) // Backoff maior
          return
        } else {
          // Erro sem retry - setar vazio
          setAllAdvertisements([])
        }
      } catch (error: any) {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        if (error.name === 'AbortError') {
          // Timeout - tentar novamente se possível (silenciosamente)
          if (retryCount < maxRetries) {
            setIsFetching(false) // Permitir retry
            globalFetchInProgress = false
            retryCount++
            setTimeout(() => {
              fetchAdvertisements()
            }, 2000 * retryCount) // Backoff maior
            return
          }
          // Se esgotou retries, definir como vazio
          setAllAdvertisements([])
        } else if (retryCount < maxRetries) {
          setIsFetching(false) // Permitir retry
          globalFetchInProgress = false
          retryCount++
          setTimeout(() => {
            fetchAdvertisements()
          }, 1000 * retryCount)
          return
        } else {
          // Erro definitivo - definir como vazio
          setAllAdvertisements([])
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        // SEMPRE limpar flags, mesmo se componente foi desmontado
        setIsLoading(false)
        setIsFetching(false)
        globalFetchInProgress = false
      }
    }

    // Salvar referência para uso no realtime
    fetchRef.current = fetchAdvertisements

    fetchAdvertisements()

    return () => {
      isMounted = false
    }
  }, [fetchAttempted, allAdvertisements.length, setAllAdvertisements, isFetching, setIsFetching])

  // Realtime: Escutar mudanças na tabela store_advertisements e stores
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const channel = supabase
      .channel('advertisement-banner-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'store_advertisements',
        },
        async (payload) => {
          console.log('🔄 Advertisement changed - refetching...', payload)
          // Refetch anúncios ativos quando houver mudanças
          if (fetchRef.current) {
            await fetchRef.current()
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'stores',
        },
        async (payload) => {
          // Quando o status da loja muda (aprovado/rejeitado), pode afetar os anúncios
          console.log('🔄 Store status changed - refetching advertisements...', payload)
          if (fetchRef.current) {
            await fetchRef.current()
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  // Atualizar índice quando o carousel mudar
  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    emblaApi.on('select', onSelect)
    onSelect() // Chama uma vez para definir o índice inicial

    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  // Recalcular carousel quando anúncios mudarem (realtime)
  useEffect(() => {
    if (!emblaApi) return
    
    // Pequeno delay para garantir que o DOM foi atualizado
    const timeoutId = setTimeout(() => {
      emblaApi.reInit()
      // Resetar para o primeiro slide se necessário
      if (advertisements.length > 0) {
        emblaApi.scrollTo(0)
      }
    }, 100)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [emblaApi, advertisements.length])

  const handlePrevious = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const handleNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  // Se ainda está carregando OU não tem anúncios, não renderizar
  if (isLoading || advertisements.length === 0) {
    return null
  }

  const hasMultiple = advertisements.length > 1

  return (
    <div className={`relative overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-lg rounded-2xl w-full ${className}`}>
      {/* Carousel Container */}
      <div className="overflow-hidden touch-pan-x w-full" ref={emblaRef}>
        <div className="flex touch-pan-x">
          {advertisements.map((ad, index) => (
            <AdvertisementSlideWithProducts
              key={index}
              ad={ad}
              index={index}
              isSelected={index === selectedIndex}
              bannerHeight={height}
              showProducts={showProducts}
            />
          ))}
        </div>
      </div>

      {/* Navigation Arrows - apenas em telas maiores */}
      {hasMultiple && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 h-7 w-7 rounded-full bg-white/95 hover:bg-white shadow-md active:scale-95 transition-all"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handlePrevious()
            }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 h-7 w-7 rounded-full bg-white/95 hover:bg-white shadow-md active:scale-95 transition-all"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleNext()
            }}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </>
      )}

      {/* Indicators - sempre visíveis */}
      {hasMultiple && (
        <div className="absolute top-3 right-3 z-20 flex gap-1.5 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full">
          {advertisements.map((_, index) => (
            <button
              key={index}
              className={`h-1.5 rounded-full transition-all active:scale-125 ${
                index === selectedIndex
                  ? 'w-6 bg-blue-600'
                  : 'w-1.5 bg-gray-400'
              }`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                scrollTo(index)
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
      
    </div>
  )
})

