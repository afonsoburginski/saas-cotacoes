import * as React from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. Verificar sessão
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    redirect('/')
  }

  // 2. Verificar ROLE - apenas admins podem acessar
  if (session.user.role !== 'admin') {
    redirect('/')
  }

  // 3. Se passou todas as verificações, renderiza o layout
  return <>{children}</>
}

