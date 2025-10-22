"use client"

// Better Auth não precisa de SessionProvider separado
// Ele usa o próprio React Query que já temos configurado
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

