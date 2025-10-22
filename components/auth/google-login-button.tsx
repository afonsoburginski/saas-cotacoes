"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { FcGoogle } from "react-icons/fc"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface GoogleLoginButtonProps {
  callbackURL?: string
}

export function GoogleLoginButton({ callbackURL = "/onboarding" }: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL,
      })
    } catch (error) {
      console.error("Error logging in with Google:", error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoading}
      variant="outline"
      size="lg"
      className="w-full relative h-12 font-semibold"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Conectando...
        </>
      ) : (
        <>
          <FcGoogle className="mr-2 h-5 w-5" />
          Continuar com Google
        </>
      )}
    </Button>
  )
}

