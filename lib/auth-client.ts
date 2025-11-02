import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  // 🚀 Configurações otimizadas para cache de sessão
  fetchOptions: {
    // Usar cache do navegador para sessão
    cache: "default",
  },
})

export const { 
  signIn, 
  signOut, 
  signUp,
  useSession,
  $Infer
} = authClient

