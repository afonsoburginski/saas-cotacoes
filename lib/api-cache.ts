// Cache em memória compartilhado para APIs públicas
// Evita requisições repetidas ao banco

interface CacheEntry<T> {
  data: T
  timestamp: number
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTTL = 30 * 1000 // 30 segundos padrão

  get<T>(key: string, ttl: number = this.defaultTTL): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  // Limpar cache expirado periodicamente
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.defaultTTL) {
        this.cache.delete(key)
      }
    }
  }
}

// Singleton global
const globalForCache = globalThis as unknown as {
  apiCache: APICache | undefined
}

export const apiCache = globalForCache.apiCache ?? new APICache()

if (process.env.NODE_ENV !== 'production') {
  globalForCache.apiCache = apiCache
}

// Cleanup a cada 5 minutos
if (typeof window === 'undefined') {
  setInterval(() => apiCache.cleanup(), 5 * 60 * 1000)
}

