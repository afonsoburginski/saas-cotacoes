import { create } from 'zustand'

interface AdvertisementImage {
  url: string
  storeId: number
  storeName: string
  advertisementId: number
  link: string | null
}

interface AdvertisementsState {
  allAdvertisements: AdvertisementImage[]
  bannerAssignments: Record<string, AdvertisementImage[]> // bannerId -> ads
  registeredBanners: Set<string>
  isFetching: boolean // Flag para evitar múltiplas requisições simultâneas
  fetchAttempted: boolean // Se já tentou fazer fetch (evita loops)
  
  // Ações
  setAllAdvertisements: (ads: AdvertisementImage[]) => void
  setIsFetching: (fetching: boolean) => void
  registerBanner: (bannerId: string) => void
  unregisterBanner: (bannerId: string) => void
  refreshAssignments: () => void
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export const useAdvertisementsStore = create<AdvertisementsState>((set, get) => ({
  allAdvertisements: [],
  bannerAssignments: {},
  registeredBanners: new Set<string>(),
  isFetching: false,
  fetchAttempted: false,

  setIsFetching: (fetching) => {
    set({ isFetching: fetching })
  },

  setAllAdvertisements: (ads) => {
    set({ allAdvertisements: shuffleArray(ads), isFetching: false, fetchAttempted: true })
    // Redistribuir quando novos anúncios chegarem
    get().refreshAssignments()
  },

  registerBanner: (bannerId) => {
    const state = get()
    const newBanners = new Set(state.registeredBanners)
    newBanners.add(bannerId)
    
    set({ registeredBanners: newBanners })
    // Redistribuir quando novo banner se registra
    get().refreshAssignments()
  },

  unregisterBanner: (bannerId) => {
    const state = get()
    const newBanners = new Set(state.registeredBanners)
    newBanners.delete(bannerId)
    
    const newAssignments = { ...state.bannerAssignments }
    delete newAssignments[bannerId]
    
    set({ 
      registeredBanners: newBanners,
      bannerAssignments: newAssignments
    })
    // Redistribuir quando banner é removido
    get().refreshAssignments()
  },


  refreshAssignments: () => {
    const state = get()
    const { allAdvertisements, registeredBanners } = state
    
    if (allAdvertisements.length === 0 || registeredBanners.size === 0) {
      return
    }

    const bannerIds = Array.from(registeredBanners)
    const MAX_ADS = 5
    
    // Embaralhar ordem dos banners e anúncios para distribuição aleatória
    const shuffledBannerIds = shuffleArray(bannerIds)
    const shuffledAds = [...allAdvertisements] // Já vem embaralhado
    
    // Inicializar todos os banners
    const newAssignments: Record<string, AdvertisementImage[]> = {}
    shuffledBannerIds.forEach(id => {
      newAssignments[id] = []
    })
    
    // Se temos menos anúncios que banners, REPETIR anúncios para garantir que todos os banners tenham pelo menos 1
    // (importante para não deixar banners vazios)
    const adsToDistribute = shuffledAds.length < bannerIds.length 
      ? [...shuffledAds, ...shuffledAds, ...shuffledAds] // Triplicar para garantir
      : shuffledAds
    
    // Distribuição round-robin: garantir que TODOS os banners recebam pelo menos 1 anúncio
    let adIndex = 0
    
    // Primeira rodada: dar pelo menos 1 anúncio para cada banner
    for (const bannerId of shuffledBannerIds) {
      if (adIndex < adsToDistribute.length) {
        newAssignments[bannerId].push(adsToDistribute[adIndex])
        adIndex++
      }
    }
    
    // Rodadas subsequentes: continuar distribuindo até MAX_ADS por banner
    for (let round = 1; round < MAX_ADS; round++) {
      for (const bannerId of shuffledBannerIds) {
        if (adIndex < adsToDistribute.length && newAssignments[bannerId].length < MAX_ADS) {
          newAssignments[bannerId].push(adsToDistribute[adIndex])
          adIndex++
        }
      }
      
      // Se acabaram os anúncios, parar
      if (adIndex >= adsToDistribute.length) {
        break
      }
    }
    
    set({ bannerAssignments: newAssignments })
  },
}))

