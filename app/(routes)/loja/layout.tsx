import * as React from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/drizzle"
import { user as userTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { stripe } from "@/lib/stripe"
import { LojaSidebar } from "@/components/loja/loja-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

async function checkSubscription(userId: string) {
  const [userData] = await db
    .select({ 
      stripeCustomerId: userTable.stripeCustomerId,
      plan: userTable.plan 
    })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1)

  if (!userData?.stripeCustomerId) {
    return false
  }

  if (!stripe) {
    return false
  }

  try {
    const subs = await stripe.subscriptions.list({
      customer: userData.stripeCustomerId,
      status: 'active',
      limit: 1,
    })

    return subs.data.length > 0
  } catch (error) {
    console.error('Erro ao verificar assinatura:', error)
    return false
  }
}

export default async function LojaLayout({
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

  // 2. Verificar ROLE - apenas fornecedores e lojas podem acessar
  const allowedRoles = ['fornecedor', 'loja', 'servico']
  if (!allowedRoles.includes(session.user.role || '')) {
    redirect('/')
  }

  // 3. Verificação de assinatura ativa
  // NOTA: A verificação de assinatura é feita nas páginas individuais,
  // não no layout. Isso permite acesso flexível à área de gerenciamento
  // e exibição de alertas/prompts para renovar a assinatura.
  // Se quiser bloquear tudo sem assinatura, descomente o código abaixo:
  
  /*
  const hasActiveSub = await checkSubscription(session.user.id)
  if (!hasActiveSub) {
    redirect(`/subscription/expired`)
  }
  */

  // 4. Se passou todas as verificações, renderiza o layout
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--header-height": "3rem",
        } as React.CSSProperties
      }
    >
      <LojaSidebar variant="inset" />
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 lg:p-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

