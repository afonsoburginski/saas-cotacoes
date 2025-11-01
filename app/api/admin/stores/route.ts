import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { stores, storeAdvertisements } from '@/drizzle/schema'
import { desc, eq } from 'drizzle-orm'

export async function GET() {
  try {
    // Buscar lojas com informações de publicidade
    const allStores = await db
      .select({
        store: stores,
        advertisement: storeAdvertisements,
      })
      .from(stores)
      .leftJoin(
        storeAdvertisements,
        eq(stores.id, storeAdvertisements.storeId)
      )
      .orderBy(desc(stores.createdAt))
      .limit(100)

    // Agrupar por loja e processar publicidades
    const storesMap = new Map<number, any>()
    
    console.log('📊 Total de stores retornados:', allStores.length)
    
    allStores.forEach(({ store, advertisement }) => {
      // Debug: verificar se tem publicidade
      if (advertisement) {
        console.log(`🔍 Store ${store.id} (${store.nome}):`, {
          hasAdvertisement: !!advertisement,
          active: advertisement.active,
          imagesCount: Array.isArray(advertisement.images) ? advertisement.images.length : 0,
          startDate: advertisement.startDate,
          endDate: advertisement.endDate,
        })
      }
      if (!storesMap.has(store.id)) {
        storesMap.set(store.id, {
          ...store,
          hasActiveAdvertisement: false,
          activeAdvertisementImagesCount: 0,
        })
      }
      
      const storeData = storesMap.get(store.id)!
      
      // Se tem publicidade
      if (advertisement) {
        // Verificar APENAS a flag active (true ou null = ativo, false = inativo)
        // IGNORA datas completamente
        const isActive = advertisement.active !== false // true ou null são considerados ativos
        const images = Array.isArray(advertisement.images) ? advertisement.images : []
        const hasImages = images.length > 0
        
        if (isActive && hasImages) {
          storeData.hasActiveAdvertisement = true
          storeData.activeAdvertisementImagesCount = images.length
          console.log(`✅ Store ${store.id}: Publicidade ATIVA (flag=${advertisement.active}) com ${images.length} imagens`)
        } else {
          console.log(`❌ Store ${store.id}: Publicidade INATIVA (flag=${advertisement.active}, imagens=${images.length})`)
        }
      }
    })

    const formattedStores = Array.from(storesMap.values())

    return NextResponse.json({
      data: formattedStores,
      total: formattedStores.length,
    })
  } catch (error) {
    console.error('Error fetching stores:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    )
  }
}

