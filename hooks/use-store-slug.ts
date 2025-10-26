import { useQuery } from "@tanstack/react-query"
import { useSession } from "@/lib/auth-client"

interface StoreData {
  slug: string | null
  storeName: string | null
  id: number | null
  logo: string | null
  coverImage: string | null
}

export function useStoreSlug() {
  const { data: session } = useSession()
  
  return useQuery<StoreData | null>({
    queryKey: ["store-slug"],
    queryFn: async () => {
      const res = await fetch("/api/user/store")
      if (!res.ok) return null
      const data = await res.json()
      return {
        slug: data.slug,
        storeName: data.store?.nome,
        id: data.storeId,
        logo: data.store?.logo,
        coverImage: data.store?.coverImage,
      }
    },
    enabled: !!session?.user,
    staleTime: Infinity,
    refetchOnWindowFocus: false, // 🚀 Não recarregar ao focar janela
    refetchOnMount: false, // 🚀 Não recarregar ao montar se já tem cache
  })
}

