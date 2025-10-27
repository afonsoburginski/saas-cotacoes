"use client"

import { useState, useEffect } from "react"

interface UserCookie {
  email?: string
  name?: string
  id?: string
}

// Hook para ler a sessão diretamente do cookie (ultra rápido, sem refetch)
export function useSessionCookie() {
  const [session, setSession] = useState<UserCookie | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Ler cookie do better-auth (prefix: orca-norte)
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(';').shift()
      return null
    }

    try {
      // Tentar ler o cookie de sessão do better-auth
      const sessionCookie = getCookie('orca-norte.session') || getCookie('orca_norte_session')
      
      if (sessionCookie) {
        // O cookie pode estar em formato JWT ou JSON
        try {
          // Tentar decodificar se for base64
          const decoded = atob(sessionCookie)
          const parsed = JSON.parse(decoded)
          setSession({
            email: parsed.user?.email || parsed.email,
            name: parsed.user?.name || parsed.name,
            id: parsed.user?.id || parsed.id,
          })
        } catch (e) {
          // Se falhar, tentar parsear diretamente
          try {
            const parsed = JSON.parse(sessionCookie)
            setSession({
              email: parsed.user?.email || parsed.email,
              name: parsed.user?.name || parsed.name,
              id: parsed.user?.id || parsed.id,
            })
          } catch {
            // Cookie não é JSON válido, buscar de outro jeito
            // Verificar localStorage como fallback
            const localSession = localStorage.getItem('orca-norte.session')
            if (localSession) {
              try {
                const parsed = JSON.parse(localSession)
                setSession({
                  email: parsed.user?.email || parsed.email,
                  name: parsed.user?.name || parsed.name,
                  id: parsed.user?.id || parsed.id,
                })
              } catch {}
            }
          }
        }
      } else {
        // Verificar localStorage como fallback
        const localSession = localStorage.getItem('orca-norte.session')
        if (localSession) {
          try {
            const parsed = JSON.parse(localSession)
            setSession({
              email: parsed.user?.email || parsed.email,
              name: parsed.user?.name || parsed.name,
              id: parsed.user?.id || parsed.id,
            })
          } catch {}
        }
      }
    } catch (error) {
      console.error('Erro ao ler cookie de sessão:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { session, isLoading }
}

