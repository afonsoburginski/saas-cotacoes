import { auth } from "./auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

/**
 * 🔐 SERVER-SIDE: Pega a sessão atual (use em Server Components/API Routes)
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  return session
}

/**
 * 🔐 SERVER-SIDE: Pega o usuário atual ou redireciona para home
 */
export async function getCurrentUser() {
  const session = await getSession()
  
  if (!session?.user) {
    redirect('/')
  }
  
  return session.user
}

/**
 * 🔐 SERVER-SIDE: Verifica se usuário tem role específica
 */
export async function requireRole(role: string | string[]) {
  const user = await getCurrentUser()
  const roles = Array.isArray(role) ? role : [role]
  
  if (!roles.includes(user.role || '')) {
    redirect('/')
  }
  
  return user
}

/**
 * 🔐 SERVER-SIDE: Verifica se é fornecedor/loja
 */
export async function requireFornecedor() {
  return requireRole(['fornecedor', 'loja'])
}

/**
 * 🔐 SERVER-SIDE: Verifica se é admin
 */
export async function requireAdmin() {
  return requireRole('admin')
}

/**
 * 🔐 SERVER-SIDE: Verifica se é consumidor
 */
export async function requireConsumidor() {
  return requireRole(['consumidor', 'usuario'])
}

/**
 * 🔐 SERVER-SIDE: Atualiza campos customizados do usuário
 */
export async function updateUserFields(userId: string, data: Record<string, any>) {
  // TODO: Implementar atualização via Better Auth API
  // Por enquanto, usar direto no DB via Drizzle
  const { db } = await import('@/drizzle')
  const { user } = await import('@/drizzle/schema')
  const { eq } = await import('drizzle-orm')
  
  await db.update(user).set(data).where(eq(user.id, userId))
}

