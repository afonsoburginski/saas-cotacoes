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
      const res = await fetch("/api/user/store", { 
        cache: 'no-store',
        next: { revalidate: 0 }
      })
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
    staleTime: 0, // 🚀 Sempre refetch para detectar assinaturas novas
    refetchOnWindowFocus: true, // 🚀 Refetch ao focar para detectar mudanças
    refetchOnMount: true, // 🚀 Sempre refetch para verificar se tem plano ativo
    gcTime: 0, // 🚀 Não guardar cache para sempre detectar novos planos
  })
}

